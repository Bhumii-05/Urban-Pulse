"""make concern timestamps timezone aware

Revision ID: 4bb29281c9ca
Revises: dcc5575e4c1c
Create Date: 2026-08-29 00:47:06.219508
"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "4bb29281c9ca"
down_revision: Union[str, Sequence[str], None] = "dcc5575e4c1c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "concern_history",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concern_supports",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concerns",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concerns",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=False,
        postgresql_using="updated_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concerns",
        "deleted_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=True,
        postgresql_using="deleted_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "notifications",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    op.alter_column(
        "notifications",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concerns",
        "deleted_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=True,
        postgresql_using="deleted_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concerns",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=False,
        postgresql_using="updated_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concerns",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concern_supports",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "concern_history",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )