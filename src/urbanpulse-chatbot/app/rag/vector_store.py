from abc import ABC, abstractmethod
from pathlib import Path 
from typing import List, Optional

import chromadb
from chromadb.config import Settings

from app.rag.models import (
    Chunk, 
    EmbeddedChunk,
    RetrievalResult,
)


class VectorStore(ABC):
    """
    Abstract interface for vector storage and retrieval.
    """

    @abstractmethod
    def add(
        self,
        embedded_chunks: list[EmbeddedChunk],   
    ) -> None:
        """
        Store embedded chunks.
        """
        raise NotImplementedError

    @abstractmethod
    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[RetrievalResult]:
        """
        Search for the most similar chunks with relevance scores.
        """
        raise NotImplementedError


class ChromaVectorStore(VectorStore):
    """
    ChromaDB implementation of VectorStore interface.
    """

    def __init__(
        self,
        persist_directory: str = "data/chroma",
        collection_name: str = "knowledge_base",
    ):
        """
        Initialize ChromaDB vector store.
        
        Args:
            persist_directory: Directory to persist ChromaDB data.
            collection_name: Name of the collection to use.
        """
        self.persist_directory = Path(persist_directory)
        self.collection_name = collection_name
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory),
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name
        )
    
    def add(
        self,
        embedded_chunks: list[EmbeddedChunk],
    ) -> None:
        """
        Store embedded chunks using upsert for idempotent operations.
        
        Args:
            embedded_chunks: List of embedded chunks to store.
        """
        if not embedded_chunks:
            return
        
        # Prepare data for ChromaDB
        ids = []
        embeddings = []
        documents = []
        metadatas = []
        
        for embedded_chunk in embedded_chunks:
            chunk = embedded_chunk.chunk
            ids.append(chunk.id)
            embeddings.append(embedded_chunk.embedding)
            documents.append(chunk.text)
            
            # Build metadata
            metadata = chunk.metadata.copy() if chunk.metadata else {}
            metadata["source"] = chunk.source
            if chunk.page is not None:
                metadata["page"] = chunk.page
            metadatas.append(metadata)
        
        # Use upsert to handle both new and existing documents
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
    
    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[RetrievalResult]:
        """
        Search ChromaDB using an embedding vector.
        
        Args:
            query_embedding: Embedding vector to search with.
            top_k: Number of results to return.
            
        Returns:
            List of RetrievalResult objects containing chunks and their scores.
            
        Raises:
            ValueError: If top_k is less than or equal to 0.
        """
        if top_k <= 0:
            raise ValueError("top_k must be greater than 0.")
        
        # Query ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )
        
        # Safely extract results with defaults
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        ids = results.get("ids", [[]])[0]
        distances = results.get("distances", [[]])[0]
        
        retrieved_results = []
        
        # Iterate through results using zip for cleaner code
        for chunk_id, document, metadata, distance in zip(
            ids,
            documents,
            metadatas,
            distances,
        ):
            # Extract source and page from metadata
            source = str(metadata.get("source", "unknown"))
            page = metadata.get("page")
            
            # Remove source and page from metadata to avoid duplication
            chunk_metadata = {
                k: v for k, v in metadata.items() 
                if k not in ["source", "page"]
            }
            
            # Create Chunk object
            chunk = Chunk(
                id=chunk_id,
                text=document,
                source=source,
                page=page,
                metadata=chunk_metadata,
            )
            
            # Create RetrievalResult with chunk and distance score
            retrieved_results.append(
                RetrievalResult(
                    chunk=chunk,
                    score=float(distance),
                )
            )
        
        return retrieved_results
    
    def delete_collection(self) -> None:
        """
        Delete the entire collection.
        Useful for testing or cleanup.
        """
        try:
            self.client.delete_collection(self.collection_name)
        except ValueError:
            # Collection doesn't exist, ignore
            pass
    
    def count(self) -> int:
        """
        Get the number of documents in the collection.
        
        Returns:
            Number of documents in the collection.
        """
        return self.collection.count()
    
    def delete_by_ids(self, ids: list[str]) -> None:
        """
        Delete specific documents by their IDs.
        
        Args:
            ids: List of document IDs to delete.
        """
        self.collection.delete(ids=ids)
    
    def get_collection_info(self) -> dict:
        """
        Get information about the current collection.
        
        Returns:
            Dictionary with collection information.
        """
        return {
            "name": self.collection.name,
            "count": self.collection.count(),
            "metadata": self.collection.metadata,
        }
    
    def reset_collection(self) -> None:
        """
        Reset the collection by deleting and recreating it.
        Useful for testing scenarios.
        """
        self.delete_collection()
        self.collection = self.client.create_collection(
            name=self.collection_name
        )