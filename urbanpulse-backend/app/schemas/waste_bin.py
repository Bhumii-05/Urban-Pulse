from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.waste_bin import WasteBinStatus


class WasteBinCreate(BaseModel):
    bin_code: str = Field(
        min_length=1,
        max_length=50,
    )

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    capacity: float = Field(
        gt=0,
    )

    fill_level: float = Field(
        default=0.0,
        ge=0,
    )


class WasteBinUpdate(BaseModel):
    bin_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

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

    capacity: float | None = Field(
        default=None,
        gt=0,
    )


class WasteBinFillLevelUpdate(BaseModel):
    fill_level: float = Field(
        ge=0,
    )


class WasteBinResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    bin_code: str
    latitude: float
    longitude: float
    capacity: float
    fill_level: float
    status: WasteBinStatus