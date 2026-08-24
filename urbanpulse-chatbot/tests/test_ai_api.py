import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient

from app.api.dependencies import get_rag_service
from app.api.exceptions import AIServiceError
from app.main import app


# --- Mock Services ---

class FakeRAGService:
    def answer(self, question: str) -> dict:
        return {
            "answer": "Dry recyclable waste should go into the Blue Bin.",
            "sources": [
                {
                    "source": "municipalWasteProtocal.pdf",
                    "page": 1,
                }
            ],
        }


class FailingRAGService:
    def ask(self, question: str):
        raise AIServiceError("Internal AI Failure")

    def answer(self, question: str):
        raise AIServiceError("Internal AI Failure")


def override_rag_service():
    return FakeRAGService()


def override_failing_rag_service():
    return FailingRAGService()


app.dependency_overrides[get_rag_service] = override_rag_service

client = TestClient(app)


# --- Tests ---

def test_ai_ask_success():
    response = client.post(
        "/ai/ask",
        json={
            "question": "How should dry recyclable waste be disposed of?"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert "sources" in data

    assert data["answer"] == (
        "Dry recyclable waste should go into the Blue Bin."
    )

    assert data["sources"][0]["source"] == (
        "municipalWasteProtocal.pdf"
    )

    assert data["sources"][0]["page"] == 1


def test_ai_ask_empty_question():
    response = client.post(
        "/ai/ask",
        json={
            "question": ""
        },
    )

    assert response.status_code == 422


def test_ai_ask_missing_question():
    response = client.post(
        "/ai/ask",
        json={},
    )

    assert response.status_code == 422


def test_ai_ask_ai_service_failure():
    app.dependency_overrides[
        get_rag_service
    ] = override_failing_rag_service

    response = client.post(
        "/ai/ask",
        json={
            "question": "How should waste be disposed of?"
        },
    )

    assert response.status_code == 503

    assert response.json() == {
        "detail": "AI service is temporarily unavailable."
    }

    app.dependency_overrides[
        get_rag_service
    ] = override_rag_service