from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.suggestion import SuggestionStatus, SuggestionType


class SuggestionCreate(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=200,
    )

    description: str = Field(
        min_length=5,
    )

    suggestion_type: SuggestionType = SuggestionType.GENERAL

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

    @model_validator(mode="after")
    def validate_coordinates(self):
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must be provided together")

        return self


class SuggestionResponse(BaseModel):
    id: int
    submitted_by: int
    title: str
    description: str
    suggestion_type: SuggestionType
    latitude: float | None
    longitude: float | None
    status: SuggestionStatus
    admin_reply: str | None
    reviewed_by: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SuggestionReviewRequest(BaseModel):
    status: SuggestionStatus

    admin_reply: str | None = Field(
        default=None,
        max_length=2000,
    )
