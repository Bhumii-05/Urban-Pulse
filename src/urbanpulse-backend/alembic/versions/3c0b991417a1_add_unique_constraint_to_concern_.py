"""add unique constraint to concern supports

Revision ID: 3c0b991417a1
Revises: 1ad7fa9af89f
Create Date: 2026-08-21 20:10:05.489248

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "3c0b991417a1"
down_revision: Union[str, Sequence[str], None] = "1ad7fa9af89f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_unique_constraint(
        "uq_concern_support_concern_user",
        "concern_supports",
        ["concern_id", "user_id"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "uq_concern_support_concern_user",
        "concern_supports",
        type_="unique",
    )