import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from app.services.complaint_service import ComplaintService


class FakeLLMService:
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        return """
        {
            "category": "illegal_dumping",
            "severity": "medium",
            "description": "Waste has been dumped near a public park.",
            "recommended_action": "Municipal inspection and waste collection are recommended.",
            "confidence": 0.91
        }
        """


def test_complaint_service():
    service = ComplaintService(
        llm_service=FakeLLMService()
    )

    result = service.analyze(
        "Someone dumped garbage near the public park."
    )

    assert result.category == "illegal_dumping"
    assert result.severity == "medium"

    assert (
        result.description
        == "Waste has been dumped near a public park."
    )

    assert (
        result.recommended_action
        == "Municipal inspection and waste collection are recommended."
    )

    assert result.confidence == 0.91


def test_empty_complaint():
    service = ComplaintService(
        llm_service=FakeLLMService()
    )

    try:
        service.analyze("")
        assert False
    except ValueError as exc:
        assert str(exc) == "Complaint cannot be empty."