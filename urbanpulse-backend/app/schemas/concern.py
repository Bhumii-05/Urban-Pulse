from datetime import datetime

from geoalchemy2.shape import to_shape
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_serializer,
)

from app.models.concern import (
    ConcernPriority,
    ConcernStatus,
)

class ConcernLocation(BaseModel):
    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )


class ConcernCreate(BaseModel):
    category: str = Field(
        min_length=1,
        max_length=100,
    )

    description: str = Field(
        min_length=1,
    )

    location: ConcernLocation


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

    location: ConcernLocation | None = None

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
        if location is None:
            return None

        shape = to_shape(location)

        return {
            "latitude": shape.y,
            "longitude": shape.x,
        }


class NearbyConcernResponse(BaseModel):
    id: int
    category: str
    description: str
    location: ConcernLocation
    status: ConcernStatus
    priority: ConcernPriority
    distance_meters: float
    support_count: int


class ConcernCreateResponse(BaseModel):
    created: bool
    message: str
    concern: ConcernResponse | None = None
    nearby_concern: NearbyConcernResponse | None = None


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