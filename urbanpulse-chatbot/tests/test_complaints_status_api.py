import sys
from pathlib import Path


# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_complaint_status_service
from app.main import app
from app.models.complaint import (
    Complaint,
    ComplaintStatus,
)
from app.repositories.complaint_repository import (
    ComplaintRepository,
)
from app.services.complaint_status_service import (
    ComplaintStatusService,
)


class MockComplaintRepository(ComplaintRepository):
    def __init__(self):
        self.complaints = {}

    def create(
        self,
        complaint: Complaint,
    ) -> Complaint:
        self.complaints[complaint.id] = complaint
        return complaint

    def get_by_id(
        self,
        complaint_id,
    ) -> Complaint | None:
        return self.complaints.get(complaint_id)

    def list_all(self) -> list[Complaint]:
        return list(self.complaints.values())

    def update_status(
        self,
        complaint_id,
        status: ComplaintStatus,
    ) -> Complaint | None:

        complaint = self.complaints.get(
            complaint_id
        )

        if complaint is None:
            return None

        complaint.status = status

        self.complaints[complaint_id] = complaint

        return complaint


def create_repository():
    return MockComplaintRepository()


def create_complaint(
    status: ComplaintStatus = ComplaintStatus.SUBMITTED,
) -> Complaint:
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
        status=status,
    )


def create_status_service(
    repository: ComplaintRepository,
) -> ComplaintStatusService:
    return ComplaintStatusService(
        repository=repository
    )


def test_status_submitted_to_under_review():
    repository = create_repository()

    complaint = create_complaint()

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "under_review"
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["id"] == str(
            complaint.id
        )

        assert data["status"] == (
            "under_review"
        )

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_status_submitted_to_rejected():
    repository = create_repository()

    complaint = create_complaint()

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "rejected"
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["status"] == "rejected"

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_status_under_review_to_resolved():
    repository = create_repository()

    complaint = create_complaint(
        ComplaintStatus.UNDER_REVIEW
    )

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "resolved"
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["status"] == "resolved"

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_status_under_review_to_rejected():
    repository = create_repository()

    complaint = create_complaint(
        ComplaintStatus.UNDER_REVIEW
    )

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "rejected"
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["status"] == "rejected"

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_invalid_status_transition_returns_409():
    repository = create_repository()

    complaint = create_complaint(
        ComplaintStatus.RESOLVED
    )

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "submitted"
            },
        )

        assert response.status_code == 409

        data = response.json()

        assert "Invalid status transition" in (
            data["detail"]
        )

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_rejected_complaint_cannot_be_resolved():
    repository = create_repository()

    complaint = create_complaint(
        ComplaintStatus.REJECTED
    )

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "resolved"
            },
        )

        assert response.status_code == 409

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_missing_complaint_returns_404():
    repository = create_repository()

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    missing_id = uuid4()

    try:
        response = client.patch(
            f"/complaints/{missing_id}/status",
            json={
                "status": "under_review"
            },
        )

        assert response.status_code == 404

        data = response.json()

        assert data["detail"] == (
            "Complaint not found."
        )

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )


def test_invalid_status_value_returns_422():
    client = TestClient(app)

    complaint_id = uuid4()

    response = client.patch(
        f"/complaints/{complaint_id}/status",
        json={
            "status": "invalid_status"
        },
    )

    assert response.status_code == 422


def test_invalid_complaint_uuid_returns_422():
    client = TestClient(app)

    response = client.patch(
        "/complaints/not-a-valid-uuid/status",
        json={
            "status": "under_review"
        },
    )

    assert response.status_code == 422


def test_same_status_returns_200():
    repository = create_repository()

    complaint = create_complaint(
        ComplaintStatus.SUBMITTED
    )

    repository.create(complaint)

    service = create_status_service(
        repository
    )

    app.dependency_overrides[
        get_complaint_status_service
    ] = lambda: service

    client = TestClient(app)

    try:
        response = client.patch(
            f"/complaints/{complaint.id}/status",
            json={
                "status": "submitted"
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["id"] == str(
            complaint.id
        )

        assert data["status"] == "submitted"

    finally:
        app.dependency_overrides.pop(
            get_complaint_status_service,
            None,
        )