"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Bhumika A
Date of Last Modification: 13 September 2026
Brief Description: Defines request and response schemas for worker assignments.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.assignment import AssignmentStatus


class AssignmentCreate(BaseModel):
    concern_id: int
    worker_id: int


class AssignmentStatusUpdate(BaseModel):
    status: AssignmentStatus
    issue_reason: str | None = None


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    concern_id: int
    worker_id: int
    assigned_by: int
    status: AssignmentStatus
    issue_reason: str | None = None
    assigned_at: datetime
    completed_at: datetime | None