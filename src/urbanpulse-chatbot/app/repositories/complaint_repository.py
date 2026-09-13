from abc import ABC, abstractmethod
from uuid import UUID

from app.models.complaint import Complaint, ComplaintStatus


class ComplaintRepository(ABC):

    @abstractmethod
    def create(
        self,
        complaint: Complaint,
    ) -> Complaint:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        complaint_id: UUID,
    ) -> Complaint | None:
        raise NotImplementedError

    @abstractmethod
    def list_all(
        self,
    ) -> list[Complaint]:
        raise NotImplementedError

    @abstractmethod
    def update_status(
        self,
        complaint_id: UUID,
        status: ComplaintStatus,
    ) -> Complaint | None:
        """
        Update the status of an existing complaint.

        Returns:
            Updated complaint, or None if it does not exist.
        """
        raise NotImplementedError