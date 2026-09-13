"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Himanshu Bisht
Date of Last Modification: 13 September 2026
Brief Description: Checks the ChromaDB knowledge-base collection, reports its document count and metadata, and verifies whether the collection contains ingested data.
"""

from app.rag.vector_store import ChromaVectorStore

store = ChromaVectorStore(
    persist_directory="data/chroma",
    collection_name="knowledge_base",
)

count = store.count()
print(f"Collection: {store.collection_name}")
print(f"Document count: {count}")
print(f"Info: {store.get_collection_info()}")

# Check if data exists before running queries
if count == 0:
    print("⚠️ Warning: Collection is empty! Ingest your documents first.")
else:
    print("✅ Collection successfully loaded and ready for retrieval.")