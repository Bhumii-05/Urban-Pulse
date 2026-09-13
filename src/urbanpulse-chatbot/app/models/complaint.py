from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ComplaintStatus(str, Enum):
    """
    Current lifecycle status of a complaint.
    """

    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class Complaint(BaseModel):
    """
    Domain model representing a persisted complaint.

    This model contains both the original complaint
    and the AI-generated analysis.
    """

    id: UUID = Field(
        default_factory=uuid4,
    )

    complaint_text: str = Field(
        ...,
        min_length=1,
    )

    category: str = Field(
        ...,
        min_length=1,
    )

    severity: str = Field(
        ...,
        min_length=1,
    )

    description: str = Field(
        ...,
        min_length=1,
    )

    recommended_action: str = Field(
        ...,
        min_length=1,
    )

    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )

    status: ComplaintStatus = Field(
        default=ComplaintStatus.SUBMITTED,
    )

    image_filename: str | None = None

    image_mime_type: str | None = None

    image_reference: str | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )