import sys
from pathlib import Path
from uuid import UUID
import pytest

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.models.complaint import Complaint, ComplaintStatus
from app.repositories.complaint_repository import ComplaintRepository
from app.services.complaint_service import ComplaintService


# --- Mocks for Testing ---

class InMemoryComplaintRepository(ComplaintRepository):
    """In-memory repository mock for unit testing ComplaintService."""

    def __init__(self):
        self.complaints: dict[UUID, Complaint] = {}

    def create(self, complaint: Complaint) -> Complaint:
        self.complaints[complaint.id] = complaint
        return complaint

    def get_by_id(self, complaint_id: UUID) -> Complaint | None:
        return self.complaints.get(complaint_id)

    def list_all(self) -> list[Complaint]:
        return list(self.complaints.values())

    def update_status(
        self,
        complaint_id: UUID,
        status: ComplaintStatus,
    ) -> Complaint | None:
        complaint = self.get_by_id(complaint_id)
        if complaint is None:
            return None

        complaint.status = status
        return complaint


class MockImageService:
    """Mock for ImageService to bypass heavy validation during service unit tests."""

    def prepare(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> dict:
        return {
            "mime_type": mime_type,
            "data": "fake-base64-image",
        }


class MockLLMProvider:
    """Mock LLM Provider that tracks call state for text vs. image modes."""

    def __init__(self):
        self.generate_called = False
        self.generate_with_image_called = False

    def generate(self, prompt: str) -> str:
        self.generate_called = True
        return """
        {
            "category": "illegal_dumping",
            "severity": "medium",
            "confidence": 0.91,
            "description": "Waste has been dumped near a public park.",
            "recommended_action": "Municipal inspection and waste collection are recommended."
        }
        """

    def generate_with_image(
        self,
        prompt: str,
        image_data: str,
        mime_type: str,
    ) -> str:
        self.generate_with_image_called = True
        assert image_data == "fake-base64-image"
        assert mime_type == "image/jpeg"
        return """
        {
            "category": "illegal_dumping",
            "severity": "medium",
            "confidence": 0.92,
            "description": "The image appears to show waste dumped beside a road.",
            "recommended_action": "Schedule urgent waste cleanup."
        }
        """


# --- Text-Only Tests ---

def test_complaint_service():
    provider = MockLLMProvider()
    repo = InMemoryComplaintRepository()
    service = ComplaintService(provider=provider, repository=repo)

    result = service.analyze(
        "Someone dumped garbage near the public park."
    )

    assert isinstance(result, Complaint)
    assert result.category == "illegal_dumping"
    assert result.severity == "medium"
    assert result.description == "Waste has been dumped near a public park."
    assert (
        result.recommended_action
        == "Municipal inspection and waste collection are recommended."
    )
    assert result.confidence == 0.91
    assert repo.get_by_id(result.id) == result


def test_empty_complaint():
    provider = MockLLMProvider()
    repo = InMemoryComplaintRepository()
    service = ComplaintService(provider=provider, repository=repo)

    with pytest.raises(ValueError, match="Complaint cannot be empty."):
        service.analyze("")


# --- Image Integration & Routing Tests ---

def test_complaint_service_with_image():
    provider = MockLLMProvider()
    repo = InMemoryComplaintRepository()
    image_service = MockImageService()

    service = ComplaintService(
        provider=provider,
        repository=repo,
        image_service=image_service,
    )

    result = service.analyze(
        complaint="There is garbage dumped beside the road.",
        image_data=b"fake-image",
        mime_type="image/jpeg",
        image_filename="garbage.jpg",
    )

    assert isinstance(result, Complaint)
    assert provider.generate_with_image_called is True
    assert result.confidence == 0.92
    assert result.image_filename == "garbage.jpg"
    assert result.image_mime_type == "image/jpeg"
    assert repo.get_by_id(result.id) == result


def test_text_only_complaint_does_not_use_image_generation():
    provider = MockLLMProvider()
    repo = InMemoryComplaintRepository()
    image_service = MockImageService()

    service = ComplaintService(
        provider=provider,
        repository=repo,
        image_service=image_service,
    )

    service.analyze(
        complaint="There is garbage on the road."
    )

    assert provider.generate_called is True
    assert provider.generate_with_image_called is False


def test_image_complaint_uses_image_generation():
    provider = MockLLMProvider()
    repo = InMemoryComplaintRepository()
    image_service = MockImageService()

    service = ComplaintService(
        provider=provider,
        repository=repo,
        image_service=image_service,
    )

    service.analyze(
        complaint="There is garbage on the road.",
        image_data=b"image",
        mime_type="image/jpeg",
    )

    assert provider.generate_called is False
    assert provider.generate_with_image_called is True