import sys
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from app.providers.openai_provider import OpenAIProvider
from app.rag.context_builder import ContextBuilder
from app.rag.rag_service import RAGService
from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaVectorStore
from app.services.llm_service import LLMService


def main():

    # ---------------------------------------------
    # Provider
    # ---------------------------------------------

    provider = OpenAIProvider()

    # ---------------------------------------------
    # Vector store
    # ---------------------------------------------

    vector_store = ChromaVectorStore(
        persist_directory="data/chroma",
        collection_name="knowledge_base",
    )

    # ---------------------------------------------
    # Retriever
    # ---------------------------------------------

    retriever = Retriever(
        embedding_provider=provider,
        vector_store=vector_store,
        top_k=5,
    )

    # ---------------------------------------------
    # Context builder
    # ---------------------------------------------

    context_builder = ContextBuilder(
        max_context_chunks=5,
    )

    # ---------------------------------------------
    # LLM service
    # ---------------------------------------------

    llm_service = LLMService(
        provider=provider,
    )

    # ---------------------------------------------
    # RAG service
    # ---------------------------------------------

    rag_service = RAGService(
        retriever=retriever,
        context_builder=context_builder,
        llm_service=llm_service,
    )

    # ---------------------------------------------
    # Ask question
    # ---------------------------------------------

    question = (
    "What is the municipal tax rate for residential properties?"
)

    result = rag_service.answer(
        question
    )

    # ---------------------------------------------
    # Display result
    # ---------------------------------------------

    print("=" * 60)
    print("RAG + LLM TEST")
    print("=" * 60)

    print("\nQUESTION:")
    print(question)

    print("\nANSWER:")
    print(result["answer"])

    print("\nSOURCES:")

    for source in result["sources"]:
        print(source)


if __name__ == "__main__":
    main()