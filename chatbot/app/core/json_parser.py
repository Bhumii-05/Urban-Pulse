"""
json_parser.py

Utility functions for parsing JSON returned by LLMs.

Responsibilities:
- Remove Markdown code fences.
- Extract JSON objects from text.
- Convert JSON strings into Python dictionaries.
"""

import json
import re
from typing import Any

from app.core.exceptions import JSONParsingError


class JSONParser:
    """
    Utility class for parsing JSON responses from LLMs.
    """

    @staticmethod
    def parse(response: str) -> dict[str, Any]:
        """
        Parse an LLM response into a Python dictionary.

        Args:
            response: Raw text returned by the LLM.

        Returns:
            Parsed dictionary.

        Raises:
            JSONParsingError:
                If valid JSON cannot be extracted from the LLM response.
        """
        try:
            cleaned_response = JSONParser._clean_response(response)
            return json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            raise JSONParsingError("Failed to parse LLM response.") from e

    @staticmethod
    def _clean_response(response: str) -> str:
        """
        Clean common formatting added by LLMs.

        Handles:

        ```json
        {...}
        ```

        or

        Sure! Here is the JSON:

        {...}

        Returns only the JSON object.
        """

        response = response.strip()

        # Remove ```json
        response = re.sub(
            r"^```json",
            "",
            response,
            flags=re.IGNORECASE,
        )

        # Remove ```
        response = re.sub(
            r"```$",
            "",
            response,
        )

        response = response.strip()

        # Extract first JSON object
        start = response.find("{")
        end = response.rfind("}")

        if start != -1 and end != -1:
            return response[start : end + 1]

        return response