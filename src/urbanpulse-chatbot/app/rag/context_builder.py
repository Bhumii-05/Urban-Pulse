from app.rag.models import BuiltContext, RetrievalResult


class ContextBuilder:
    """
    Converts retrieved RAG results into structured context
    that can be supplied to the LLM.
    """

    def __init__(
        self,
        max_context_chunks: int = 5,
    ):
        if max_context_chunks <= 0:
            raise ValueError(
                "max_context_chunks must be greater than 0."
            )

        self.max_context_chunks = max_context_chunks

    def build(
        self,
        results: list[RetrievalResult],
    ) -> BuiltContext:
        """
        Build formatted LLM context from retrieval results.

        Args:
            results: Retrieved chunks with relevance scores.

        Returns:
            BuiltContext containing formatted text and sources.
        """

        if not results:
            return BuiltContext(
                text="",
                sources=[],
            )

        selected_results = results[
            :self.max_context_chunks
        ]

        context_parts = []
        sources = []

        for index, result in enumerate(
            selected_results,
            start=1,
        ):
            chunk = result.chunk

            source = chunk.source
            page = chunk.page

            context_part = (
                f"SOURCE {index}\n"
                f"Document: {source}\n"
                f"Page: {page if page is not None else 'N/A'}\n\n"
                f"{chunk.text.strip()}"
            )

            context_parts.append(
                context_part
            )

            source_data: dict[str, str | int] = {
                "source": source,
            }

            if page is not None:
                source_data["page"] = page

            sources.append(source_data)

        context_text = "\n\n---\n\n".join(
            context_parts
        )

        return BuiltContext(
            text=context_text,
            sources=sources,
        )