import io
import sys
from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
from PIL import Image

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.api.dependencies import (
    get_complaint_repository,
    get_complaint_service,
)
from app.main import app
from app.providers.llm_provider import LLMProvider
from app.repositories.complaint_repository import (
    ComplaintRepository,
)
from app.repositories.sqlite_complaint_repository import (
    SQLiteComplaintRepository,
)
from app.services.complaint_service import (
    ComplaintService,
)


class MockLLMProvider(LLMProvider):
    """
    Fake LLM provider used for integration tests.

    No real OpenAI API calls are made.
    """

    def __init__(
        self,
        response: str | None = None,
        should_fail: bool = False,
    ):
        self.response = response or (
            "{"
            '"category": "illegal_dumping",'
            '"severity": "high",'
            '"description": '
            '"Waste has been dumped in a public area.",'
            '"recommended_action": '
            '"Municipal cleanup and inspection.",'
            '"confidence": 0.92'
            "}"
        )

        self.should_fail = should_fail

    def generate(
        self,
        prompt: str,
    ) -> str:
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


def create_repository(
    tmp_path,
) -> ComplaintRepository:
    return SQLiteComplaintRepository(
        database_path=str(tmp_path / "integration.db")
    )


def create_service(
    repository: ComplaintRepository,
    provider: LLMProvider | None = None,
) -> ComplaintService:
    if provider is None:
        provider = MockLLMProvider()

    return ComplaintService(
        provider=provider,
        repository=repository,
    )


def test_complaint_creation_persists_record(
    tmp_path,
):
    """
    Verify the complete text-only complaint flow:

    HTTP
      ↓
    ComplaintService
      ↓
    LLM
      ↓
    Complaint model
      ↓
    SQLite
    """
    repository = create_repository(tmp_path)
    service = create_service(repository)

    app.dependency_overrides[get_complaint_service] = lambda: service

    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={
                "complaint": "Garbage has been dumped beside the road."
            },
            files={"image": (None, "")},
        )

        assert response.status_code == 200

        data = response.json()

        assert "id" in data

        complaint_id = UUID(data["id"])

        assert data["category"] == "illegal_dumping"
        assert data["severity"] == "high"
        assert data["confidence"] == 0.92
        assert data["status"] == "submitted"

        # Verify actual persistence.
        persisted = repository.get_by_id(complaint_id)

        assert persisted is not None
        assert persisted.id == complaint_id
        assert (
            persisted.complaint_text
            == "Garbage has been dumped beside the road."
        )
        assert persisted.category == "illegal_dumping"

    finally:
        app.dependency_overrides.pop(get_complaint_service, None)


def test_complaint_can_be_created_then_retrieved(
    tmp_path,
):
    """
    Verify POST → SQLite → GET lifecycle.
    """
    repository = create_repository(tmp_path)
    service = create_service(repository)

    app.dependency_overrides[get_complaint_service] = lambda: service
    app.dependency_overrides[get_complaint_repository] = lambda: repository

    client = TestClient(app)

    try:
        create_response = client.post(
            "/ai/complaint",
            data={"complaint": "A waste bin is overflowing."},
            files={"image": (None, "")},
        )

        assert create_response.status_code == 200

        created = create_response.json()
        complaint_id = created["id"]

        get_response = client.get(f"/complaints/{complaint_id}")

        assert get_response.status_code == 200

        retrieved = get_response.json()

        assert retrieved["id"] == complaint_id
        assert retrieved["category"] == "illegal_dumping"
        assert retrieved["severity"] == "high"
        assert retrieved["confidence"] == 0.92
        assert retrieved["status"] == "submitted"

    finally:
        app.dependency_overrides.pop(get_complaint_service, None)
        app.dependency_overrides.pop(get_complaint_repository, None)


def test_complaint_creation_with_image(
    tmp_path,
):
    """
    Verify the text + image complaint path through the actual API.
    """
    repository = create_repository(tmp_path)
    service = create_service(repository)

    app.dependency_overrides[get_complaint_service] = lambda: service

    client = TestClient(app)

    try:
        # Generate a structurally valid PNG file in-memory using Pillow
        buffer = io.BytesIO()
        img = Image.new("RGB", (10, 10), color="red")
        img.save(buffer, format="PNG")
        valid_png_bytes = buffer.getvalue()

        response = client.post(
            "/ai/complaint",
            data={
                "complaint": "There is illegal dumping near the public road."
            },
            files={
                "image": (
                    "dumping.png",
                    valid_png_bytes,
                    "image/png",
                )
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert "id" in data
        assert data["category"] == "illegal_dumping"

        complaint_id = UUID(data["id"])

        persisted = repository.get_by_id(complaint_id)

        assert persisted is not None
        assert persisted.image_filename == "dumping.png"
        assert persisted.image_mime_type == "image/png"

    finally:
        app.dependency_overrides.pop(get_complaint_service, None)


def test_empty_complaint_is_rejected(
    tmp_path,
):
    repository = create_repository(tmp_path)
    service = create_service(repository)

    app.dependency_overrides[get_complaint_service] = lambda: service

    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={"complaint": ""},
            files={"image": (None, "")},
        )

        assert response.status_code == 422

    finally:
        app.dependency_overrides.pop(get_complaint_service, None)


def test_missing_complaint_is_rejected(
    tmp_path,
):
    repository = create_repository(tmp_path)
    service = create_service(repository)

    app.dependency_overrides[get_complaint_service] = lambda: service

    client = TestClient(app)

    try:
        response = client.post(
            "/ai/complaint",
            data={},
            files={"image": (None, "")},
        )

        assert response.status_code == 422

    finally:
        app.dependency_overrides.pop(get_complaint_service, None)