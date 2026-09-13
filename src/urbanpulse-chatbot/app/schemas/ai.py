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