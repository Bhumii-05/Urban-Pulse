from pathlib import Path

from docx import Document
from pypdf import PdfReader


class DocumentLoader:
    """
    Loads supported knowledge documents and extracts their text.

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

    def load(self, file_path: str) -> str:
        """
        Load a document and return its extracted text.

        Args:
            file_path: Path to the document.

        Returns:
            Extracted document text.

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

    def _load_pdf(self, path: Path) -> str:
        """
        Extract text from a PDF document.
        """

        reader = PdfReader(str(path))

        pages = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n\n".join(pages).strip()

    def _load_txt(self, path: Path) -> str:
        """
        Read text from a TXT file.
        """

        return path.read_text(
            encoding="utf-8"
        ).strip()

    def _load_docx(self, path: Path) -> str:
        """
        Extract paragraphs from a DOCX document.
        """

        document = Document(str(path))

        paragraphs = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n\n".join(paragraphs).strip()