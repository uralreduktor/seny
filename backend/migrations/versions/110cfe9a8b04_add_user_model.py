"""add_user_model

Revision ID: 110cfe9a8b04
Revises: fa2b1697a009
Create Date: 2025-11-26 14:27:46.433815

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "110cfe9a8b04"
down_revision: Union[str, None] = "fa2b1697a009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop foreign keys first
    # Note: We use a generic name or try to guess. If this fails, we might need to check DB for exact name.
    # Postgres default naming: <table>_<column>_fkey
    op.drop_constraint(
        "nomenclatures_created_by_id_fkey", "nomenclatures", type_="foreignkey"
    )
    op.drop_constraint(
        "nomenclatures_last_editor_id_fkey", "nomenclatures", type_="foreignkey"
    )

    # Drop columns in nomenclatures and re-add as UUID
    op.drop_column("nomenclatures", "created_by_id")
    op.drop_column("nomenclatures", "last_editor_id")
    op.add_column("nomenclatures", sa.Column("created_by_id", sa.Uuid(), nullable=True))
    op.add_column(
        "nomenclatures", sa.Column("last_editor_id", sa.Uuid(), nullable=True)
    )

    # Drop users table and recreate with new schema
    op.drop_table("users")
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True, default=True),
        sa.Column("is_superuser", sa.Boolean(), nullable=True, default=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # Re-create Foreign Keys
    op.create_foreign_key(None, "nomenclatures", "users", ["created_by_id"], ["id"])
    op.create_foreign_key(None, "nomenclatures", "users", ["last_editor_id"], ["id"])


def downgrade() -> None:
    # Reverse the operations
    op.drop_constraint(
        "nomenclatures_last_editor_id_fkey", "nomenclatures", type_="foreignkey"
    )
    op.drop_constraint(
        "nomenclatures_created_by_id_fkey", "nomenclatures", type_="foreignkey"
    )

    op.drop_table("users")
    # Recreate old users table (simplified for downgrade)
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_index("ix_users_is_active", "users", ["is_active"], unique=False)
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.drop_column("nomenclatures", "last_editor_id")
    op.drop_column("nomenclatures", "created_by_id")
    op.add_column(
        "nomenclatures", sa.Column("created_by_id", sa.Integer(), nullable=True)
    )
    op.add_column(
        "nomenclatures", sa.Column("last_editor_id", sa.Integer(), nullable=True)
    )

    op.create_foreign_key(
        "nomenclatures_created_by_id_fkey",
        "nomenclatures",
        "users",
        ["created_by_id"],
        ["id"],
    )
    op.create_foreign_key(
        "nomenclatures_last_editor_id_fkey",
        "nomenclatures",
        "users",
        ["last_editor_id"],
        ["id"],
    )
