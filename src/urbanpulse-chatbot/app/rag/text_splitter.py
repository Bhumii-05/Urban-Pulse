"""
text_splitter.py
Splits document pages into smaller, overlapping chunks suitable for embeddings and retrieval.
Includes comprehensive text cleaning to remove all PDF extraction artifacts including hollow bullets.
"""

import re
from pathlib import Path
from typing import List, Optional

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.rag.models import Chunk, DocumentPage


class TextSplitter:
    """
    Splits document pages into smaller chunks while preserving source and page metadata.
    Includes aggressive text cleaning to remove PDF extraction artifacts.
    """

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 150,
        clean_text: bool = True,
        remove_page_headers: bool = True,
        remove_bullet_noise: bool = True,
    ):
        """
        Initialize the text splitter.

        Args:
            chunk_size: Target size for each chunk in characters
            chunk_overlap: Number of characters to overlap between chunks
            clean_text: Whether to clean the text before splitting
            remove_page_headers: Whether to remove page headers/footers
            remove_bullet_noise: Whether to remove standalone bullets/numbers

        Raises:
            ValueError: If chunk_size or chunk_overlap are invalid
        """
        if chunk_size <= 0:
            raise ValueError("chunk_size must be greater than 0.")

        if chunk_overlap < 0:
            raise ValueError("chunk_overlap cannot be negative.")

        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be smaller than chunk_size.")

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.clean_text = clean_text
        self.remove_page_headers = remove_page_headers
        self.remove_bullet_noise = remove_bullet_noise

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",  # Paragraph breaks
                "\n",  # Line breaks
                ". ",  # Sentences
                " ",  # Words
                "",  # Characters
            ],
            keep_separator=False,
        )

    def split(
        self,
        pages: list[DocumentPage],
    ) -> list[Chunk]:
        """
        Split document pages into Chunk objects with cleaning.

        Args:
            pages: Page-level document content.

        Returns:
            List of chunks with metadata.
        """
        chunks: list[Chunk] = []

        for page in pages:
            if not page.text or not page.text.strip():
                continue

            text = page.text

            # Clean the text if enabled
            if self.clean_text:
                text = self._clean_text(text)

            # Split into chunks
            page_chunks = self.splitter.split_text(text)

            # Post-process chunks to remove any remaining noise
            if self.remove_bullet_noise:
                page_chunks = [
                    self._clean_chunk(chunk) for chunk in page_chunks
                ]
                # Remove empty chunks
                page_chunks = [chunk for chunk in page_chunks if chunk.strip()]

            # Create Chunk objects
            for chunk_index, text_chunk in enumerate(
                page_chunks,
                start=1,
            ):
                chunk_id = self._create_chunk_id(
                    source=page.metadata.get("source", "document"),
                    page_number=page.page_number,
                    chunk_index=chunk_index,
                )

                metadata = {
                    **page.metadata,
                    "page": page.page_number,
                    "chunk_index": chunk_index,
                }

                chunks.append(
                    Chunk(
                        id=chunk_id,
                        text=text_chunk,
                        source=page.metadata.get("source", "document"),
                        page=page.page_number,
                        metadata=metadata,
                    )
                )

        return chunks

    def _clean_text(self, text: str) -> str:
        """
        Clean the entire document text before splitting.
        """
        lines = text.split('\n')
        cleaned_lines = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines
            if not line:
                i += 1
                continue
            
            # Remove page headers/footers
            if self.remove_page_headers:
                # Remove "===== Page X ====="
                if re.match(r'=+\s*Page\s+\d+\s*=+', line):
                    i += 1
                    continue
                
                # Remove "CITY OF APEX | MUNICIPAL WASTE PROTOCOLS (MWMP-SOP-2026) Page X of Y"
                if re.search(r'CITY OF APEX.*MWMP-SOP-2026', line):
                    i += 1
                    continue
                
                # Remove standalone page markers
                if re.match(r'Page\s+\d+\s+of\s+\d+', line):
                    i += 1
                    continue
            
            # Remove all bullet/noise lines
            if self.remove_bullet_noise:
                # Check for ALL types of bullet/noise patterns
                if self._is_noise_line(line):
                    i += 1
                    continue
            
            # Fix numbered lists: combine "1." with the text that follows
            if re.match(r'^\d+\.\s+[A-Za-z]', line):
                # This line has a number with text - keep it
                cleaned_lines.append(line)
            elif re.match(r'^\d+\.\s*$', line):
                # Standalone number - look ahead for the next line
                next_line = ""
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines):
                    next_line = lines[j].strip()
                    # If next line doesn't start with a number, combine them
                    if not re.match(r'^\d+\.', next_line) and not self._is_noise_line(next_line):
                        cleaned_lines.append(f"{line} {next_line}")
                        i = j  # Skip the next line
                    else:
                        cleaned_lines.append(line)
                else:
                    cleaned_lines.append(line)
            else:
                cleaned_lines.append(line)
            
            i += 1
        
        # Join lines back together
        text = '\n'.join(cleaned_lines)
        
        # Remove multiple consecutive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text

    def _is_noise_line(self, line: str) -> bool:
        """
        Check if a line is noise (bullets, numbers, symbols, etc.)
        """
        # Remove whitespace
        line = line.strip()
        
        if not line:
            return True
        
        # Patterns for noise lines
        noise_patterns = [
            r'^\d+\.\s*$',                    # Standalone numbers with dot
            r'^\d+\.\s+$',                    # Numbers with dot and spaces
            r'^\s*\d+\.\s*$',                 # Numbers with dot and whitespace
            r'^[•◦○●◆◇■□▪▫►▶◄◀→←↑↓]\s*$',   # Various bullet types
            r'^[•◦○●◆◇■□▪▫►▶◄◀→←↑↓]\s+$',    # Bullets with spaces
            r'^\s*[•◦○●◆◇■□▪▫►▶◄◀→←↑↓]\s*$', # Bullets with whitespace
            r'^[-–—]\s*$',                    # Dashes
            r'^[-–—]\s+$',                    # Dashes with spaces
            r'^\s*[-–—]\s*$',                 # Dashes with whitespace
            r'^[*]\s*$',                      # Asterisk
            r'^\s*[*]\s*$',                   # Asterisk with whitespace
            r'^[0-9]+\s*$',                   # Just numbers
            r'^\s*[0-9]+\s*$',                # Just numbers with whitespace
            r'^[•◦○●◆◇■□▪▫►▶◄◀→←↑↓]+\s*$',   # Multiple bullets
            r'^[•◦○●◆◇■□▪▫►▶◄◀→←↑↓]+\s+$',    # Multiple bullets with spaces
            r'^\s*[•◦○●◆◇■□▪▫►▶◄◀→←↑↓]+\s*$', # Multiple bullets with whitespace
        ]
        
        for pattern in noise_patterns:
            if re.match(pattern, line):
                return True
        
        # Check if line consists entirely of special characters
        special_chars = set('•◦○●◆◇■□▪▫►▶◄◀→←↑↓-–—*')
        if all(c in special_chars or c.isspace() for c in line):
            return True
        
        return False

    def _clean_chunk(self, chunk: str) -> str:
        """
        Clean individual chunks after splitting.
        """
        lines = chunk.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            
            if not line:
                continue
            
            # Skip noise lines
            if self.remove_bullet_noise and self._is_noise_line(line):
                continue
            
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)

    def split_with_cleanup(self, pages: list[DocumentPage]) -> list[Chunk]:
        """
        Split text with aggressive cleanup for noisy PDFs.
        This is a convenience method that applies extra cleaning steps.

        Args:
            pages: Page-level document content.

        Returns:
            List of chunks with metadata.
        """
        chunks: list[Chunk] = []

        for page in pages:
            if not page.text or not page.text.strip():
                continue

            text = page.text

            # Step 1: Remove page markers
            text = re.sub(r'=+\s*Page\s+\d+\s*=+', '', text)
            
            # Step 2: Remove page headers/footers
            text = re.sub(r'CITY OF APEX.*?MWMP-SOP-2026\s+Page\s+\d+\s+of\s+\d+', '', text)
            text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text)
            
            # Step 3: Remove noise lines
            lines = text.split('\n')
            cleaned_lines = []
            
            for line in lines:
                line = line.strip()
                
                # Skip noise lines
                if self._is_noise_line(line):
                    continue
                
                cleaned_lines.append(line)
            
            text = '\n'.join(cleaned_lines)
            
            # Step 4: Remove excessive newlines
            text = re.sub(r'\n{3,}', '\n\n', text)
            
            # Step 5: Split into chunks
            page_chunks = self.splitter.split_text(text)
            
            # Step 6: Clean each chunk
            final_chunks = []
            for chunk in page_chunks:
                # Remove leading/trailing whitespace
                chunk = chunk.strip()
                
                # Remove any remaining noise lines
                lines = chunk.split('\n')
                cleaned = []
                for line in lines:
                    line = line.strip()
                    if line and not self._is_noise_line(line):
                        cleaned.append(line)
                
                chunk = '\n'.join(cleaned).strip()
                if chunk:
                    final_chunks.append(chunk)
            
            # Step 7: Create Chunk objects
            for chunk_index, text_chunk in enumerate(
                final_chunks,
                start=1,
            ):
                chunk_id = self._create_chunk_id(
                    source=page.metadata.get("source", "document"),
                    page_number=page.page_number,
                    chunk_index=chunk_index,
                )

                metadata = {
                    **page.metadata,
                    "page": page.page_number,
                    "chunk_index": chunk_index,
                }

                chunks.append(
                    Chunk(
                        id=chunk_id,
                        text=text_chunk,
                        source=page.metadata.get("source", "document"),
                        page=page.page_number,
                        metadata=metadata,
                    )
                )

        return chunks

    @staticmethod
    def _create_chunk_id(
        source: str,
        page_number: int,
        chunk_index: int,
    ) -> str:
        """
        Create a deterministic chunk identifier.
        """
        source_name = Path(source).stem

        return (
            f"{source_name}"
            f"_p{page_number}"
            f"_c{chunk_index}"
        )