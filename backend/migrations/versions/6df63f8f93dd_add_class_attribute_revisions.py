"""add class_attribute_revisions

Revision ID: 6df63f8f93dd
Revises: 3c1e729f3c2f
Create Date: 2025-11-29 15:05:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "6df63f8f93dd"
down_revision: Union[str, None] = "3c1e729f3c2f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "class_attribute_revisions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("schema_id", sa.Integer(), nullable=False),
        sa.Column("node_id", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column(
            "diff_payload",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("author_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("timezone('utc', now())"),
        ),
        sa.ForeignKeyConstraint(
            ["schema_id"],
            ["nomenclature_class_schema.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_class_attribute_revisions_schema",
        "class_attribute_revisions",
        ["schema_id"],
    )
    op.create_index(
        "ix_class_attribute_revisions_node_version",
        "class_attribute_revisions",
        ["node_id", "version"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_class_attribute_revisions_node_version",
        table_name="class_attribute_revisions",
    )
    op.drop_index(
        "ix_class_attribute_revisions_schema",
        table_name="class_attribute_revisions",
    )
    op.drop_table("class_attribute_revisions")
