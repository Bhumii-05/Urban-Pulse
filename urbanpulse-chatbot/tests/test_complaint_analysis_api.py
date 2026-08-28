import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_complaint_service
from app.main import app

client = TestClient(app)


@pytest.fixture
def mock_complaint_service():
    service = MagicMock()

    service.analyze_only.return_value = {
        "category": "Illegal Dumping",
        "severity": "High",
        "description": (
            "Waste has been dumped in an unauthorized "
            "public area."
        ),
        "recommended_action": (
            "Municipal inspection and cleanup."
        ),
        "confidence": 0.92,
    }

    return service


@pytest.fixture(autouse=True)
def override_complaint_service(
    mock_complaint_service,
):
    app.dependency_overrides[
        get_complaint_service
    ] = lambda: mock_complaint_service

    yield

    app.dependency_overrides.clear()


# ============================================================
# 1. Text-only complaint analysis
# ============================================================

def test_complaint_analysis_text_only(
    mock_complaint_service,
):
    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": (
                "Garbage has been dumped beside "
                "the public road."
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["category"] == "Illegal Dumping"
    assert data["severity"] == "High"
    assert (
        data["description"]
        == "Waste has been dumped in an unauthorized "
        "public area."
    )
    assert (
        data["recommended_action"]
        == "Municipal inspection and cleanup."
    )
    assert data["confidence"] == 0.92

    mock_complaint_service.analyze_only.assert_called_once()

    call_kwargs = (
        mock_complaint_service
        .analyze_only
        .call_args.kwargs
    )

    assert (
        call_kwargs["complaint"]
        == "Garbage has been dumped beside "
        "the public road."
    )

    assert call_kwargs["image_data"] is None
    assert call_kwargs["mime_type"] is None


# ============================================================
# 2. Complaint analysis with image
# ============================================================

def test_complaint_analysis_with_image(
    mock_complaint_service,
):
    image_bytes = b"fake-image-data"

    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": (
                "There is a large pile of garbage "
                "near the park."
            )
        },
        files={
            "image": (
                "garbage.jpg",
                image_bytes,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["category"] == "Illegal Dumping"
    assert data["severity"] == "High"
    assert data["confidence"] == 0.92

    mock_complaint_service.analyze_only.assert_called_once()

    call_kwargs = (
        mock_complaint_service
        .analyze_only
        .call_args.kwargs
    )

    assert (
        call_kwargs["complaint"]
        == "There is a large pile of garbage "
        "near the park."
    )

    assert call_kwargs["image_data"] == image_bytes
    assert call_kwargs["mime_type"] == "image/jpeg"


# ============================================================
# 3. Missing complaint
# ============================================================

def test_complaint_analysis_missing_complaint():
    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={},
    )

    assert response.status_code == 422


# ============================================================
# 4. Empty complaint
# ============================================================

def test_complaint_analysis_empty_complaint():
    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": ""
        },
    )

    # FastAPI returns 422 Unprocessable Content for empty request validation errors
    assert response.status_code == 422


# ============================================================
# 5. Whitespace-only complaint
# ============================================================

def test_complaint_analysis_whitespace_complaint():
    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": "   "
        },
    )

    assert response.status_code == 400


# ============================================================
# 6. Confidence validation
# ============================================================

def test_complaint_analysis_confidence_range(
    mock_complaint_service,
):
    mock_complaint_service.analyze_only.return_value[
        "confidence"
    ] = 0.75

    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": "Garbage is dumped illegally."
        },
    )

    assert response.status_code == 200

    assert (
        response.json()["confidence"]
        == 0.75
    )


# ============================================================
# 7. Service failure
# ============================================================

def test_complaint_analysis_service_failure(
    mock_complaint_service,
):
    mock_complaint_service.analyze_only.side_effect = (
        RuntimeError(
            "LLM generation failed."
        )
    )

    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": (
                "Garbage has been dumped "
                "near the road."
            )
        },
    )

    # Upstream service errors raised by RuntimeError return 502 Bad Gateway
    assert response.status_code == 502


# ============================================================
# 8. Analysis does NOT create complaint
# ============================================================

def test_complaint_analysis_does_not_persist(
    mock_complaint_service,
):
    response = client.post(
        "/api/v1/ai/complaint/analyze",
        data={
            "complaint": (
                "Waste has been dumped "
                "near the park."
            )
        },
    )

    assert response.status_code == 200

    # The analysis service must be used.
    mock_complaint_service.analyze_only.assert_called_once()

    # The API should not call persistence methods.
    assert not hasattr(
        mock_complaint_service,
        "create",
    ) or not mock_complaint_service.create.called