from app.rag.models import Chunk, EmbeddedChunk
from app.rag.vector_store import ChromaVectorStore

# Create vector store instance
vector_store = ChromaVectorStore(
    persist_directory="data/test_chroma",
    collection_name="test_collection",
)

print(f"✅ ChromaVectorStore instantiated successfully!")
print(f"   Collection: {vector_store.collection_name}")
print(f"   Persist directory: {vector_store.persist_directory}")

# Test adding chunks
embedded_chunks = [
    EmbeddedChunk(
        chunk=Chunk(
            id="test_001",
            text="Plastic bottles should be cleaned before disposal.",
            source="waste_guidelines.pdf",
            page=4,
            metadata={
                "category": "recycling",
                "chunk_index": 1,
            },
        ),
        embedding=[0.1, 0.2, 0.3, 0.4],
    ),
    EmbeddedChunk(
        chunk=Chunk(
            id="test_002",
            text="Glass containers are fully recyclable and should be rinsed.",
            source="recycling_guide.pdf",
            page=2,
            metadata={
                "category": "recycling",
                "chunk_index": 1,
            },
        ),
        embedding=[0.15, 0.25, 0.35, 0.45],
    ),
]

# Add chunks
vector_store.add(embedded_chunks)
print(f"✅ Added {len(embedded_chunks)} chunks")

# Test search with similarity scores
print("\n🔍 Searching for similar chunks...")
query_embedding = [0.1, 0.2, 0.3, 0.4]
results = vector_store.search(query_embedding, top_k=3)

print(f"✅ Found {len(results)} results")
for i, result in enumerate(results, 1):
    print(f"\nResult {i}:")
    print(f"  ID: {result.chunk.id}")
    print(f"  Text: {result.chunk.text[:50]}...")
    print(f"  Source: {result.chunk.source}")
    print(f"  Page: {result.chunk.page}")
    print(f"  Metadata: {result.chunk.metadata}")
    print(f"  Distance Score: {result.score:.4f} (lower = more similar)")

# Test upsert functionality (update existing document)
print("\n🔄 Testing upsert (update existing chunk)...")
updated_chunk = EmbeddedChunk(
    chunk=Chunk(
        id="test_001",  # Same ID as before
        text="Plastic bottles should be cleaned before disposal. Check local recycling guidelines.",
        source="waste_guidelines.pdf",
        page=4,
        metadata={
            "category": "recycling",
            "chunk_index": 1,
            "updated": True,
        },
    ),
    embedding=[0.11, 0.21, 0.31, 0.41],  # Slightly different embedding
)

vector_store.add([updated_chunk])  # Uses upsert internally
print(f"✅ Updated chunk with ID: test_001")

# Verify the update worked
print("\n🔍 Searching after update...")
new_results = vector_store.search(query_embedding, top_k=1)
if new_results:
    print(f"  Updated text: {new_results[0].chunk.text[:50]}...")
    print(f"  Updated metadata: {new_results[0].chunk.metadata}")

# Get collection info
print(f"\n📊 Collection Info:")
info = vector_store.get_collection_info()
for key, value in info.items():
    print(f"  {key}: {value}")

# Optional: Clean up
# vector_store.delete_collection()
# print("🧹 Collection deleted")