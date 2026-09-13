"""initial database schema

Revision ID: be862a1cf713
Revises:
Create Date: 2026-08-08 10:53:22.419516

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = "be862a1cf713"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=15), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            sa.Enum(
                "CITIZEN",
                "WORKER",
                "ADMIN",
                name="userrole",
            ),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("phone_number"),
    )

    op.create_index(
        op.f("ix_users_email"),
        "users",
        ["email"],
        unique=True,
    )

    op.create_index(
        op.f("ix_users_id"),
        "users",
        ["id"],
        unique=False,
    )

    # Waste bins
    op.create_table(
        "waste_bins",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("bin_code", sa.String(length=50), nullable=False),
        sa.Column(
            "location",
            geoalchemy2.types.Geometry(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                from_text="ST_GeomFromEWKT",
                name="geometry",
            ),
            nullable=False,
        ),
        sa.Column("capacity", sa.Float(), nullable=False),
        sa.Column("fill_level", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "ACTIVE",
                "INACTIVE",
                name="wastebinstatus",
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_waste_bins_bin_code"),
        "waste_bins",
        ["bin_code"],
        unique=True,
    )

    op.create_index(
        op.f("ix_waste_bins_status"),
        "waste_bins",
        ["status"],
        unique=False,
    )

    # Collection routes
    op.create_table(
        "collection_routes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("worker_id", sa.Integer(), nullable=False),
        sa.Column("route_name", sa.String(length=150), nullable=False),
        sa.Column("route_date", sa.DateTime(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "ACTIVE",
                "COMPLETED",
                "CANCELLED",
                name="routestatus",
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["worker_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_collection_routes_created_at"),
        "collection_routes",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_routes_id"),
        "collection_routes",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_routes_route_date"),
        "collection_routes",
        ["route_date"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_routes_status"),
        "collection_routes",
        ["status"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_routes_worker_id"),
        "collection_routes",
        ["worker_id"],
        unique=False,
    )

    # Concerns
    op.create_table(
        "concerns",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("reported_by", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "location",
            geoalchemy2.types.Geometry(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                from_text="ST_GeomFromEWKT",
                name="geometry",
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "OPEN",
                "IN_PROGRESS",
                "RESOLVED",
                "REJECTED",
                name="concernstatus",
            ),
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.Enum(
                "LOW",
                "MEDIUM",
                "HIGH",
                "CRITICAL",
                name="concernpriority",
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["reported_by"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_concerns_category"),
        "concerns",
        ["category"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concerns_created_at"),
        "concerns",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concerns_id"),
        "concerns",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concerns_priority"),
        "concerns",
        ["priority"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concerns_reported_by"),
        "concerns",
        ["reported_by"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concerns_status"),
        "concerns",
        ["status"],
        unique=False,
    )

    # Notifications
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column(
            "notification_type",
            sa.Enum(
                "CONCERN",
                "ASSIGNMENT",
                "SYSTEM",
                name="notificationtype",
            ),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["recipient_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_notifications_created_at"),
        "notifications",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_notifications_id"),
        "notifications",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_notifications_is_read"),
        "notifications",
        ["is_read"],
        unique=False,
    )

    op.create_index(
        op.f("ix_notifications_notification_type"),
        "notifications",
        ["notification_type"],
        unique=False,
    )

    op.create_index(
        op.f("ix_notifications_recipient_id"),
        "notifications",
        ["recipient_id"],
        unique=False,
    )

    # Suggestions
    op.create_table(
        "suggestions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("submitted_by", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "PENDING",
                "REVIEWED",
                "ACCEPTED",
                "REJECTED",
                name="suggestionstatus",
            ),
            nullable=False,
        ),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["reviewed_by"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["submitted_by"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_suggestions_created_at"),
        "suggestions",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_suggestions_id"),
        "suggestions",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_suggestions_reviewed_by"),
        "suggestions",
        ["reviewed_by"],
        unique=False,
    )

    op.create_index(
        op.f("ix_suggestions_status"),
        "suggestions",
        ["status"],
        unique=False,
    )

    op.create_index(
        op.f("ix_suggestions_submitted_by"),
        "suggestions",
        ["submitted_by"],
        unique=False,
    )

    # Assignments
    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("concern_id", sa.Integer(), nullable=False),
        sa.Column("worker_id", sa.Integer(), nullable=False),
        sa.Column("assigned_by", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "PENDING",
                "ASSIGNED",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
                name="assignmentstatus",
            ),
            nullable=False,
        ),
        sa.Column("assigned_at", sa.DateTime(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["assigned_by"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["concern_id"],
            ["concerns.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["worker_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_assignments_assigned_by"),
        "assignments",
        ["assigned_by"],
        unique=False,
    )

    op.create_index(
        op.f("ix_assignments_concern_id"),
        "assignments",
        ["concern_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_assignments_id"),
        "assignments",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_assignments_status"),
        "assignments",
        ["status"],
        unique=False,
    )

    op.create_index(
        op.f("ix_assignments_worker_id"),
        "assignments",
        ["worker_id"],
        unique=False,
    )

    # Collection points
    op.create_table(
        "collection_points",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("route_id", sa.Integer(), nullable=False),
        sa.Column("waste_bin_id", sa.UUID(), nullable=False),
        sa.Column(
            "location",
            geoalchemy2.types.Geometry(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                from_text="ST_GeomFromEWKT",
                name="geometry",
            ),
            nullable=False,
        ),
        sa.Column("sequence_order", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("collected_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["route_id"],
            ["collection_routes.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["waste_bin_id"],
            ["waste_bins.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_collection_points_id"),
        "collection_points",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_points_route_id"),
        "collection_points",
        ["route_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_points_status"),
        "collection_points",
        ["status"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collection_points_waste_bin_id"),
        "collection_points",
        ["waste_bin_id"],
        unique=False,
    )

    # Concern history
    op.create_table(
        "concern_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("concern_id", sa.Integer(), nullable=False),
        sa.Column("changed_by", sa.Integer(), nullable=False),
        sa.Column(
            "old_status",
            sa.Enum(
                "OPEN",
                "IN_PROGRESS",
                "RESOLVED",
                "REJECTED",
                name="concernstatus",
            ),
            nullable=True,
        ),
        sa.Column(
            "new_status",
            sa.Enum(
                "OPEN",
                "IN_PROGRESS",
                "RESOLVED",
                "REJECTED",
                name="concernstatus",
            ),
            nullable=False,
        ),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["changed_by"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["concern_id"],
            ["concerns.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_concern_history_changed_by"),
        "concern_history",
        ["changed_by"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_history_concern_id"),
        "concern_history",
        ["concern_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_history_created_at"),
        "concern_history",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_history_id"),
        "concern_history",
        ["id"],
        unique=False,
    )

    # Concern images
    op.create_table(
        "concern_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("concern_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["concern_id"],
            ["concerns.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_concern_images_concern_id"),
        "concern_images",
        ["concern_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_images_id"),
        "concern_images",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_images_uploaded_at"),
        "concern_images",
        ["uploaded_at"],
        unique=False,
    )

    # Concern supports
    op.create_table(
        "concern_supports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("concern_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["concern_id"],
            ["concerns.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_concern_supports_concern_id"),
        "concern_supports",
        ["concern_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_supports_created_at"),
        "concern_supports",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_supports_id"),
        "concern_supports",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_concern_supports_user_id"),
        "concern_supports",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_concern_supports_user_id"),
        table_name="concern_supports",
    )
    op.drop_index(
        op.f("ix_concern_supports_id"),
        table_name="concern_supports",
    )
    op.drop_index(
        op.f("ix_concern_supports_created_at"),
        table_name="concern_supports",
    )
    op.drop_index(
        op.f("ix_concern_supports_concern_id"),
        table_name="concern_supports",
    )
    op.drop_table("concern_supports")

    op.drop_index(
        op.f("ix_concern_images_uploaded_at"),
        table_name="concern_images",
    )
    op.drop_index(
        op.f("ix_concern_images_id"),
        table_name="concern_images",
    )
    op.drop_index(
        op.f("ix_concern_images_concern_id"),
        table_name="concern_images",
    )
    op.drop_table("concern_images")

    op.drop_index(
        op.f("ix_concern_history_id"),
        table_name="concern_history",
    )
    op.drop_index(
        op.f("ix_concern_history_created_at"),
        table_name="concern_history",
    )
    op.drop_index(
        op.f("ix_concern_history_concern_id"),
        table_name="concern_history",
    )
    op.drop_index(
        op.f("ix_concern_history_changed_by"),
        table_name="concern_history",
    )
    op.drop_table("concern_history")

    op.drop_index(
        op.f("ix_collection_points_waste_bin_id"),
        table_name="collection_points",
    )
    op.drop_index(
        op.f("ix_collection_points_status"),
        table_name="collection_points",
    )
    op.drop_index(
        op.f("ix_collection_points_route_id"),
        table_name="collection_points",
    )
    op.drop_index(
        op.f("ix_collection_points_id"),
        table_name="collection_points",
    )
    op.drop_table("collection_points")

    op.drop_index(
        op.f("ix_assignments_worker_id"),
        table_name="assignments",
    )
    op.drop_index(
        op.f("ix_assignments_status"),
        table_name="assignments",
    )
    op.drop_index(
        op.f("ix_assignments_id"),
        table_name="assignments",
    )
    op.drop_index(
        op.f("ix_assignments_concern_id"),
        table_name="assignments",
    )
    op.drop_index(
        op.f("ix_assignments_assigned_by"),
        table_name="assignments",
    )
    op.drop_table("assignments")

    op.drop_index(
        op.f("ix_suggestions_submitted_by"),
        table_name="suggestions",
    )
    op.drop_index(
        op.f("ix_suggestions_status"),
        table_name="suggestions",
    )
    op.drop_index(
        op.f("ix_suggestions_reviewed_by"),
        table_name="suggestions",
    )
    op.drop_index(
        op.f("ix_suggestions_id"),
        table_name="suggestions",
    )
    op.drop_index(
        op.f("ix_suggestions_created_at"),
        table_name="suggestions",
    )
    op.drop_table("suggestions")

    op.drop_index(
        op.f("ix_notifications_recipient_id"),
        table_name="notifications",
    )
    op.drop_index(
        op.f("ix_notifications_notification_type"),
        table_name="notifications",
    )
    op.drop_index(
        op.f("ix_notifications_is_read"),
        table_name="notifications",
    )
    op.drop_index(
        op.f("ix_notifications_id"),
        table_name="notifications",
    )
    op.drop_index(
        op.f("ix_notifications_created_at"),
        table_name="notifications",
    )
    op.drop_table("notifications")

    op.drop_index(
        op.f("ix_concerns_status"),
        table_name="concerns",
    )
    op.drop_index(
        op.f("ix_concerns_reported_by"),
        table_name="concerns",
    )
    op.drop_index(
        op.f("ix_concerns_priority"),
        table_name="concerns",
    )
    op.drop_index(
        op.f("ix_concerns_id"),
        table_name="concerns",
    )
    op.drop_index(
        op.f("ix_concerns_created_at"),
        table_name="concerns",
    )
    op.drop_index(
        op.f("ix_concerns_category"),
        table_name="concerns",
    )
    op.drop_table("concerns")

    op.drop_index(
        op.f("ix_collection_routes_worker_id"),
        table_name="collection_routes",
    )
    op.drop_index(
        op.f("ix_collection_routes_status"),
        table_name="collection_routes",
    )
    op.drop_index(
        op.f("ix_collection_routes_route_date"),
        table_name="collection_routes",
    )
    op.drop_index(
        op.f("ix_collection_routes_id"),
        table_name="collection_routes",
    )
    op.drop_index(
        op.f("ix_collection_routes_created_at"),
        table_name="collection_routes",
    )
    op.drop_table("collection_routes")

    op.drop_index(
        op.f("ix_waste_bins_status"),
        table_name="waste_bins",
    )
    op.drop_index(
        op.f("ix_waste_bins_bin_code"),
        table_name="waste_bins",
    )
    op.drop_table("waste_bins")

    op.drop_index(
        op.f("ix_users_id"),
        table_name="users",
    )
    op.drop_index(
        op.f("ix_users_email"),
        table_name="users",
    )
    op.drop_table("users")