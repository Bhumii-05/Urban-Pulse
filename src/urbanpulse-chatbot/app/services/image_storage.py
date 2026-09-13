from abc import ABC, abstractmethod
from pathlib import Path
from uuid import UUID


class ImageStorage(ABC):
    """
    Abstract interface for persistent image storage.

    The application depends on this abstraction rather than
    a specific storage implementation such as the local filesystem,
    S3, or another object-storage provider.
    """

    @abstractmethod
    def save(
        self,
        image_data: bytes,
        filename: str,
        mime_type: str,
        complaint_id: UUID,
    ) -> str:
        """
        Persist an image.

        Args:
            image_data:
                Raw image bytes.

            filename:
                Original image filename.

            mime_type:
                MIME type of the image.

            complaint_id:
                ID of the complaint associated with the image.

        Returns:
            Persistent reference to the stored image.
        """
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        image_reference: str,
    ) -> None:
        """
        Delete a stored image.

        Args:
            image_reference:
                Reference returned by save().
        """
        raise NotImplementedError

    @abstractmethod
    def exists(
        self,
        image_reference: str,
    ) -> bool:
        """
        Check whether an image exists.

        Args:
            image_reference:
                Stored image reference.

        Returns:
            True if the image exists.
        """
        raise NotImplementedError