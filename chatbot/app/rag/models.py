from pydantic import BaseModel, Field


class DocumentPage(BaseModel):
    """
    Represents the extracted content of a single document page.
    """

    page_number: int = Field(
        ...,
        ge=1,
        description="1-based page number.",
    )

    text: str = Field(
        ...,
        description="Extracted text from the page.",
    )

    metadata: dict[str, str | int | float | bool] = Field(
        default_factory=dict,
        description="Metadata associated with the page.",
    )


class Chunk(BaseModel):
    """
    Represents a single chunk of knowledge used by the RAG pipeline.
    """

    id: str = Field(
        ...,
        description="Unique identifier for the chunk.",
    )

    text: str = Field(
        ...,
        description="Text content of the chunk.",
    )

    source: str = Field(
        ...,
        description="Original document filename or source.",
    )

    page: int | None = Field(
        default=None,
        ge=1,
        description="Page number of the source document, if available.",
    )

    metadata: dict[str, str | int | float | bool] = Field(
        default_factory=dict,
        description="Additional metadata associated with the chunk.",
    )

class EmbeddedChunk(BaseModel):
    """
    Represents a chunk together with its embedding vector.
    """

    chunk: Chunk = Field(
        ...,
        description="Original chunk associated with the embedding.",
    )

    embedding: list[float] = Field(
        ...,
        description="Vector representation of the chunk text.",
    )

class RetrievalResult(BaseModel):
    """
    Represents a retrieved chunk and its relevance score.
    """

    chunk: Chunk = Field(
        ...,
        description="Retrieved knowledge chunk.",
    )

    score: float = Field(
        ...,
        description="Relevance score returned by the vector store.",
    )