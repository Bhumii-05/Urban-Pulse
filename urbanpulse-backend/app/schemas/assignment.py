from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.assignment import AssignmentStatus


class AssignmentCreate(BaseModel):
    concern_id: int
    worker_id: int


class AssignmentStatusUpdate(BaseModel):
    status: AssignmentStatus


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    concern_id: int
    worker_id: int
    assigned_by: int
    status: AssignmentStatus
    assigned_at: datetime
    completed_at: datetime | None