"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Defines the abstract interface for generating vector embeddings from text for use in the retrieval pipeline.
"""
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