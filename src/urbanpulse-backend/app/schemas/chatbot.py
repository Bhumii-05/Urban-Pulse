"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Bhumika A, Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines request and response schemas for chatbot interactions.
"""
from pydantic import BaseModel, Field

class ChatbotAskRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        description="User's question.",
    )


class ChatbotSource(BaseModel):
    source: str
    page: int | None = None


class ChatbotAskResponse(BaseModel):
    answer: str
    sources: list[ChatbotSource] = Field(
    default_factory=list
)