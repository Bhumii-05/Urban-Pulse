from uuid import UUID

from app.models.complaint import Complaint, ComplaintStatus
from app.repositories.complaint_repository import (
    ComplaintRepository,
)


class ComplaintStatusService:
    """
    Handles complaint status transitions.

    Business rules are kept outside the repository.
    """

    ALLOWED_TRANSITIONS = {
        ComplaintStatus.SUBMITTED: {
            ComplaintStatus.UNDER_REVIEW,
            ComplaintStatus.REJECTED,
        },
        ComplaintStatus.UNDER_REVIEW: {
            ComplaintStatus.RESOLVED,
            ComplaintStatus.REJECTED,
        },
        ComplaintStatus.RESOLVED: set(),
        ComplaintStatus.REJECTED: set(),
    }

    def __init__(
        self,
        repository: ComplaintRepository,
    ):
        self.repository = repository

    def update_status(
        self,
        complaint_id: UUID,
        new_status: ComplaintStatus,
    ) -> Complaint:
        """
        Validate and apply a complaint status transition.
        """

        complaint = self.repository.get_by_id(
            complaint_id
        )

        if complaint is None:
            raise ValueError(
                "Complaint not found."
            )

        current_status = complaint.status

        if current_status == new_status:
            return complaint

        allowed_statuses = (
            self.ALLOWED_TRANSITIONS[
                current_status
            ]
        )

        if new_status not in allowed_statuses:
            raise ValueError(
                f"Invalid status transition: "
                f"{current_status.value} -> "
                f"{new_status.value}"
            )

        updated_complaint = (
            self.repository.update_status(
                complaint_id=complaint_id,
                status=new_status,
            )
        )

        if updated_complaint is None:
            raise RuntimeError(
                "Complaint could not be updated."
            )

        return updated_complaint