from app.rag.document_loader import DocumentLoader
from app.rag.text_splitter import TextSplitter


loader = DocumentLoader()

pages = loader.load(
    "data/knowledge/municipalWasteProtocal.pdf"
)

splitter = TextSplitter(
    chunk_size=500,
    chunk_overlap=100,
)

chunks = splitter.split(pages)

print(f"Total chunks: {len(chunks)}")

for chunk in chunks:

    print("\n" + "=" * 80)

    print(f"ID: {chunk.id}")
    print(f"Source: {chunk.source}")
    print(f"Page: {chunk.page}")
    print(f"Metadata: {chunk.metadata}")

    print("-" * 80)

    print(chunk.text)