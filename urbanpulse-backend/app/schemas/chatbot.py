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