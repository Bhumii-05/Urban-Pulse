from app.providers.embedding_provider import EmbeddingProvider
from app.providers.openai_provider import OpenAIProvider

from app.rag.context_builder import ContextBuilder
from app.rag.rag_service import RAGService
from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaVectorStore

from app.repositories.complaint_repository import (
    ComplaintRepository,
)
from app.repositories.sqlite_complaint_repository import (
    SQLiteComplaintRepository,
)

from app.services.classifier_service import ClassifierService
from app.services.complaint_service import ComplaintService
from app.services.complaint_status_service import (
    ComplaintStatusService,
)
from app.services.image_storage import ImageStorage
from app.services.llm_service import LLMService
from app.services.local_image_storage import (
    LocalImageStorage,
)


# ============================================================
# Classifier
# ============================================================

def get_classifier_service() -> ClassifierService:
    """
    Creates and returns a fully configured ClassifierService.
    """
    provider = OpenAIProvider()

    return ClassifierService(
        provider=provider,
    )


# ============================================================
# Complaint Repository
# ============================================================

def get_complaint_repository() -> ComplaintRepository:
    """
    Creates the complaint repository used by the complaint services.
    """
    return SQLiteComplaintRepository(
        database_path="data/urban_pulse.db",
    )


# ============================================================
# Image Storage
# ============================================================

def get_image_storage() -> ImageStorage:
    """
    Creates the image storage implementation.

    Local filesystem storage is currently used for development.
    """
    return LocalImageStorage(
        storage_directory="data/uploads",
    )


# ============================================================
# Complaint Service
# ============================================================

def get_complaint_service() -> ComplaintService:
    """
    Creates a fully configured ComplaintService.
    """
    provider = OpenAIProvider()
    repository = get_complaint_repository()
    image_storage = get_image_storage()

    return ComplaintService(
        provider=provider,
        repository=repository,
        image_storage=image_storage,
    )


# ============================================================
# Complaint Status Service
# ============================================================

def get_complaint_status_service() -> ComplaintStatusService:
    """
    Creates a fully configured ComplaintStatusService.
    """
    repository = get_complaint_repository()

    return ComplaintStatusService(
        repository=repository,
    )


# ============================================================
# RAG Service
# ============================================================

def get_embedding_provider() -> EmbeddingProvider:
    """
    Creates the embedding provider used by the RAG retriever.
    """
    return OpenAIProvider()


def get_vector_store() -> ChromaVectorStore:
    """
    Creates the ChromaDB vector store.
    """
    return ChromaVectorStore(
        persist_directory="data/chroma",
        collection_name="knowledge_base",
    )


def get_retriever() -> Retriever:
    """
    Creates the RAG retriever.
    """
    embedding_provider = get_embedding_provider()
    vector_store = get_vector_store()

    return Retriever(
        embedding_provider=embedding_provider,
        vector_store=vector_store,
        top_k=5,
    )


def get_context_builder() -> ContextBuilder:
    """
    Creates the RAG context builder.
    """
    return ContextBuilder(
        max_context_chunks=5,
    )


def get_llm_service() -> LLMService:
    """
    Creates the LLM service.
    """
    provider = OpenAIProvider()

    return LLMService(
        provider=provider,
    )


def get_rag_service() -> RAGService:
    """
    Creates a fully configured RAGService.
    """
    retriever = get_retriever()
    context_builder = get_context_builder()
    llm_service = get_llm_service()

    return RAGService(
        retriever=retriever,
        context_builder=context_builder,
        llm_service=llm_service,
    )