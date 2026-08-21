from datetime import datetime

from geoalchemy2.shape import to_shape
from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.models.concern import ConcernPriority, ConcernStatus


class ConcernCreate(BaseModel):
    category: str = Field(
        min_length=1,
        max_length=100,
    )

    description: str = Field(
        min_length=1,
    )

    location: object

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

    location: object | None = None

    priority: ConcernPriority | None = None


class ConcernStatusUpdate(BaseModel):
    status: ConcernStatus

    remarks: str | None = None


class ConcernResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    reported_by: int
    category: str
    description: str
    location: object
    status: ConcernStatus
    priority: ConcernPriority
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: datetime | None

    @field_serializer("location")
    def serialize_location(self, location):
        return to_shape(location).wkt


class ConcernHistoryResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    concern_id: int
    changed_by: int
    old_status: ConcernStatus | None
    new_status: ConcernStatus
    remarks: str | None
    created_at: datetime


class ConcernSupportResponse(BaseModel):
    concern_id: int
    support_count: int
    supported_by_current_user: bool