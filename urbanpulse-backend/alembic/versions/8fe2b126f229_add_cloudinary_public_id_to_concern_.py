"""add cloudinary public id to concern images

Revision ID: 8fe2b126f229
Revises: 3c0b991417a1
Create Date: 2026-08-22 13:22:42.898820

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8fe2b126f229"
down_revision: Union[str, Sequence[str], None] = "3c0b991417a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "concern_images",
        sa.Column(
            "cloudinary_public_id",
            sa.String(length=255),
            nullable=False,
        ),
    )

    op.create_index(
        op.f("ix_concern_images_cloudinary_public_id"),
        "concern_images",
        ["cloudinary_public_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_concern_images_cloudinary_public_id"),
        table_name="concern_images",
    )

    op.drop_column(
        "concern_images",
        "cloudinary_public_id",
    )