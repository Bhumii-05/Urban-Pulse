import sys
from pathlib import Path

# Fix Python path resolution for pytest execution
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Provides a standard TestClient instance for tests."""
    return TestClient(app)