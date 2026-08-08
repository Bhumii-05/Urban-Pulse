from pathlib import Path

from docx import Document
from pypdf import PdfReader

from app.rag.models import DocumentPage


class DocumentLoader:
    """
    Loads supported knowledge documents and extracts their content.

    Supported formats:
    - PDF
    - TXT
    - DOCX
    """

    SUPPORTED_EXTENSIONS = {
        ".pdf",
        ".txt",
        ".docx",
    }

    def load(self, file_path: str) -> list[DocumentPage]:
        """
        Load a document and return page-level extracted content.

        Args:
            file_path: Path to the document.

        Returns:
            List of DocumentPage objects.

        Raises:
            FileNotFoundError:
                If the file does not exist.

            ValueError:
                If the file format is unsupported.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Document not found: {file_path}"
            )

        extension = path.suffix.lower()

        if extension not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported document format: {extension}"
            )

        if extension == ".pdf":
            return self._load_pdf(path)

        if extension == ".txt":
            return self._load_txt(path)

        if extension == ".docx":
            return self._load_docx(path)

        raise ValueError(
            f"Unsupported document format: {extension}"
        )

    def _load_pdf(self, path: Path) -> list[DocumentPage]:
        """
        Extract text from each PDF page separately.
        """

        reader = PdfReader(str(path))

        pages = []

        for page_number, page in enumerate(
            reader.pages,
            start=1,
        ):
            text = page.extract_text() or ""

            pages.append(
                DocumentPage(
                    page_number=page_number,
                    text=text.strip(),
                    metadata={
                        "source": path.name,
                        "file_type": "pdf",
                    },
                )
            )

        return pages

    def _load_txt(self, path: Path) -> list[DocumentPage]:
        """
        Read a TXT file as a single logical page.
        """

        text = path.read_text(
            encoding="utf-8"
        ).strip()

        return [
            DocumentPage(
                page_number=1,
                text=text,
                metadata={
                    "source": path.name,
                    "file_type": "txt",
                },
            )
        ]

    def _load_docx(self, path: Path) -> list[DocumentPage]:
        """
        Extract DOCX paragraphs as a single logical page.

        DOCX does not provide reliable page boundaries
        through python-docx alone.
        """

        document = Document(str(path))

        paragraphs = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        text = "\n\n".join(paragraphs).strip()

        return [
            DocumentPage(
                page_number=1,
                text=text,
                metadata={
                    "source": path.name,
                    "file_type": "docx",
                },
            )
        ]