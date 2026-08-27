from datetime import datetime

from pydantic import BaseModel, Field

from app.models.suggestion import SuggestionStatus


class SuggestionCreate(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=200,
    )
    description: str = Field(
        min_length=5,
    )


class SuggestionResponse(BaseModel):
    id: int
    submitted_by: int
    title: str
    description: str
    status: SuggestionStatus
    admin_reply: str | None
    reviewed_by: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SuggestionReviewRequest(BaseModel):
    status: SuggestionStatus
    admin_reply: str | None = None
