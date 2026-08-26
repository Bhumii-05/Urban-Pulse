import sys
from pathlib import Path
from uuid import UUID, uuid4

import pytest

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.models.complaint import Complaint, ComplaintStatus
from app.repositories.complaint_repository import ComplaintRepository


# ============================================================
# IN-MEMORY REPOSITORY IMPLEMENTATION
# ============================================================

class InMemoryComplaintRepository(ComplaintRepository):
    def __init__(self):
        self.complaints: dict[UUID, Complaint] = {}

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
        return self.complaints.get(complaint_id)

    def list_all(self) -> list[Complaint]:
        return list(self.complaints.values())

    def update_status(
        self,
        complaint_id: UUID,
        status: ComplaintStatus,
    ) -> Complaint | None:
        complaint = self.get_by_id(complaint_id)
        if complaint is None:
            return None

        complaint.status = status
        return complaint


# ============================================================
# HELPER FIXTURES & DATA GENERATOR
# ============================================================

def create_sample_complaint() -> Complaint:
    return Complaint(
        complaint_text="Garbage dumped on main street.",
        category="illegal_dumping",
        severity="medium",
        description="Road side dumping",
        recommended_action="Dispatch cleanup crew",
        confidence=0.9,
    )


@pytest.fixture
def repo():
    return InMemoryComplaintRepository()


# ============================================================
# REPOSITORY UNIT TESTS
# ============================================================

def test_create_complaint(repo):
    complaint = create_sample_complaint()
    created = repo.create(complaint)

    assert created == complaint
    assert repo.get_by_id(complaint.id) == complaint


def test_get_by_id_returns_none_when_not_found(repo):
    non_existent_id = uuid4()
    result = repo.get_by_id(non_existent_id)

    assert result is None


def test_list_all_complaints(repo):
    c1 = create_sample_complaint()
    c2 = create_sample_complaint()

    repo.create(c1)
    repo.create(c2)

    all_complaints = repo.list_all()

    assert len(all_complaints) == 2
    assert c1 in all_complaints
    assert c2 in all_complaints


def test_update_status_success(repo):
    complaint = create_sample_complaint()
    repo.create(complaint)

    updated = repo.update_status(complaint.id, ComplaintStatus.UNDER_REVIEW)

    assert updated is not None
    assert updated.status == ComplaintStatus.UNDER_REVIEW
    assert repo.get_by_id(complaint.id).status == ComplaintStatus.UNDER_REVIEW


def test_update_status_returns_none_when_not_found(repo):
    non_existent_id = uuid4()
    result = repo.update_status(non_existent_id, ComplaintStatus.RESOLVED)

    assert result is None