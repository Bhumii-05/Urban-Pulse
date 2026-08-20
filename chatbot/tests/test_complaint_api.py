import sys
from pathlib import Path
from io import BytesIO
from uuid import uuid4
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from PIL import Image

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app
from app.api.dependencies import get_complaint_service


def create_test_image(image_format="JPEG", size=(10, 10)) -> bytes:
    image = Image.new("RGB", size, color="blue")
    buffer = BytesIO()
    image.save(buffer, format=image_format)
    buffer.seek(0)
    return buffer.getvalue()


# --- Mock Service Factory ---

def get_mock_complaint_service():
    mock_service = MagicMock()

    def mock_analyze(complaint, image_data=None, mime_type=None, image_filename=None):
        # Validate negative test conditions matching app constraints
        if mime_type and mime_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise ValueError("Unsupported image type.")

        if image_data:
            if len(image_data) > 10 * 1024 * 1024:
                raise ValueError("Image exceeds the maximum allowed size.")
            if image_data == b"fake-jpeg-data":
                raise ValueError("Invalid or corrupted image.")

        # Create mock domain model response object
        mock_result = MagicMock()
        mock_result.id = str(uuid4())
        mock_result.category = "illegal_dumping"
        mock_result.severity = "medium"
        mock_result.description = "Garbage observed on street."
        mock_result.recommended_action = "Dispatch municipal team."
        mock_result.confidence = 0.95
        mock_result.status = "pending"
        return mock_result

    mock_service.analyze.side_effect = mock_analyze
    return mock_service


# --- Dependency Override Fixture ---

@pytest.fixture(autouse=True)
def override_dependencies():
    app.dependency_overrides[get_complaint_service] = get_mock_complaint_service
    yield
    app.dependency_overrides.clear()


client = TestClient(app)


# --- Test Cases ---

def test_complaint_api_text_only():
    response = client.post(
        "/ai/complaint",
        data={"complaint": "There is garbage dumped beside the road."},
    )

    assert response.status_code == 200
    data = response.json()

    assert "id" in data
    assert data["category"] == "illegal_dumping"
    assert "severity" in data
    assert "description" in data
    assert "recommended_action" in data
    assert 0.0 <= data["confidence"] <= 1.0


def test_complaint_api_with_image():
    image_bytes = create_test_image("JPEG")

    response = client.post(
        "/ai/complaint",
        data={"complaint": "There is garbage dumped beside the road."},
        files={
            "image": (
                "complaint.jpg",
                image_bytes,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "id" in data
    assert data["category"] == "illegal_dumping"
    assert "severity" in data
    assert "description" in data
    assert "recommended_action" in data
    assert 0.0 <= data["confidence"] <= 1.0


def test_complaint_api_empty_complaint():
    response = client.post(
        "/ai/complaint",
        data={"complaint": "   "},
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
    image_bytes = create_test_image("GIF")

    response = client.post(
        "/ai/complaint",
        data={"complaint": "There is garbage dumped beside the road."},
        files={
            "image": (
                "complaint.gif",
                image_bytes,
                "image/gif",
            )
        },
    )

    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]


def test_complaint_api_invalid_image():
    corrupted_data = b"fake-jpeg-data"

    response = client.post(
        "/ai/complaint",
        data={"complaint": "There is garbage dumped beside the road."},
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
    oversized_data = b"0" * (11 * 1024 * 1024)

    response = client.post(
        "/ai/complaint",
        data={"complaint": "There is garbage dumped beside the road."},
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
        data={"complaint": "Deep pothole on the street."},
    )

    assert response.status_code == 200
    data = response.json()
    confidence = data["confidence"]

    assert isinstance(confidence, (float, int))
    assert 0.0 <= confidence <= 1.0


def test_complaint_api_service_failure():
    def failing_service():
        mock = MagicMock()
        mock.analyze.side_effect = RuntimeError("LLM service is unreachable.")
        return mock

    app.dependency_overrides[get_complaint_service] = failing_service

    response = client.post(
        "/ai/complaint",
        data={"complaint": "Broken streetlight."},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "LLM service is unreachable."