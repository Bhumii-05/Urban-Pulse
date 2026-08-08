from app.rag.document_loader import DocumentLoader


loader = DocumentLoader()

text = loader.load(
    "data/knowledge/municipalWasteProtocal.pdf"
)

print("----- EXTRACTED TEXT -----")
print(text)