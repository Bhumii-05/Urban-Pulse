from uuid import UUID

from pydantic import BaseModel, Field


class MapQuery(BaseModel):
    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    radius: float = Field(
        default=5000,
        gt=0,
        le=50000,
        description="Search radius in meters",
    )


class NearbyWasteBinResponse(BaseModel):
    id: UUID
    bin_code: str
    latitude: float
    longitude: float
    capacity: float
    fill_level: float
    status: str
    distance_meters: float


class NearbyConcernResponse(BaseModel):
    id: int
    category: str
    description: str
    latitude: float
    longitude: float
    status: str
    priority: str
    distance_meters: float


class NearbyCollectionPointResponse(BaseModel):
    id: int
    route_id: int
    waste_bin_id: UUID
    latitude: float
    longitude: float
    sequence_order: int
    status: str
    distance_meters: float