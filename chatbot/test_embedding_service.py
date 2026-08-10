from app.providers.openai_provider import OpenAIProvider
from app.rag.embedding_service import EmbeddingService
from app.rag.models import Chunk


provider = OpenAIProvider()

embedding_service = EmbeddingService(
    provider=provider
)

chunk = Chunk(
    id="test_chunk_001",
    text="Plastic bottles should be cleaned before disposal.",
    source="municipalWasteProtocal.pdf",
    page=4,
    metadata={
        "file_type": "pdf",
    },
)

embedded_chunk = embedding_service.embed_chunk(
    chunk
)

print("Chunk ID:")
print(embedded_chunk.chunk.id)

print("\nSource:")
print(embedded_chunk.chunk.source)

print("\nPage:")
print(embedded_chunk.chunk.page)

print("\nEmbedding type:")
print(type(embedded_chunk.embedding))

print("\nEmbedding dimensions:")
print(len(embedded_chunk.embedding))

print("\nFirst 10 values:")
print(embedded_chunk.embedding[:10])