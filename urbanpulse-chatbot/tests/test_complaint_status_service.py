import sys
from pathlib import Path


# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from uuid import UUID, uuid4

import pytest

from app.models.complaint import (
    Complaint,
    ComplaintStatus,
)
from app.services.complaint_status_service import (
    ComplaintStatusService,
)


class MockComplaintRepository:
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
        complaint_id: UUID,
    ) -> Complaint | None:
        return self.complaints.get(
            complaint_id
        )

    def list_all(self) -> list[Complaint]:
        return list(self.complaints.values())

    def update_status(
        self,
        complaint_id: UUID,
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


def create_service():
    repository = MockComplaintRepository()

    service = ComplaintStatusService(
        repository=repository
    )

    return service, repository


def test_submitted_to_under_review():
    service, repository = create_service()

    complaint = create_complaint()

    repository.create(complaint)

    result = service.update_status(
        complaint_id=complaint.id,
        new_status=ComplaintStatus.UNDER_REVIEW,
    )

    assert result.status == (
        ComplaintStatus.UNDER_REVIEW
    )

    assert repository.complaints[
        complaint.id
    ].status == ComplaintStatus.UNDER_REVIEW


def test_submitted_to_rejected():
    service, repository = create_service()

    complaint = create_complaint()

    repository.create(complaint)

    result = service.update_status(
        complaint_id=complaint.id,
        new_status=ComplaintStatus.REJECTED,
    )

    assert result.status == (
        ComplaintStatus.REJECTED
    )


def test_under_review_to_resolved():
    service, repository = create_service()

    complaint = create_complaint(
        ComplaintStatus.UNDER_REVIEW
    )

    repository.create(complaint)

    result = service.update_status(
        complaint_id=complaint.id,
        new_status=ComplaintStatus.RESOLVED,
    )

    assert result.status == (
        ComplaintStatus.RESOLVED
    )


def test_under_review_to_rejected():
    service, repository = create_service()

    complaint = create_complaint(
        ComplaintStatus.UNDER_REVIEW
    )

    repository.create(complaint)

    result = service.update_status(
        complaint_id=complaint.id,
        new_status=ComplaintStatus.REJECTED,
    )

    assert result.status == (
        ComplaintStatus.REJECTED
    )


@pytest.mark.parametrize(
    "current_status,new_status",
    [
        (
            ComplaintStatus.RESOLVED,
            ComplaintStatus.SUBMITTED,
        ),
        (
            ComplaintStatus.RESOLVED,
            ComplaintStatus.UNDER_REVIEW,
        ),
        (
            ComplaintStatus.RESOLVED,
            ComplaintStatus.REJECTED,
        ),
        (
            ComplaintStatus.REJECTED,
            ComplaintStatus.SUBMITTED,
        ),
        (
            ComplaintStatus.REJECTED,
            ComplaintStatus.UNDER_REVIEW,
        ),
        (
            ComplaintStatus.REJECTED,
            ComplaintStatus.RESOLVED,
        ),
    ],
)
def test_terminal_status_cannot_change(
    current_status,
    new_status,
):
    service, repository = create_service()

    complaint = create_complaint(
        current_status
    )

    repository.create(complaint)

    with pytest.raises(
        ValueError,
        match="Invalid status transition",
    ):
        service.update_status(
            complaint_id=complaint.id,
            new_status=new_status,
        )


def test_missing_complaint():
    service, repository = create_service()

    missing_id = uuid4()

    with pytest.raises(
        ValueError,
        match="Complaint not found",
    ):
        service.update_status(
            complaint_id=missing_id,
            new_status=ComplaintStatus.UNDER_REVIEW,
        )


def test_same_status_returns_existing_complaint():
    service, repository = create_service()

    complaint = create_complaint(
        ComplaintStatus.SUBMITTED
    )

    repository.create(complaint)

    result = service.update_status(
        complaint_id=complaint.id,
        new_status=ComplaintStatus.SUBMITTED,
    )

    assert result.id == complaint.id

    assert result.status == (
        ComplaintStatus.SUBMITTED
    )