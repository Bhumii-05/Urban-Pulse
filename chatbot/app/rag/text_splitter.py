from langchain_text_splitters import RecursiveCharacterTextSplitter

class TextSplitter: 
    """
    Splits extracted document text into smaller,
    overlapping chunks suitable for embeddings and retrieval
    """

    def __init__(
            self,
            chunk_size: int = 1000,
            chunk_overlap: int = 150,
    ):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap= chunk_overlap,
            separators = [
                "\n\n",
                "\n",
                ". ",
                " ",
                "",
            ], 
        )

    def split(self, text: str)-> list[str]:
        """
        Split document text into chunks.

        Args: 
            text: Full extracted document text.

        Returns: 
            List of text chunks.
        """

        if not text or not text.strip():
            return []

        return self.splitter.split_text(text)