"""add suggestion type and coordinates

Revision ID: dcc5575e4c1c
Revises: 16142e8cf08a
Create Date: 2026-08-28 11:45:15.220023
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "dcc5575e4c1c"
down_revision: Union[str, Sequence[str], None] = "16142e8cf08a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


suggestion_type_enum = sa.Enum(
    "GENERAL",
    "WASTE_PICKUP",
    "ADD_BIN",
    "OTHER",
    name="suggestiontype",
)


def upgrade() -> None:
    suggestion_type_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "suggestions",
        sa.Column(
            "suggestion_type",
            suggestion_type_enum,
            nullable=True,
        ),
    )

    op.add_column(
        "suggestions",
        sa.Column(
            "latitude",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "suggestions",
        sa.Column(
            "longitude",
            sa.Float(),
            nullable=True,
        ),
    )

    op.execute(
        """
        UPDATE suggestions
        SET suggestion_type = 'GENERAL'
        WHERE suggestion_type IS NULL
        """
    )

    op.alter_column(
        "suggestions",
        "suggestion_type",
        nullable=False,
    )

    op.create_index(
        op.f("ix_suggestions_suggestion_type"),
        "suggestions",
        ["suggestion_type"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_suggestions_suggestion_type"),
        table_name="suggestions",
    )

    op.drop_column("suggestions", "longitude")
    op.drop_column("suggestions", "latitude")
    op.drop_column("suggestions", "suggestion_type")

    suggestion_type_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )