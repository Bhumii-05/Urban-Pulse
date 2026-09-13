"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines request, source, and response schemas for AI question-answering data and retrieved source information.
"""

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    """
    Request payload for the RAG question endpoint.
    """

    question: str = Field(
        ...,
        min_length=1,
        description="User's question.",
    )


class AskSource(BaseModel):
    """
    Source information associated with retrieved context.
    """

    source: str
    page: int | None = None


class AskResponse(BaseModel):
    """
    Response returned by the AI question endpoint.
    """

    answer: str
    sources: list[AskSource] = Field(
        default_factory=list
    )