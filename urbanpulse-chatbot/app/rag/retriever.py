from app.providers.embedding_provider import EmbeddingProvider
from app.rag.models import RetrievalResult
from app.rag.vector_store import VectorStore


class Retriever:
    """
    Retrieves relevant knowledge chunks for a user query.

    The retriever is responsible for:
    1. Embedding the user query.
    2. Searching the vector store.
    3. Returning relevant chunks with scores.
    """

    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        vector_store: VectorStore,
        top_k: int = 5,
    ):
        if top_k <= 0:
            raise ValueError(
                "top_k must be greater than 0."
            )

        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.top_k = top_k

    def retrieve(
        self,
        query: str,
    ) -> list[RetrievalResult]:
        """
        Retrieve relevant chunks for a user query.

        Args:
            query: User's natural-language question.

        Returns:
            List of RetrievalResult objects.
        """

        if not query or not query.strip():
            return []

        query = query.strip()

        query_embedding = (
            self.embedding_provider.embed(
                query
            )
        )

        results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=self.top_k,
        )

        return results