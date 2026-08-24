import sys
from pathlib import Path
from uuid import uuid4

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.models.complaint import Complaint
from app.repositories.sqlite_complaint_repository import (
    SQLiteComplaintRepository,
)


def create_complaint() -> Complaint:
    return Complaint(
        complaint_text="Garbage dumped beside the road.",
        category="illegal_dumping",
        severity="high",
        description="Waste has been dumped in a public area.",
        recommended_action="Municipal cleanup required.",
        confidence=0.92,
    )


def test_create_and_get_complaint(tmp_path):
    database_path = tmp_path / "test.db"

    repository = SQLiteComplaintRepository(
        database_path=str(database_path)
    )

    complaint = create_complaint()

    repository.create(complaint)

    retrieved = repository.get_by_id(
        complaint.id
    )

    assert retrieved is not None
    assert retrieved.id == complaint.id
    assert retrieved.complaint_text == complaint.complaint_text
    assert retrieved.category == complaint.category
    assert retrieved.severity == complaint.severity
    assert retrieved.confidence == complaint.confidence


def test_get_missing_complaint_returns_none(tmp_path):
    repository = SQLiteComplaintRepository(
        database_path=str(tmp_path / "test.db")
    )

    result = repository.get_by_id(uuid4())

    assert result is None


def test_list_all_complaints(tmp_path):
    repository = SQLiteComplaintRepository(
        database_path=str(tmp_path / "test.db")
    )

    complaint_one = create_complaint()

    complaint_two = Complaint(
        complaint_text="Overflowing public garbage bin.",
        category="overflowing_bin",
        severity="medium",
        description="A public waste bin is overflowing.",
        recommended_action="Schedule municipal collection.",
        confidence=0.87,
    )

    repository.create(complaint_one)
    repository.create(complaint_two)

    complaints = repository.list_all()

    assert len(complaints) == 2

    ids = {complaint.id for complaint in complaints}

    assert complaint_one.id in ids
    assert complaint_two.id in ids


def test_image_metadata_is_persisted(tmp_path):
    repository = SQLiteComplaintRepository(
        database_path=str(tmp_path / "test.db")
    )

    base_complaint = create_complaint()
    complaint = base_complaint.model_copy(
        update={
            "image_filename": "garbage.jpg",
            "image_mime_type": "image/jpeg",
            "image_reference": "images/garbage-123.jpg",
        }
    )

    repository.create(complaint)

    retrieved = repository.get_by_id(
        complaint.id
    )

    assert retrieved is not None
    assert retrieved.image_filename == "garbage.jpg"
    assert retrieved.image_mime_type == "image/jpeg"
    assert retrieved.image_reference == (
        "images/garbage-123.jpg"
    )