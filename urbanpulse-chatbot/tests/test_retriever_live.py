import sys
from pathlib import Path

# Add project root directory to Python's module search path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Now project imports will resolve successfully
from app.providers.openai_provider import OpenAIProvider
from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaVectorStore


def main():
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

    questions = [
    "How should organic waste be treated?",
    "How should hazardous waste be treated?",
    "What container should be used for dry recyclable waste?",
]

    for question in questions:
        print("\n")
        print("=" * 60)
        print(f"QUESTION: {question}")
        print("=" * 60)

        results = retriever.retrieve(question)

        for index, result in enumerate(results, start=1):
            print("\n" + "-" * 60)
            print(f"RESULT {index}")
            print(f"Distance: {result.score}")
            print(f"Chunk ID: {result.chunk.id}")
            print(f"Source: {result.chunk.source}")
            print(f"Page: {result.chunk.page}")
            print(f"Text:\n{result.chunk.text[:500]}")


if __name__ == "__main__":
    main()