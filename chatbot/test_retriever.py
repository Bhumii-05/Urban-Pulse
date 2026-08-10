from app.providers.openai_provider import OpenAIProvider
from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaVectorStore
from app.rag.models import Chunk, EmbeddedChunk


def print_section(title: str, char: str = "=") -> None:
    """Print a formatted section header."""
    print(f"\n{char * 70}")
    print(f"  {title}")
    print(f"{char * 70}")


def ensure_vector_store_has_data(
    provider: OpenAIProvider,
    vector_store: ChromaVectorStore,
) -> ChromaVectorStore:
    """
    Ensure the vector store has data. If empty, add sample data.
    
    Args:
        provider: OpenAI provider for embeddings
        vector_store: Vector store to check/populate
        
    Returns:
        Vector store with data
    """
    # Check if vector store has data
    current_count = vector_store.count()
    print(f"📊 Current documents in vector store: {current_count}")
    
    if current_count > 0:
        print("✅ Vector store already has data")
        return vector_store
    
    print("⚠️ Vector store is empty. Adding sample data...")
    
    # Sample documents
    sample_chunks = [
        Chunk(
            id="doc_001",
            text="Plastic bottles should be cleaned before disposal. They are 100% recyclable.",
            source="waste_guidelines.pdf",
            page=4,
            metadata={"category": "recycling", "material": "plastic"},
        ),
        Chunk(
            id="doc_002",
            text="Glass containers are fully recyclable. Rinse them before recycling.",
            source="recycling_guide.pdf",
            page=2,
            metadata={"category": "recycling", "material": "glass"},
        ),
        Chunk(
            id="doc_003",
            text="Organic waste such as food scraps should be composted separately.",
            source="waste_management.pdf",
            page=1,
            metadata={"category": "composting", "material": "organic"},
        ),
        Chunk(
            id="doc_004",
            text="Electronic waste contains hazardous materials. Dispose at collection points.",
            source="ewaste_handling.pdf",
            page=3,
            metadata={"category": "hazardous", "material": "electronic"},
        ),
        Chunk(
            id="doc_005",
            text="Paper and cardboard are recyclable. Keep them clean and dry.",
            source="recycling_guide.pdf",
            page=5,
            metadata={"category": "recycling", "material": "paper"},
        ),
    ]
    
    # Generate embeddings
    print("📝 Generating embeddings for sample chunks...")
    embedded_chunks = []
    
    for i, chunk in enumerate(sample_chunks):
        try:
            embedding = provider.embed(chunk.text)
            if embedding and len(embedding) > 0:
                embedded_chunks.append(
                    EmbeddedChunk(
                        chunk=chunk,
                        embedding=embedding,
                    )
                )
                print(f"  ✅ Chunk {i+1}: Generated {len(embedding)}-dim embedding")
            else:
                print(f"  ⚠️ Chunk {i+1}: Empty embedding generated")
        except Exception as e:
            print(f"  ❌ Chunk {i+1}: Error - {e}")
    
    if not embedded_chunks:
        print("❌ No valid embeddings generated!")
        return vector_store
    
    # Add to vector store
    print(f"💾 Adding {len(embedded_chunks)} chunks to vector store...")
    vector_store.add(embedded_chunks)
    
    new_count = vector_store.count()
    print(f"✅ Added data. New count: {new_count}")
    
    return vector_store


def test_retriever():
    """Main test function."""
    
    print_section("🧪 RETRIEVER TEST", "=")
    
    # ============================================================
    # STEP 1: Initialize provider
    # ============================================================
    print("\n📌 STEP 1: Initializing OpenAIProvider...")
    
    try:
        provider = OpenAIProvider()
        print("✅ OpenAIProvider initialized successfully")
        # Fixed: Use stored attribute instead of accessing client.embeddings.model
        print(f"   Embedding model: {provider.embedding_model}")
        print(f"   LLM model: {provider.llm_model}")
    except Exception as e:
        print(f"❌ Failed to initialize: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # ============================================================
    # STEP 2: Test embedding generation
    # ============================================================
    print("\n📌 STEP 2: Testing embedding generation...")
    
    test_text = "This is a test sentence."
    try:
        test_embedding = provider.embed(test_text)
        print(f"✅ Embedding generated")
        print(f"   Dimension: {len(test_embedding)}")
        print(f"   First 3 values: {test_embedding[:3]}")
        
        if len(test_embedding) == 0:
            print("❌ ERROR: Empty embedding!")
            return
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # ============================================================
    # STEP 3: Set up vector store
    # ============================================================
    print("\n📌 STEP 3: Setting up vector store...")
    
    vector_store = ChromaVectorStore(
        persist_directory="data/test_chroma",
        collection_name="test_collection",
    )
    
    print(f"✅ Vector store created")
    print(f"   Collection: {vector_store.collection_name}")
    
    # Ensure data exists
    vector_store = ensure_vector_store_has_data(provider, vector_store)
    
    if vector_store.count() == 0:
        print("❌ Vector store is empty. Cannot continue.")
        return
    
    # ============================================================
    # STEP 4: Test retriever
    # ============================================================
    print_section("🔍 TESTING RETRIEVER", "-")
    
    retriever = Retriever(
        embedding_provider=provider,
        vector_store=vector_store,
        top_k=3,
    )
    
    print("✅ Retriever created")
    print(f"   Top K: {retriever.top_k}")
    
    # Test queries
    test_queries = [
        "How should I dispose of plastic bottles?",
        "What items can be recycled?",
        "What about electronic waste?",
        "How to handle organic waste?",
        "Can paper be recycled?",
    ]
    
    successful = 0
    
    for query in test_queries:
        print(f"\n{'=' * 70}")
        print(f"📌 Query: {query}")
        print("-" * 70)
        
        try:
            # Generate query embedding
            query_embedding = provider.embed(query)
            print(f"   Query embedding dimension: {len(query_embedding)}")
            
            # Retrieve
            results = retriever.retrieve(query)
            
            if not results:
                print("❌ No results found")
                continue
            
            successful += 1
            print(f"✅ Found {len(results)} results")
            
            # Display results
            for i, result in enumerate(results, 1):
                similarity = 1 - result.score
                print(f"\n   RESULT {i}:")
                print(f"   ─────────────────────")
                print(f"   ID: {result.chunk.id}")
                print(f"   Source: {result.chunk.source} (Page {result.chunk.page})")
                print(f"   Distance: {result.score:.4f}")
                print(f"   Similarity: {similarity:.4f}")
                print(f"   Text: {result.chunk.text[:150]}...")
                if result.chunk.metadata:
                    print(f"   Metadata: {result.chunk.metadata}")
            
            # Show best result
            if results:
                best = results[0]
                print(f"\n   ⭐ BEST RESULT:")
                print(f"      Similarity: {1 - best.score:.4f}")
                print(f"      Text: {best.chunk.text[:100]}...")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    # ============================================================
    # STEP 5: Summary
    # ============================================================
    print_section("📊 SUMMARY", "=")
    
    info = vector_store.get_collection_info()
    print(f"   Collection: {info['name']}")
    print(f"   Documents: {info['count']}")
    print(f"   Embedding dimension: {len(test_embedding)}")
    print(f"   Queries tested: {len(test_queries)}")
    print(f"   Successful: {successful}")
    
    if successful > 0:
        print("\n✅ RETRIEVER IS WORKING CORRECTLY!")
        print("   Results are being returned with scores.")
    else:
        print("\n❌ RETRIEVER FAILED - No results returned!")
        print("\n   Possible causes:")
        print("   1. Vector store is empty")
        print("   2. Embedding dimensions don't match")
        print("   3. OpenAI API key is invalid")
        print("   4. No relevant data for the query")
    
    print_section("✅ TEST COMPLETE", "=")


def quick_test():
    """Quick test with a single query."""
    
    print("=" * 60)
    print("⚡ QUICK RETRIEVER TEST")
    print("=" * 60)
    
    # Initialize
    provider = OpenAIProvider()
    
    vector_store = ChromaVectorStore(
        persist_directory="data/test_chroma",
        collection_name="test_collection",
    )
    
    # Ensure data exists
    vector_store = ensure_vector_store_has_data(provider, vector_store)
    
    if vector_store.count() == 0:
        print("❌ No data available. Exiting.")
        return
    
    # Create retriever
    retriever = Retriever(
        embedding_provider=provider,
        vector_store=vector_store,
        top_k=3,
    )
    
    # Test query
    query = "How should I dispose of plastic bottles?"
    print(f"\n🔍 Query: {query}")
    print("-" * 60)
    
    results = retriever.retrieve(query)
    
    print(f"\n✅ Found {len(results)} results\n")
    
    for i, result in enumerate(results, 1):
        print(f"{'=' * 60}")
        print(f"RESULT {i}")
        print("-" * 60)
        print(f"Chunk ID: {result.chunk.id}")
        print(f"Source: {result.chunk.source}")
        print(f"Page: {result.chunk.page}")
        print(f"Distance: {result.score:.4f}")
        print(f"Similarity: {1 - result.score:.4f}")
        print(f"\nText:\n{result.chunk.text}")
        print()


if __name__ == "__main__":
    # Run full test
    test_retriever()
    
    # Or run quick test
    # quick_test()