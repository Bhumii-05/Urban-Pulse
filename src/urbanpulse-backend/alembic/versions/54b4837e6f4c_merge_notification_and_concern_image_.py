"""merge notification and concern image migrations

Revision ID: 54b4837e6f4c
Revises: 8fe2b126f229, b92e73300162
Create Date: 2026-08-22 18:14:07.234516

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54b4837e6f4c'
down_revision: Union[str, Sequence[str], None] = ('8fe2b126f229', 'b92e73300162')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
