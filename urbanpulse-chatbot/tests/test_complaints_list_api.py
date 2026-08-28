import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient

from app.main import app
from app.api.dependencies import get_complaint_repository
from app.models.complaint import Complaint
from app.repositories.sqlite_complaint_repository import (
    SQLiteComplaintRepository,
)


def create_repository(tmp_path):
    return SQLiteComplaintRepository(
        database_path=str(
            tmp_path / "test_complaints.db"
        )
    )


def create_complaint(
    text: str,
    category: str,
    confidence: float,
) -> Complaint:

    return Complaint(
        complaint_text=text,
        category=category,
        severity="medium",
        description="Test complaint.",
        recommended_action="Municipal inspection.",
        confidence=confidence,
    )


def test_list_complaints_empty(tmp_path):
    repository = create_repository(tmp_path)

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    try:
        response = client.get("/api/v1/complaints")

        assert response.status_code == 200

        data = response.json()

        assert data["complaints"] == []
        assert data["total"] == 0

    finally:
        app.dependency_overrides.pop(
            get_complaint_repository,
            None,
        )


def test_list_one_complaint(tmp_path):
    repository = create_repository(tmp_path)

    complaint = create_complaint(
        text="Garbage dumped beside road.",
        category="illegal_dumping",
        confidence=0.91,
    )

    repository.create(complaint)

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    try:
        response = client.get("/api/v1/complaints")

        assert response.status_code == 200

        data = response.json()

        assert data["total"] == 1
        assert len(data["complaints"]) == 1

        result = data["complaints"][0]

        assert result["id"] == str(
            complaint.id
        )

        assert result["category"] == (
            complaint.category
        )

        assert result["confidence"] == (
            complaint.confidence
        )

    finally:
        app.dependency_overrides.pop(
            get_complaint_repository,
            None,
        )


def test_list_multiple_complaints(tmp_path):
    repository = create_repository(tmp_path)

    complaint_one = create_complaint(
        text="Garbage dumped beside road.",
        category="illegal_dumping",
        confidence=0.91,
    )

    complaint_two = create_complaint(
        text="Waste bin is overflowing.",
        category="overflowing_bin",
        confidence=0.88,
    )

    repository.create(complaint_one)
    repository.create(complaint_two)

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    try:
        response = client.get("/api/v1/complaints")

        assert response.status_code == 200

        data = response.json()

        assert data["total"] == 2
        assert len(data["complaints"]) == 2

        ids = {
            item["id"]
            for item in data["complaints"]
        }

        assert str(complaint_one.id) in ids
        assert str(complaint_two.id) in ids

    finally:
        app.dependency_overrides.pop(
            get_complaint_repository,
            None,
        )


def test_list_preserves_persisted_fields(tmp_path):
    repository = create_repository(tmp_path)

    complaint = Complaint(
        complaint_text="Hazardous material found.",
        category="hazardous_waste",
        severity="high",
        description=(
            "Potentially hazardous material "
            "was reported."
        ),
        recommended_action=(
            "Contact municipal hazardous waste team."
        ),
        confidence=0.95,
    )

    repository.create(complaint)

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    try:
        response = client.get("/api/v1/complaints")

        assert response.status_code == 200

        result = response.json()[
            "complaints"
        ][0]

        assert result == {
            "id": str(complaint.id),
            "category": complaint.category,
            "severity": complaint.severity,
            "description": complaint.description,
            "recommended_action": (
                complaint.recommended_action
            ),
            "confidence": complaint.confidence,
            "status": complaint.status.value,
        }

    finally:
        app.dependency_overrides.pop(
            get_complaint_repository,
            None,
        )