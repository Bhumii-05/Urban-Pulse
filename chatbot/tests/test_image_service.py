import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


import base64

import pytest

from app.services.image_service import ImageService


def test_valid_jpeg():
    service = ImageService()

    image_data = b"fake-jpeg-data"

    service.validate(
        image_data=image_data,
        mime_type="image/jpeg",
    )


def test_valid_png():
    service = ImageService()

    service.validate(
        image_data=b"fake-png-data",
        mime_type="image/png",
    )


def test_valid_webp():
    service = ImageService()

    service.validate(
        image_data=b"fake-webp-data",
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

    with pytest.raises(ValueError):
        service.validate(
            image_data=b"image-data",
            mime_type="",
        )


def test_unsupported_image_type():
    service = ImageService()

    with pytest.raises(ValueError):
        service.validate(
            image_data=b"image-data",
            mime_type="image/gif",
        )


def test_image_too_large():
    service = ImageService(
        max_size=10
    )

    with pytest.raises(ValueError):
        service.validate(
            image_data=b"12345678901",
            mime_type="image/jpeg",
        )


def test_encode():
    service = ImageService()

    image_data = b"hello image"

    encoded = service.encode(
        image_data
    )

    assert encoded == base64.b64encode(
        image_data
    ).decode("utf-8")


def test_prepare():
    service = ImageService()

    result = service.prepare(
        image_data=b"hello image",
        mime_type="IMAGE/JPEG",
    )

    assert result["mime_type"] == "image/jpeg"

    assert result["data"] == (
        base64.b64encode(
            b"hello image"
        ).decode("utf-8")
    )