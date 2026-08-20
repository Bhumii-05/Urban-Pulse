import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from pydantic import ValidationError

from app.models.complaint import (
    Complaint,
    ComplaintStatus,
)


def valid_complaint_data() -> dict:
    return {
        "complaint_text": "Garbage has been dumped beside the road.",
        "category": "illegal_dumping",
        "severity": "high",
        "description": "Waste has been dumped in a public area.",
        "recommended_action": "Municipal cleanup and inspection.",
        "confidence": 0.92,
    }


def test_complaint_model_creates_successfully():
    complaint = Complaint(
        **valid_complaint_data()
    )

    assert complaint.complaint_text == (
        "Garbage has been dumped beside the road."
    )
    assert complaint.category == "illegal_dumping"
    assert complaint.severity == "high"
    assert complaint.confidence == 0.92


def test_complaint_id_is_generated():
    complaint = Complaint(
        **valid_complaint_data()
    )

    assert complaint.id is not None


def test_complaint_ids_are_unique():
    complaint_one = Complaint(
        **valid_complaint_data()
    )

    complaint_two = Complaint(
        **valid_complaint_data()
    )

    assert complaint_one.id != complaint_two.id


def test_default_status_is_submitted():
    complaint = Complaint(
        **valid_complaint_data()
    )

    assert complaint.status == ComplaintStatus.SUBMITTED


def test_timestamps_are_generated():
    complaint = Complaint(
        **valid_complaint_data()
    )

    assert complaint.created_at is not None
    assert complaint.updated_at is not None


@pytest.mark.parametrize(
    "confidence",
    [
        -0.01,
        1.01,
        -1.0,
        2.0,
    ],
)
def test_confidence_outside_range_is_rejected(
    confidence,
):
    data = valid_complaint_data()
    data["confidence"] = confidence

    with pytest.raises(ValidationError):
        Complaint(**data)


@pytest.mark.parametrize(
    "confidence",
    [
        0.0,
        0.5,
        1.0,
    ],
)
def test_confidence_valid_range_is_accepted(
    confidence,
):
    data = valid_complaint_data()
    data["confidence"] = confidence

    complaint = Complaint(**data)

    assert complaint.confidence == confidence


def test_empty_complaint_text_is_rejected():
    data = valid_complaint_data()
    data["complaint_text"] = ""

    with pytest.raises(ValidationError):
        Complaint(**data)


def test_image_metadata_is_optional():
    complaint = Complaint(
        **valid_complaint_data()
    )

    assert complaint.image_filename is None
    assert complaint.image_mime_type is None
    assert complaint.image_reference is None


def test_image_metadata_can_be_stored():
    complaint = Complaint(
        **valid_complaint_data(),
        image_filename="complaint.jpg",
        image_mime_type="image/jpeg",
        image_reference="images/complaint-123.jpg",
    )

    assert complaint.image_filename == "complaint.jpg"
    assert complaint.image_mime_type == "image/jpeg"
    assert complaint.image_reference == (
        "images/complaint-123.jpg"
    )


def test_complaint_status_can_be_changed():
    complaint = Complaint(
        **valid_complaint_data()
    )

    complaint.status = ComplaintStatus.UNDER_REVIEW

    assert complaint.status == ComplaintStatus.UNDER_REVIEW