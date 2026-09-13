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