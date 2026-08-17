from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.concern import ConcernPriority, ConcernStatus


class ConcernCreate(BaseModel):
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    description: str = Field(
        ...,
        min_length=1,
    )

    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
    )

    priority: ConcernPriority = ConcernPriority.MEDIUM


class ConcernUpdate(BaseModel):
    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        min_length=1,
    )

    priority: ConcernPriority | None = None


class ConcernResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reported_by: int
    category: str
    description: str
    status: ConcernStatus
    priority: ConcernPriority
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: datetime | None = None