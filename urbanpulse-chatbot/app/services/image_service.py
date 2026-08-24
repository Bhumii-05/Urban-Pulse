import base64
from io import BytesIO

from PIL import Image, UnidentifiedImageError


class ImageService:
    """
    Validates and prepares images for AI vision processing.

    Responsibilities:
    1. Validate image MIME type.
    2. Validate image size.
    3. Validate that the bytes contain a real image.
    4. Validate that the detected image format is allowed.
    5. Convert image bytes to Base64.
    """

    ALLOWED_MIME_TYPES = {
        "image/jpeg": "JPEG",
        "image/jpg": "JPEG",
        "image/png": "PNG",
        "image/webp": "WEBP",
    }

    DEFAULT_MAX_SIZE = 10 * 1024 * 1024  # 10 MB

    def __init__(
        self,
        max_size: int = DEFAULT_MAX_SIZE,
    ):
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
        Validate image data, declared MIME type,
        and actual image format.
        """

        # ---------------------------------------------
        # 1. Check image data
        # ---------------------------------------------

        if not image_data:
            raise ValueError(
                "Image cannot be empty."
            )

        # ---------------------------------------------
        # 2. Check MIME type
        # ---------------------------------------------

        if not mime_type or not mime_type.strip():
            raise ValueError(
                "Image MIME type cannot be empty."
            )

        mime_type = mime_type.strip().lower()

        if mime_type not in self.ALLOWED_MIME_TYPES:
            raise ValueError(
                f"Unsupported image type: {mime_type}"
            )

        # ---------------------------------------------
        # 3. Check file size
        # ---------------------------------------------

        if len(image_data) > self.max_size:
            raise ValueError(
                "Image exceeds the maximum allowed size."
            )

        # ---------------------------------------------
        # 4. Validate actual image bytes
        # ---------------------------------------------

        try:
            image = Image.open(BytesIO(image_data))
            detected_format = image.format

            if detected_format not in {
                "JPEG",
                "PNG",
                "WEBP",
            }:
                raise ValueError(
                    "Unsupported image format."
                )

            expected_format = (
                self.ALLOWED_MIME_TYPES[mime_type]
            )

            if detected_format != expected_format:
                raise ValueError(
                    "Image MIME type does not match "
                    "the actual image format."
                )

            # Force Pillow to verify structural integrity
            image.verify()

        except UnidentifiedImageError as exc:
            raise ValueError(
                "Invalid or corrupted image."
            ) from exc

        except OSError as exc:
            raise ValueError(
                "Invalid or corrupted image."
            ) from exc

    def encode(
        self,
        image_data: bytes,
    ) -> str:
        """
        Convert validated image bytes to Base64.
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
        """

        self.validate(
            image_data=image_data,
            mime_type=mime_type,
        )

        normalized_mime = mime_type.strip().lower()
        if normalized_mime == "image/jpg":
            normalized_mime = "image/jpeg"

        encoded_image = self.encode(
            image_data
        )

        return {
            "mime_type": normalized_mime,
            "data": encoded_image,
        }