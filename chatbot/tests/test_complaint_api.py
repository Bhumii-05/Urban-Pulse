import sys
from pathlib import Path
import pytest

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from io import BytesIO
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def create_test_image(image_format="JPEG", size=(10, 10)):
    """
    Generates a valid image in-memory using PIL to pass header & structure
    validations inside ImageService.
    """
    image = Image.new("RGB", size, color="blue")
    buffer = BytesIO()
    image.save(buffer, format=image_format)
    buffer.seek(0)
    return buffer


def test_complaint_api_text_only():
    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "There is garbage dumped beside the road."
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "category" in data
    assert "severity" in data
    assert "description" in data
    assert "recommended_action" in data
    assert "confidence" in data

    assert 0.0 <= data["confidence"] <= 1.0


def test_complaint_api_with_image():
    image = create_test_image("JPEG")

    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "There is garbage dumped beside the road."
        },
        files={
            "image": (
                "complaint.jpg",
                image,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "category" in data
    assert "severity" in data
    assert "description" in data
    assert "recommended_action" in data
    assert "confidence" in data

    assert 0.0 <= data["confidence"] <= 1.0


def test_complaint_api_empty_complaint():
    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "   "
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Prompt cannot be empty."


def test_complaint_api_missing_complaint():
    response = client.post(
        "/ai/complaint",
        data={},
    )

    assert response.status_code == 422


def test_complaint_api_unsupported_image():
    image = create_test_image("GIF")

    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "There is garbage dumped beside the road."
        },
        files={
            "image": (
                "complaint.gif",
                image,
                "image/gif",
            )
        },
    )

    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]


def test_complaint_api_invalid_image():
    corrupted_data = BytesIO(b"fake-jpeg-data")

    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "There is garbage dumped beside the road."
        },
        files={
            "image": (
                "corrupted.jpg",
                corrupted_data,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 400
    assert "Invalid or corrupted image." in response.json()["detail"]


def test_complaint_api_oversized_image():
    # Generate ~11 MB fake payload exceeding default 10 MB threshold
    oversized_data = BytesIO(b"0" * (11 * 1024 * 1024))

    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "There is garbage dumped beside the road."
        },
        files={
            "image": (
                "huge.jpg",
                oversized_data,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 400
    assert "exceeds the maximum allowed size" in response.json()["detail"]


def test_complaint_api_confidence_range():
    response = client.post(
        "/ai/complaint",
        data={
            "complaint": "Deep pothole on the street."
        },
    )

    assert response.status_code == 200

    data = response.json()
    confidence = data["confidence"]

    assert isinstance(confidence, (float, int))
    assert 0.0 <= confidence <= 1.0


def test_complaint_api_service_failure():
    with patch(
        "app.services.complaint_service.ComplaintService.analyze",
        side_effect=RuntimeError("LLM service is unreachable."),
    ):
        response = client.post(
            "/ai/complaint",
            data={
                "complaint": "Broken streetlight."
            },
        )

        assert response.status_code == 502
        assert response.json()["detail"] == "LLM service is unreachable."