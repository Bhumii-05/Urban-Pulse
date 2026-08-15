import sys
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient

from app.main import app
from app.api.dependencies import get_complaint_service
from app.schemas.complaint import ComplaintResponse


class FakeComplaintService:
    def analyze(
        self,
        complaint: str,
    ) -> ComplaintResponse:
        return ComplaintResponse(
            category="illegal_dumping",
            severity="medium",
            description=(
                "Waste has been dumped near a public park."
            ),
            recommended_action=(
                "Municipal inspection and waste collection "
                "are recommended."
            ),
            confidence=0.91,
        )


def override_complaint_service():
    return FakeComplaintService()


app.dependency_overrides[
    get_complaint_service
] = override_complaint_service


client = TestClient(app)


def test_complaint_api_success():
    response = client.post(
        "/ai/complaint",
        json={
            "complaint": (
                "Someone dumped garbage near the public park."
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "category" in data
    assert "severity" in data
    assert "description" in data
    assert "recommended_action" in data
    assert "confidence" in data

    assert data["category"] == "illegal_dumping"
    assert data["severity"] == "medium"
    assert data["confidence"] == 0.91


def test_complaint_api_empty_complaint():
    response = client.post(
        "/ai/complaint",
        json={
            "complaint": ""
        },
    )

    assert response.status_code == 422


def test_complaint_api_missing_complaint():
    response = client.post(
        "/ai/complaint",
        json={},
    )

    assert response.status_code == 422


def test_complaint_api_confidence_range():
    response = client.post(
        "/ai/complaint",
        json={
            "complaint": (
                "There is garbage dumped near the road."
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert 0.0 <= data["confidence"] <= 1.0