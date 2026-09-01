from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CollectionPointCreate(BaseModel):
    route_id: int
    waste_bin_id: UUID | None = None
    latitude: float = Field(
        ge=-90,
        le=90,
    )
    longitude: float = Field(
        ge=-180,
        le=180,
    )
    sequence_order: int = Field(
        default=1,
        ge=1,
    )


class CollectionPointUpdate(BaseModel):
    waste_bin_id: UUID | None = None
    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90,
    )
    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180,
    )
    sequence_order: int | None = Field(
        default=None,
        ge=1,
    )


class CollectionPointResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    route_id: int
    waste_bin_id: UUID | None = None
    latitude: float
    longitude: float
    sequence_order: int
    status: str
    collected_at: datetime | None = None