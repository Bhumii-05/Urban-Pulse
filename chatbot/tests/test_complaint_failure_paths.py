import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_complaint_service
from app.main import app
from app.providers.llm_provider import LLMProvider
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.sqlite_complaint_repository import (
    SQLiteComplaintRepository,
)
from app.services.complaint_service import ComplaintService


VALID_LLM_RESPONSE = (
    "{"
    '"category": "illegal_dumping",'
    '"severity": "high",'
    '"description": "Waste has been dumped in a public area.",'
    '"recommended_action": "Municipal cleanup and inspection.",'
    '"confidence": 0.92'
    "}"
)


class MockLLMProvider(LLMProvider):
    def __init__(
        self,
        response: str = VALID_LLM_RESPONSE,
        should_fail: bool = False,
    ):
        self.response = response
        self.should_fail = should_fail

    def generate(self, prompt: str) -> str:
        if self.should_fail:
            raise RuntimeError("Mock LLM failure.")
        return self.response

    def generate_with_image(
        self,
        prompt: str,
        image_data: bytes,
        mime_type: str,
    ) -> str:
        if self.should_fail:
            raise RuntimeError("Mock vision LLM failure.")
        return self.response


class FailingRepository(ComplaintRepository):
    def create(self, complaint):
        raise RuntimeError("Database write failed.")

    def get_by_id(self, complaint_id):
        return None

    def list_all(self):
        return []

    def update_status(self, complaint_id, status):
        return None


def create_repository(tmp_path):
    return SQLiteComplaintRepository(
        database_path=str(tmp_path / "failure_test.db")
    )


def create_service(repository, provider=None):
    if provider is None:
        provider = MockLLMProvider()
    return ComplaintService(provider=provider, repository=repository)


def override_service(service):
    app.dependency_overrides[get_complaint_service] = lambda: service


def clear_service_override():
    app.dependency_overrides.pop(get_complaint_service, None)


def test_llm_failure(tmp_path):
    repository = create_repository(tmp_path)
    provider = MockLLMProvider(should_fail=True)
    service = create_service(repository=repository, provider=provider)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "Garbage has been dumped beside the road."},
            files={"image": (None, "")},
        )

        assert response.status_code >= 500
        assert repository.list_all() == []
    finally:
        clear_service_override()


def test_invalid_llm_json(tmp_path):
    repository = create_repository(tmp_path)
    provider = MockLLMProvider(response="This is not valid JSON.")
    service = create_service(repository=repository, provider=provider)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "There is garbage on the street."},
            files={"image": (None, "")},
        )

        assert response.status_code >= 500
        assert repository.list_all() == []
    finally:
        clear_service_override()


def test_llm_response_missing_required_field(tmp_path):
    repository = create_repository(tmp_path)
    incomplete_response = (
        "{"
        '"category": "illegal_dumping",'
        '"severity": "high",'
        '"description": "Waste was dumped illegally.",'
        '"confidence": 0.92'
        "}"
    )

    provider = MockLLMProvider(response=incomplete_response)
    service = create_service(repository=repository, provider=provider)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "Illegal waste dumping was reported."},
            files={"image": (None, "")},
        )

        assert response.status_code >= 500
        assert repository.list_all() == []
    finally:
        clear_service_override()


@pytest.mark.parametrize(
    "confidence",
    [-0.1, 1.1, 2.0, -1.0],
)
def test_invalid_llm_confidence(tmp_path, confidence):
    repository = create_repository(tmp_path)
    response_data = (
        "{"
        '"category": "illegal_dumping",'
        '"severity": "high",'
        '"description": "Waste was dumped illegally.",'
        '"recommended_action": "Municipal cleanup.",'
        f'"confidence": {confidence}'
        "}"
    )

    provider = MockLLMProvider(response=response_data)
    service = create_service(repository=repository, provider=provider)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "Waste has been dumped beside the road."},
            files={"image": (None, "")},
        )

        # Service catches out-of-bounds Pydantic values and returns 400 Bad Request
        assert response.status_code in {400, 422, 500}
        assert repository.list_all() == []
    finally:
        clear_service_override()


def test_database_failure(tmp_path):
    repository = FailingRepository()
    provider = MockLLMProvider()
    service = create_service(repository=repository, provider=provider)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "Garbage has been dumped beside the road."},
            files={"image": (None, "")},
        )

        assert response.status_code >= 500
    finally:
        clear_service_override()


def test_invalid_image_type(tmp_path):
    repository = create_repository(tmp_path)
    service = create_service(repository=repository)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "There is illegal dumping near the road."},
            files={
                "image": (
                    "malicious.exe",
                    b"fake-data",
                    "application/octet-stream",
                )
            },
        )

        assert response.status_code in {400, 415, 422}
        assert repository.list_all() == []
    finally:
        clear_service_override()


def test_empty_image(tmp_path):
    repository = create_repository(tmp_path)
    service = create_service(repository=repository)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "There is garbage on the road."},
            files={
                "image": (
                    "empty.jpg",
                    b"",
                    "image/jpeg",
                )
            },
        )

        # Accepts 200 OK if empty uploaded images fallback to text-only processing
        assert response.status_code in {200, 400, 415, 422}
    finally:
        clear_service_override()


def test_missing_complaint(tmp_path):
    repository = create_repository(tmp_path)
    service = create_service(repository=repository)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={},
            files={"image": (None, "")},
        )

        assert response.status_code == 422
        assert repository.list_all() == []
    finally:
        clear_service_override()


def test_blank_complaint(tmp_path):
    repository = create_repository(tmp_path)
    service = create_service(repository=repository)

    override_service(service)
    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": "   "},
            files={"image": (None, "")},
        )

        assert response.status_code in {400, 422}
        assert repository.list_all() == []
    finally:
        clear_service_override()