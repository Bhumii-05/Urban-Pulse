from dotenv import load_dotenv

from app.prompts.rag_prompt import RAGPromptBuilder
from app.providers.openai_provider import OpenAIProvider
from app.rag.context_builder import ContextBuilder
from app.rag.rag_service import RAGService
from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaVectorStore
from app.services.llm_service import LLMService

load_dotenv()

def test_rag_service_pipeline():
    # Instantiate Provider
    openai_provider = OpenAIProvider()

    # Setup Services
    vector_store = ChromaVectorStore(
        persist_directory="data/test_chroma",
        collection_name="test_collection",
    )

    retriever = Retriever(
        embedding_provider=openai_provider,
        vector_store=vector_store,
        top_k=3,
    )

    context_builder = ContextBuilder(
        max_context_chunks=3,
    )

    prompt_builder = RAGPromptBuilder()

    llm_service = LLMService(
        provider=openai_provider,
    )

    # Pipeline Execution
    rag_service = RAGService(
        retriever=retriever,
        context_builder=context_builder,
        prompt_builder=prompt_builder,
        llm_service=llm_service,
    )

    question = "How should I dispose of plastic bottles?"
    response = rag_service.ask(question)

    # Assertions for dictionary response structure
    assert isinstance(response, dict), "RAG service response must be a dictionary."
    assert "answer" in response, "Response dictionary must contain an 'answer' key."
    assert "sources" in response, "Response dictionary must contain a 'sources' key."

    print("\n" + "=" * 70)
    print("ANSWER")
    print("=" * 70)
    print(response["answer"])

    print("\n" + "=" * 70)
    print("SOURCES")
    print("=" * 70)

    for source in response["sources"]:
        print(source)

if __name__ == "__main__":
    test_rag_service_pipeline()