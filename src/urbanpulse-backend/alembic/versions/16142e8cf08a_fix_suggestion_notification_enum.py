"""fix suggestion notification enum

Revision ID: 16142e8cf08a
Revises: 29f80f64d222
Create Date: 2026-08-23 13:59:02.443251

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '16142e8cf08a'
down_revision: Union[str, Sequence[str], None] = '29f80f64d222'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        "ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'SUGGESTION'"
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass
