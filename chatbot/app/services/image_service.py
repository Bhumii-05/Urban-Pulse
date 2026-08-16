import base64


class ImageService:
    """
    Validates and prepares images for AI vision processing.

    Responsibilities:

    1. Validate image MIME type.
    2. Validate image size.
    3. Reject empty image data.
    4. Convert image bytes to Base64.
    """

    ALLOWED_MIME_TYPES = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    DEFAULT_MAX_SIZE = 10 * 1024 * 1024  # 10 MB

    def __init__(
        self,
        max_size: int = DEFAULT_MAX_SIZE,
    ):
        """
        Initialize ImageService.

        Args:
            max_size:
                Maximum allowed image size in bytes.
        """

        if max_size <= 0:
            raise ValueError(
                "max_size must be greater than 0."
            )

        self.max_size = max_size

    def validate(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> None:
        """
        Validate image data and MIME type.

        Args:
            image_data:
                Raw image bytes.

            mime_type:
                MIME type supplied for the image.

        Raises:
            ValueError:
                If the image is invalid or unsupported.
        """

        if not image_data:
            raise ValueError(
                "Image cannot be empty."
            )

        if not mime_type or not mime_type.strip():
            raise ValueError(
                "Image MIME type cannot be empty."
            )

        mime_type = mime_type.strip().lower()

        if mime_type not in self.ALLOWED_MIME_TYPES:
            raise ValueError(
                f"Unsupported image type: {mime_type}"
            )

        if len(image_data) > self.max_size:
            raise ValueError(
                "Image exceeds the maximum allowed size."
            )

    def encode(
        self,
        image_data: bytes,
    ) -> str:
        """
        Convert image bytes to Base64.

        Args:
            image_data:
                Raw image bytes.

        Returns:
            Base64 encoded image string.

        Raises:
            ValueError:
                If image data is empty.
        """

        if not image_data:
            raise ValueError(
                "Image cannot be empty."
            )

        return base64.b64encode(
            image_data
        ).decode("utf-8")

    def prepare(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> dict[str, str]:
        """
        Validate and prepare an image for vision processing.

        Args:
            image_data:
                Raw image bytes.

            mime_type:
                Image MIME type.

        Returns:
            Dictionary containing the MIME type
            and Base64 encoded image.
        """

        self.validate(
            image_data=image_data,
            mime_type=mime_type,
        )

        encoded_image = self.encode(
            image_data
        )

        return {
            "mime_type": mime_type.strip().lower(),
            "data": encoded_image,
        }