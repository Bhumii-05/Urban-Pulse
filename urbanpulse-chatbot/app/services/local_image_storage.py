from pathlib import Path
from uuid import UUID

from app.services.image_storage import ImageStorage


class LocalImageStorage(ImageStorage):
    """
    Local filesystem implementation of ImageStorage.

    Intended for local development.

    Images are stored under:

        data/uploads/

    Each complaint gets its own directory.
    """

    def __init__(
        self,
        storage_directory: str = "data/uploads",
    ):
        self.storage_directory = Path(
            storage_directory
        )

        self.storage_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

    def save(
        self,
        image_data: bytes,
        filename: str,
        mime_type: str,
        complaint_id: UUID,
    ) -> str:
        """
        Save an image to the local filesystem.
        """

        if not image_data:
            raise ValueError(
                "Image data cannot be empty."
            )

        if not filename or not filename.strip():
            raise ValueError(
                "Image filename cannot be empty."
            )

        if not mime_type or not mime_type.strip():
            raise ValueError(
                "Image MIME type cannot be empty."
            )

        complaint_directory = (
            self.storage_directory
            / str(complaint_id)
        )

        complaint_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        safe_filename = Path(
            filename
        ).name

        image_path = (
            complaint_directory
            / safe_filename
        )

        image_path.write_bytes(
            image_data
        )

        return str(
            image_path
        )

    def delete(
        self,
        image_reference: str,
    ) -> None:
        """
        Delete a stored image.
        """

        image_path = Path(
            image_reference
        )

        if image_path.exists():
            image_path.unlink()

    def exists(
        self,
        image_reference: str,
    ) -> bool:
        """
        Check whether a stored image exists.
        """

        return Path(
            image_reference
        ).is_file()