import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pydantic import ValidationError
from uuid import uuid4

from app.schemas.complaint import (
    ComplaintRequest,
    ComplaintResponse,
)


def test_complaint_request():
    request = ComplaintRequest(
        complaint="Garbage has been dumped near the park."
    )

    assert request.complaint == (
        "Garbage has been dumped near the park."
    )


def test_complaint_request_empty():
    try:
        ComplaintRequest(
            complaint=""
        )
        assert False
    except ValidationError:
        assert True


def test_complaint_response():
    response = ComplaintResponse(
        id=uuid4(),
        category="illegal_dumping",
        severity="medium",
        description="Waste dumped in a public area.",
        recommended_action="Municipal inspection required.",
        confidence=0.91,
        status="pending",
    )

    assert response.category == "illegal_dumping"
    assert response.severity == "medium"
    assert response.confidence == 0.91
    assert response.status == "pending"
    assert response.id is not None


def test_complaint_confidence_validation():
    try:
        ComplaintResponse(
            category="illegal_dumping",
            severity="medium",
            description="Waste dumped in a public area.",
            recommended_action="Municipal inspection required.",
            confidence=1.5,
        )
        assert False
    except ValidationError:
        assert True