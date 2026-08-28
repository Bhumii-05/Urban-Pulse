import base64
from io import BytesIO
import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from PIL import Image

from app.services.image_service import ImageService


def create_test_image(
    image_format: str = "JPEG",
) -> bytes:
    """
    Create a small valid image for testing.
    """
    image = Image.new(
        "RGB",
        (10, 10),
    )

    buffer = BytesIO()

    image.save(
        buffer,
        format=image_format,
    )

    return buffer.getvalue()


def test_valid_jpeg():
    service = ImageService()
    image_data = create_test_image("JPEG")

    service.validate(
        image_data=image_data,
        mime_type="image/jpeg",
    )


def test_valid_png():
    service = ImageService()
    image_data = create_test_image("PNG")

    service.validate(
        image_data=image_data,
        mime_type="image/png",
    )


def test_valid_webp():
    service = ImageService()
    image_data = create_test_image("WEBP")

    service.validate(
        image_data=image_data,
        mime_type="image/webp",
    )


def test_empty_image():
    service = ImageService()

    with pytest.raises(ValueError):
        service.validate(
            image_data=b"",
            mime_type="image/jpeg",
        )


def test_empty_mime_type():
    service = ImageService()
    jpeg_data = create_test_image("JPEG")

    with pytest.raises(ValueError):
        service.validate(
            image_data=jpeg_data,
            mime_type="",
        )


def test_unsupported_image_type():
    service = ImageService()
    jpeg_data = create_test_image("JPEG")

    with pytest.raises(ValueError):
        service.validate(
            image_data=jpeg_data,
            mime_type="image/gif",
        )


def test_image_too_large():
    service = ImageService(max_size=10)
    jpeg_data = create_test_image("JPEG")

    with pytest.raises(ValueError):
        service.validate(
            image_data=jpeg_data,
            mime_type="image/jpeg",
        )


def test_invalid_image_bytes():
    service = ImageService()

    with pytest.raises(
        ValueError,
        match="Invalid or corrupted image",
    ):
        service.validate(
            image_data=b"this is not an image",
            mime_type="image/jpeg",
        )


def test_mime_type_does_not_match_actual_format():
    service = ImageService()

    png_data = create_test_image("PNG")

    with pytest.raises(
        ValueError,
        match="MIME type does not match",
    ):
        service.validate(
            image_data=png_data,
            mime_type="image/jpeg",
        )


def test_mime_type_is_normalized():
    service = ImageService()

    jpeg_data = create_test_image("JPEG")

    service.validate(
        image_data=jpeg_data,
        mime_type="IMAGE/JPEG",
    )


def test_encode():
    service = ImageService()

    image_data = create_test_image("JPEG")

    encoded = service.encode(image_data)

    assert encoded == base64.b64encode(image_data).decode("utf-8")


def test_prepare():
    service = ImageService()

    image_data = create_test_image("JPEG")

    result = service.prepare(
        image_data=image_data,
        mime_type="IMAGE/JPEG",
    )

    assert result["mime_type"] == "image/jpeg"
    assert result["data"] == base64.b64encode(image_data).decode("utf-8")