import sys
from pathlib import Path

# Fix Python path resolution for pytest execution
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from uuid import UUID
import pytest

from app.models.complaint import Complaint
from app.providers.llm_provider import LLMProvider
from app.repositories.complaint_repository import ComplaintRepository
from app.services.complaint_service import ComplaintService


VALID_LLM_RESPONSE = (
    "{\n"
    '  "category": "illegal_dumping",\n'
    '  "severity": "high",\n'
    '  "description": "Waste has been dumped in a public area.",\n'
    '  "recommended_action": "Municipal cleanup and inspection.",\n'
    '  "confidence": 0.92\n'
    "}"
)


class MockLLMProvider(LLMProvider):
    """
    Fake LLM provider supporting both text-only and image-based inference.
    """

    def __init__(self, response: str = VALID_LLM_RESPONSE):
        self.response = response

    def generate(self, prompt: str) -> str:
        return self.response

    def generate_with_image(
        self, prompt: str, image_data: bytes, mime_type: str
    ) -> str:
        return self.response


class MockComplaintRepository(ComplaintRepository):
    """
    In-memory complaint repository for tracking write operations.
    """

    def __init__(self):
        self.complaints = {}
        self.create_calls = 0
        self.should_fail = False

    def create(self, complaint: Complaint) -> Complaint:
        self.create_calls += 1

        if self.should_fail:
            raise RuntimeError("Database write failed.")

        self.complaints[complaint.id] = complaint
        return complaint

    def get_by_id(self, complaint_id: UUID) -> Complaint | None:
        return self.complaints.get(complaint_id)

    def list_all(self) -> list[Complaint]:
        return list(self.complaints.values())

    def update_status(self, complaint_id: UUID, status) -> Complaint | None:
        complaint = self.complaints.get(complaint_id)
        if complaint is None:
            return None

        complaint.status = status
        return complaint


class MockImageService:
    """
    Fake image service that mimics dictionary outputs for prepare().
    """

    def __init__(self, should_fail: bool = False):
        self.should_fail = should_fail
        self.prepare_calls = 0

    def prepare(self, image_data: bytes, mime_type: str) -> dict[str, str | bytes]:
        self.prepare_calls += 1

        if self.should_fail:
            raise RuntimeError("Image storage failed.")

        return {
            "data": image_data,
            "mime_type": mime_type,
        }


def create_service(
    repository=None,
    image_storage=None,
    llm_response: str = VALID_LLM_RESPONSE,
):
    if repository is None:
        repository = MockComplaintRepository()

    if image_storage is None:
        image_storage = MockImageService()

    provider = MockLLMProvider(response=llm_response)

    return (
        ComplaintService(
            provider=provider,
            repository=repository,
            image_service=image_storage,
        ),
        repository,
        image_storage,
    )


# ============================================================================
# Test Cases
# ============================================================================


def test_text_only_complaint_does_not_prepare_image():
    service, repository, image_storage = create_service()

    result = service.analyze(complaint="Garbage has been dumped beside the road.")

    assert result is not None
    assert image_storage.prepare_calls == 0
    assert result.image_filename is None
    assert result.image_mime_type is None
    assert len(repository.complaints) == 1


def test_image_complaint_prepares_and_attaches_metadata():
    service, repository, image_storage = create_service()

    image_data = b"fake-image-bytes"

    result = service.analyze(
        complaint="Illegal dumping near the road.",
        image_data=image_data,
        mime_type="image/jpeg",
        image_filename="dumping.jpg",
    )

    assert result is not None
    assert image_storage.prepare_calls == 1
    assert result.image_filename == "dumping.jpg"
    assert result.image_mime_type == "image/jpeg"
    assert result.category == "illegal_dumping"


def test_missing_mime_type_raises_value_error():
    service, _, _ = create_service()

    with pytest.raises(ValueError, match="Image MIME type is required."):
        service.analyze(
            complaint="Dumped trash on pavement.",
            image_data=b"some-bytes",
            mime_type=None,
        )


def test_empty_complaint_text_raises_value_error():
    service, _, _ = create_service()

    with pytest.raises(ValueError, match="Complaint cannot be empty."):
        service.analyze(complaint="   ")


def test_image_preparation_failure_prevents_persistence():
    repository = MockComplaintRepository()
    image_storage = MockImageService(should_fail=True)

    service, _, _ = create_service(
        repository=repository, image_storage=image_storage
    )

    with pytest.raises(RuntimeError, match="Image storage failed"):
        service.analyze(
            complaint="Illegal dumping detected.",
            image_data=b"image-data",
            mime_type="image/jpeg",
            image_filename="evidence.jpg",
        )

    assert repository.create_calls == 0
    assert len(repository.complaints) == 0


def test_markdown_wrapped_json_response_parsed_successfully():
    fenced_llm_response = f"```json\n{VALID_LLM_RESPONSE}\n```"

    service, repository, _ = create_service(llm_response=fenced_llm_response)

    result = service.analyze(complaint="Trash leaking chemicals in park.")

    assert result.category == "illegal_dumping"
    assert result.severity == "high"
    assert result.confidence == 0.92
    assert len(repository.complaints) == 1