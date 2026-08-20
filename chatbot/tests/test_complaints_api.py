import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.api.dependencies import get_complaint_repository
from app.models.complaint import Complaint
from app.repositories.sqlite_complaint_repository import (
    SQLiteComplaintRepository,
)


def create_test_repository(tmp_path):
    return SQLiteComplaintRepository(
        database_path=str(
            tmp_path / "test_complaints.db"
        )
    )


def create_test_complaint() -> Complaint:
    return Complaint(
        complaint_text=(
            "Garbage has been dumped beside the road."
        ),
        category="illegal_dumping",
        severity="high",
        description=(
            "Waste has been dumped in a public area."
        ),
        recommended_action=(
            "Municipal cleanup and inspection."
        ),
        confidence=0.92,
    )


def test_get_complaint_success(tmp_path):
    repository = create_test_repository(
        tmp_path
    )

    complaint = create_test_complaint()

    repository.create(complaint)

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    try:
        response = client.get(
            f"/complaints/{complaint.id}"
        )

        assert response.status_code == 200

        data = response.json()

        assert data["id"] == str(
            complaint.id
        )

        assert data["category"] == (
            complaint.category
        )

        assert data["severity"] == (
            complaint.severity
        )

        assert data["description"] == (
            complaint.description
        )

        assert data["recommended_action"] == (
            complaint.recommended_action
        )

        assert data["confidence"] == (
            complaint.confidence
        )

        assert data["status"] == (
            complaint.status.value
        )

    finally:
        app.dependency_overrides.pop(
            get_complaint_repository,
            None,
        )


def test_get_complaint_not_found(tmp_path):
    repository = create_test_repository(
        tmp_path
    )

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    missing_id = uuid4()

    try:
        response = client.get(
            f"/complaints/{missing_id}"
        )

        assert response.status_code == 404

        data = response.json()

        assert data["detail"] == (
            "Complaint not found."
        )

    finally:
        app.dependency_overrides.pop(
            get_complaint_repository,
            None,
        )


def test_get_complaint_invalid_uuid():
    client = TestClient(app)

    response = client.get(
        "/complaints/not-a-valid-uuid"
    )

    assert response.status_code == 422


def test_get_complaint_persisted_data(tmp_path):
    repository = create_test_repository(
        tmp_path
    )

    complaint = Complaint(
        complaint_text=(
            "A municipal waste bin is overflowing."
        ),
        category="overflowing_bin",
        severity="medium",
        description=(
            "A public waste container is overflowing."
        ),
        recommended_action=(
            "Schedule municipal collection."
        ),
        confidence=0.87,
    )

    repository.create(complaint)

    app.dependency_overrides[
        get_complaint_repository
    ] = lambda: repository

    client = TestClient(app)

    try:
        response = client.get(
            f"/complaints/{complaint.id}"
        )

        assert response.status_code == 200

        data = response.json()

        assert data == {
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