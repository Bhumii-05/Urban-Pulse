from app.providers.openai_provider import OpenAIProvider

from app.services.classifier_service import ClassifierService
from app.services.complaint_service import ComplaintService
from app.services.llm_service import LLMService

from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaVectorStore
from app.rag.context_builder import ContextBuilder
from app.rag.rag_service import RAGService


def get_classifier_service() -> ClassifierService:
    """
    Creates and returns a fully configured
    ClassifierService.
    """

    provider = OpenAIProvider()

    return ClassifierService(
        provider=provider,
    )


def get_complaint_service() -> ComplaintService:
    """
    Creates and returns a fully configured
    ComplaintService.
    """

    provider = OpenAIProvider()

    llm_service = LLMService(
        provider=provider,
    )

    return ComplaintService(
        llm_service=llm_service,
    )


def get_rag_service() -> RAGService:
    """
    Creates and returns a fully configured RAGService.
    """

    provider = OpenAIProvider()

    vector_store = ChromaVectorStore(
        persist_directory="data/chroma",
        collection_name="knowledge_base",
    )

    retriever = Retriever(
        embedding_provider=provider,
        vector_store=vector_store,
        top_k=5,
    )

    context_builder = ContextBuilder(
        max_context_chunks=5,
    )

    llm_service = LLMService(
        provider=provider,
    )

    return RAGService(
        retriever=retriever,
        context_builder=context_builder,
        llm_service=llm_service,
    )