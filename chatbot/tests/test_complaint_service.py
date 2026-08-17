import sys
from pathlib import Path
import pytest

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.services.complaint_service import ComplaintService


# --- Mocks for Testing ---

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
    service = ComplaintService(provider=provider)

    result = service.analyze(
        "Someone dumped garbage near the public park."
    )

    assert result["category"] == "illegal_dumping"
    assert result["severity"] == "medium"
    assert result["description"] == "Waste has been dumped near a public park."
    assert result["recommended_action"] == "Municipal inspection and waste collection are recommended."
    assert result["confidence"] == 0.91


def test_empty_complaint():
    provider = MockLLMProvider()
    service = ComplaintService(provider=provider)

    with pytest.raises(ValueError, match="Complaint cannot be empty."):
        service.analyze("")


# --- Image Integration & Routing Tests ---

def test_complaint_service_with_image():
    provider = MockLLMProvider()
    image_service = MockImageService()

    service = ComplaintService(
        provider=provider,
        image_service=image_service,
    )

    result = service.analyze(
        complaint="There is garbage dumped beside the road.",
        image_data=b"fake-image",
        mime_type="image/jpeg",
    )

    assert result is not None
    assert provider.generate_with_image_called is True
    assert result["confidence"] == 0.92


def test_text_only_complaint_does_not_use_image_generation():
    provider = MockLLMProvider()
    image_service = MockImageService()

    service = ComplaintService(
        provider=provider,
        image_service=image_service,
    )

    service.analyze(
        complaint="There is garbage on the road."
    )

    assert provider.generate_called is True
    assert provider.generate_with_image_called is False


def test_image_complaint_uses_image_generation():
    provider = MockLLMProvider()
    image_service = MockImageService()

    service = ComplaintService(
        provider=provider,
        image_service=image_service,
    )

    service.analyze(
        complaint="There is garbage on the road.",
        image_data=b"image",
        mime_type="image/jpeg",
    )

    assert provider.generate_called is False
    assert provider.generate_with_image_called is True