from app.rag.models import Chunk


chunk = Chunk(
    id="waste_guidelines_001",
    text="Plastic bottles should be cleaned before disposal.",
    source="municipalWasteProtocal.pdf",
    page=4,
    metadata={
        "department": "Waste Management",
        "document_type": "guideline",
    },
)

print(chunk)

print("\nDictionary:")
print(chunk.model_dump())