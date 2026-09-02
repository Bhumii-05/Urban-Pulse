from __future__ import annotations

import re


class QueryExpander:
    """
    Expands common resident terminology into terminology used
    by the municipal waste-management knowledge base.

    The expansion is deterministic and does not modify the user's
    original question returned to the frontend.
    """

    TERM_GROUPS = {
        "bio waste": [
            "bio waste",
            "organic waste",
            "wet waste",
            "food waste",
            "kitchen waste",
            "kitchen scraps",
        ],
        "biowaste": [
            "biowaste",
            "organic waste",
            "wet waste",
            "food waste",
            "kitchen waste",
            "kitchen scraps",
        ],
        "wet waste": [
            "wet waste",
            "organic waste",
            "food waste",
            "kitchen waste",
            "kitchen scraps",
        ],
        "organic waste": [
            "organic waste",
            "wet waste",
            "food waste",
            "kitchen waste",
            "kitchen scraps",
        ],
        "food waste": [
            "food waste",
            "organic waste",
            "wet waste",
            "kitchen waste",
            "kitchen scraps",
        ],
        "kitchen waste": [
            "kitchen waste",
            "kitchen scraps",
            "food waste",
            "organic waste",
            "wet waste",
        ],
        "kitchen scraps": [
            "kitchen scraps",
            "kitchen waste",
            "food waste",
            "organic waste",
            "wet waste",
        ],
    }

    def expand(self, query: str) -> str:
        """
        Return an expanded retrieval query.

        The original query is preserved and relevant terminology is
        appended only when a known concept is detected.
        """
        if not query or not query.strip():
            return ""

        normalized_query = query.strip()
        query_lower = normalized_query.lower()

        expansions: list[str] = []

        for term, synonyms in self.TERM_GROUPS.items():
            if re.search(rf"\b{re.escape(term)}\b", query_lower):
                for synonym in synonyms:
                    if synonym.lower() not in query_lower:
                        expansions.append(synonym)

        if not expansions:
            return normalized_query

        separator = "" if normalized_query.endswith((".", "?", "!")) else "."

        return (
            f"{normalized_query}{separator}\n"
            f"Related terms: {', '.join(expansions)}"
)