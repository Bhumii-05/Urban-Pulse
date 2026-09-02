from app.rag.query_expander import QueryExpander


def test_expands_bio_waste():
    expander = QueryExpander()

    result = expander.expand("How should I handle bio waste?")

    assert "bio waste" in result
    assert "organic waste" in result
    assert "wet waste" in result
    assert "food waste" in result
    assert "kitchen waste" in result


def test_does_not_expand_unrelated_query():
    expander = QueryExpander()

    query = "What are the waste collection timings?"
    result = expander.expand(query)

    assert result == query


def test_empty_query():
    expander = QueryExpander()

    assert expander.expand("") == ""
    assert expander.expand("   ") == ""


def test_preserves_original_question():
    expander = QueryExpander()

    query = "How should I handle bio waste?"
    result = expander.expand(query)

    assert result.startswith(query)