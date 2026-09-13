from pathlib import Path

from ingest_documents import ingest_document


PROJECT_ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = PROJECT_ROOT / "data" / "knowledge"


DOCUMENTS = [
    (
        KNOWLEDGE_DIR / "municipalWasteProtocol.pdf",
        "municipal_guidelines",
    ),
    (
        KNOWLEDGE_DIR / "overviewUrbanPulse.pdf",
        "urbanpulse_platform",
    ),
]


def main() -> None:
    print("=" * 60)
    print("URBANPULSE RAG DEPLOYMENT INGESTION")
    print("=" * 60)

    for document_path, document_type in DOCUMENTS:
        print("\n" + "-" * 60)
        print(f"Document: {document_path.name}")
        print(f"Type: {document_type}")
        print("-" * 60)

        if not document_path.exists():
            raise FileNotFoundError(
                f"Required knowledge document not found: {document_path}"
            )

        ingest_document(
            file_path=str(document_path),
            document_type=document_type,
        )

    print("\n" + "=" * 60)
    print("ALL DOCUMENTS INGESTED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    main()