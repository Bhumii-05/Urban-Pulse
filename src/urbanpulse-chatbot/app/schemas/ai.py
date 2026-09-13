"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines request, source, and response schemas for the AI question-answering API.
"""

from pydantic import BaseModel, Field


class AIAskRequest(BaseModel):
    """
    Request model for the AI question-answering endpoint.
    """

    question: str = Field(
        ...,
        min_length=1,
        description="User's question.",
    )


class AISource(BaseModel):
    """
    Source information returned from the RAG pipeline.
    """

    source: str
    page: int | None = None


class AIAskResponse(BaseModel):
    answer: str
    follow_up_questions: list[str] = Field(default_factory=list)
    sources: list = Field(default_factory=list)