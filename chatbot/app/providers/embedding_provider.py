from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """
    Interface for embedding generation providers.

    Used by the RAG pipeline to convert text
    into vector representations.
    """

    @abstractmethod
    def embed(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding vector for text.

        Args:
            text: Input text.

        Returns:
            Embedding vector.
        """
        raise NotImplementedError