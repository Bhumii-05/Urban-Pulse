import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.dependencies import get_complaint_service


client = TestClient(app)


@pytest.fixture
def mock_complaint_service():
    service = MagicMock()

    service.create.return_value = {
        "id": "CMP-1001",
        "complaint": (
            "Garbage has been dumped beside "
            "the public road."
        ),
        "category": "Illegal Dumping",
        "severity": "High",
        "description": (
            "Waste has been dumped in an "
            "unauthorized public area."
        ),
        "recommended_action": (
            "Municipal inspection and cleanup."
        ),
        "confidence": 0.92,
        "status": "SUBMITTED",
        "image_reference": None,
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
# 1. Text-only complaint
# ============================================================

def test_create_complaint_text_only(
    mock_complaint_service,
):
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": (
                "Garbage has been dumped beside "
                "the public road."
            ),
            "category": "Illegal Dumping",
            "severity": "High",
            "description": (
                "Waste has been dumped in an "
                "unauthorized public area."
            ),
            "recommended_action": (
                "Municipal inspection and cleanup."
            ),
            "confidence": "0.92",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["id"] == "CMP-1001"
    assert data["category"] == "Illegal Dumping"
    assert data["severity"] == "High"
    assert data["confidence"] == 0.92
    assert data["status"] == "SUBMITTED"
    assert data["image_reference"] is None

    mock_complaint_service.create.assert_called_once()


# ============================================================
# 2. Complaint with image
# ============================================================

def test_create_complaint_with_image(
    mock_complaint_service,
):
    image_bytes = b"fake-image-data"

    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": (
                "There is a large pile of garbage "
                "near the park."
            ),
            "category": "Illegal Dumping",
            "severity": "High",
            "description": (
                "Waste has been dumped near "
                "a public park."
            ),
            "recommended_action": (
                "Municipal inspection and cleanup."
            ),
            "confidence": "0.91",
        },
        files={
            "image": (
                "garbage.jpg",
                image_bytes,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["id"] == "CMP-1001"
    assert data["category"] == "Illegal Dumping"
    assert data["severity"] == "High"
    assert data["confidence"] == 0.92
    assert data["status"] == "SUBMITTED"

    mock_complaint_service.create.assert_called_once()

    call_kwargs = (
        mock_complaint_service
        .create
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

def test_create_complaint_missing_complaint():
    response = client.post(
        "/api/v1/complaints",
        data={
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": "0.92",
        },
    )

    assert response.status_code == 422


# ============================================================
# 4. Empty complaint
# ============================================================

def test_create_complaint_empty_complaint():
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": "0.92",
        },
    )

    assert response.status_code == 400

# ============================================================
# 5. Whitespace-only complaint
# ============================================================

def test_create_complaint_whitespace_only():
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "   ",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": "0.92",
        },
    )

    assert response.status_code == 400


# ============================================================
# 6. Invalid confidence
# ============================================================

@pytest.mark.parametrize(
    "confidence",
    [
        "-0.1",
        "1.1",
    ],
)
def test_create_complaint_invalid_confidence(
    confidence,
):
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "Illegal dumping.",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": confidence,
        },
    )

    assert response.status_code == 422


# ============================================================
# 7. Returned initial status
# ============================================================

def test_create_complaint_initial_status(
    mock_complaint_service,
):
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "Garbage dumped on road.",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": "0.90",
        },
    )

    assert response.status_code == 201
    assert response.json()["status"] == "SUBMITTED"


# ============================================================
# 8. Returned complaint ID
# ============================================================

def test_create_complaint_returns_id(
    mock_complaint_service,
):
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "Garbage dumped on road.",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": "0.90",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "id" in data
    assert data["id"] == "CMP-1001"


# ============================================================
# 9. Service failure
# ============================================================

def test_create_complaint_service_failure(
    mock_complaint_service,
):
    mock_complaint_service.create.side_effect = (
        RuntimeError(
            "Complaint persistence failed."
        )
    )

    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "Garbage dumped on road.",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": "Illegal dumping.",
            "recommended_action": "Cleanup.",
            "confidence": "0.90",
        },
    )

    assert response.status_code == 500


# ============================================================
# 10. Verify service receives analysis
# ============================================================

def test_create_complaint_passes_analysis(
    mock_complaint_service,
):
    response = client.post(
        "/api/v1/complaints",
        data={
            "complaint": "Garbage dumped on road.",
            "category": "Illegal Dumping",
            "severity": "High",
            "description": (
                "Waste dumped in an unauthorized area."
            ),
            "recommended_action": "Municipal cleanup.",
            "confidence": "0.92",
        },
    )

    assert response.status_code == 201

    mock_complaint_service.create.assert_called_once()

    call_kwargs = (
        mock_complaint_service
        .create
        .call_args.kwargs
    )

    assert (
        call_kwargs["category"]
        == "Illegal Dumping"
    )

    assert (
        call_kwargs["severity"]
        == "High"
    )

    assert (
        call_kwargs["description"]
        == "Waste dumped in an unauthorized area."
    )

    assert (
        call_kwargs["recommended_action"]
        == "Municipal cleanup."
    )

    assert (
        call_kwargs["confidence"]
        == 0.92
    )