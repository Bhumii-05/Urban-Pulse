import sys
from pathlib import Path

# Add project root directory to Python's module search path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Now project imports will resolve successfully
from app.providers.openai_provider import OpenAIProvider
from app.rag.document_loader import DocumentLoader
from app.rag.embedding_service import EmbeddingService
from app.rag.text_splitter import TextSplitter
from app.rag.vector_store import ChromaVectorStore


def ingest_document(file_path: str) -> None:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {file_path}")

    print("=" * 60)
    print("DOCUMENT INGESTION STARTED")
    print("=" * 60)

    # 1. Load document
    print(f"\n[1/5] Loading document: {path}")
    loader = DocumentLoader()
    pages = loader.load(str(path))
    print(f"Loaded {len(pages)} document pages.")

    # 2. Split document
    print("\n[2/5] Splitting document into chunks...")
    splitter = TextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split(pages)
    print(f"Created {len(chunks)} chunks.")

    if not chunks:
        raise RuntimeError("No chunks were created from the document.")

    # 3. Initialize provider
    print("\n[3/5] Initializing OpenAI provider...")
    provider = OpenAIProvider()

    # 4. Generate embeddings
    print("\n[4/5] Generating embeddings...")
    embedding_service = EmbeddingService(provider=provider)
    embedded_chunks = embedding_service.embed_chunks(chunks)
    print(f"Generated {len(embedded_chunks)} embeddings.")

    if not embedded_chunks:
        raise RuntimeError("No embeddings were generated.")

    # 5. Store embeddings in ChromaDB
    print("\n[5/5] Storing embeddings in ChromaDB...")
    vector_store = ChromaVectorStore(
        persist_directory="data/chroma",
        collection_name="knowledge_base",
    )

    before_count = vector_store.count()
    print(f"Documents in ChromaDB before ingestion: {before_count}")

    vector_store.add(embedded_chunks)

    after_count = vector_store.count()
    print(f"Documents in ChromaDB after ingestion: {after_count}")

    print("\n" + "=" * 60)
    print("DOCUMENT INGESTION COMPLETED")
    print("=" * 60)
    print(f"Source: {path.name}")
    print(f"Pages: {len(pages)}")
    print(f"Chunks: {len(chunks)}")
    print(f"Embeddings: {len(embedded_chunks)}")
    print(f"ChromaDB documents: {after_count}")


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage:\npython scripts/ingest_documents.py <document_path>")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        ingest_document(file_path)
    except Exception as exc:
        print(f"\nERROR: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()