from app.providers.embedding_provider import EmbeddingProvider
from app.rag.models import Chunk, EmbeddedChunk


class EmbeddingService:
    """
    Generates embeddings for RAG chunks.

    This service is independent of the specific embedding
    provider being used.
    """

    def __init__(
        self,
        provider: EmbeddingProvider,
    ):
        self.provider = provider

    def embed(self, text: str) -> list[float]:
        """
        Generate an embedding vector directly for a string of text.
        
        Args:
            text: Raw text to generate embedding for.
            
        Returns:
            List of floats representing the embedding vector.
        """
        return self.provider.embed(text)

    def embed_chunk(
        self,
        chunk: Chunk,
    ) -> EmbeddedChunk:
        """
        Generate an embedding for a single chunk.

        Args:
            chunk: Chunk whose text should be embedded.

        Returns:
            EmbeddedChunk containing the original chunk
            and its embedding vector.
        """

        embedding = self.provider.embed(
            chunk.text
        )

        return EmbeddedChunk(
            chunk=chunk,
            embedding=embedding,
        )

    def embed_chunks(
        self,
        chunks: list[Chunk],
    ) -> list[EmbeddedChunk]:
        """
        Generate embeddings for multiple chunks.

        Args:
            chunks: List of chunks to embed.

        Returns:
            List of EmbeddedChunk objects.
        """

        embedded_chunks = []

        for chunk in chunks:
            embedded_chunk = self.embed_chunk(
                chunk
            )

            embedded_chunks.append(
                embedded_chunk
            )

        return embedded_chunks