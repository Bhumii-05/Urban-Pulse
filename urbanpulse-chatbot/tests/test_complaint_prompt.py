import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest

from app.prompts.complaint_prompt import (
    SYSTEM_PROMPT,
    build_complaint_prompt,
)


def test_system_prompt_exists():
    assert SYSTEM_PROMPT
    assert "municipal complaint" in SYSTEM_PROMPT.lower()


def test_build_complaint_prompt():
    prompt = build_complaint_prompt(
        "There is garbage dumped near the park."
    )

    assert "garbage dumped near the park" in prompt
    assert "category" in prompt
    assert "severity" in prompt
    assert "description" in prompt
    assert "recommended_action" in prompt
    assert "confidence" in prompt


def test_empty_complaint():
    with pytest.raises(ValueError):
        build_complaint_prompt("")


def test_whitespace_complaint():
    with pytest.raises(ValueError):
        build_complaint_prompt("   ")