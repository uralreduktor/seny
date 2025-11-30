"""nomenclature_rebuild

Revision ID: 734112275faa
Revises: 70b44b096a5f
Create Date: 2025-11-28 18:42:07.775842

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "734112275faa"
down_revision: Union[str, None] = "70b44b096a5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "nomenclature_nodes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "parent_id",
            sa.Integer(),
            sa.ForeignKey("nomenclature_nodes.id", ondelete="SET NULL"),
        ),
        sa.Column("code", sa.String(length=32), nullable=False, unique=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("node_type", sa.String(length=20), nullable=False),
        sa.Column("depth", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "effective_from",
            sa.DateTime(timezone=True),
            server_default=sa.text("timezone('utc', now())"),
        ),
        sa.Column("effective_to", sa.DateTime(timezone=True)),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="draft"
        ),
        sa.Column(
            "is_archived", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.create_index(
        op.f("ix_nomenclature_nodes_status"),
        "nomenclature_nodes",
        ["status"],
        unique=False,
    )
    op.create_index(
        op.f("ix_nomenclature_nodes_node_type"),
        "nomenclature_nodes",
        ["node_type"],
        unique=False,
    )

    op.create_table(
        "nomenclature_attribute_presets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=50), nullable=False, unique=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("json_schema", postgresql.JSONB(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="published"
        ),
        sa.Column("description", sa.Text()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("timezone('utc', now())"),
        ),
    )

    op.create_table(
        "nomenclature_class_schema",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "node_id",
            sa.Integer(),
            sa.ForeignKey("nomenclature_nodes.id"),
            nullable=False,
        ),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="draft"
        ),
        sa.Column("json_schema", postgresql.JSONB(), nullable=False),
        sa.Column(
            "metadata",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("comment", sa.Text()),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("timezone('utc', now())"),
        ),
    )
    op.create_index(
        op.f("ix_nomenclature_class_schema_status"),
        "nomenclature_class_schema",
        ["status"],
        unique=False,
    )

    op.create_table(
        "class_schema_presets",
        sa.Column(
            "class_schema_id",
            sa.Integer(),
            sa.ForeignKey("nomenclature_class_schema.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "preset_id",
            sa.Integer(),
            sa.ForeignKey("nomenclature_attribute_presets.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "mode", sa.String(length=10), nullable=False, server_default="include"
        ),
    )

    op.create_table(
        "nomenclature_card_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "card_id",
            sa.Integer(),
            sa.ForeignKey("nomenclatures.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column(
            "diff_payload",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="draft"
        ),
        sa.Column(
            "author_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")
        ),
        sa.Column("comment", sa.Text()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("timezone('utc', now())"),
        ),
    )
    op.create_index(
        op.f("ix_nomenclature_card_versions_card_id"),
        "nomenclature_card_versions",
        ["card_id"],
        unique=False,
    )

    op.create_table(
        "nomenclature_card_synonyms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "card_id",
            sa.Integer(),
            sa.ForeignKey("nomenclatures.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("value", sa.String(length=255), nullable=False),
        sa.Column(
            "locale", sa.String(length=10), nullable=False, server_default="ru-RU"
        ),
        sa.UniqueConstraint("card_id", "value", "locale", name="uq_card_synonym"),
    )

    op.create_table(
        "nomenclature_card_usage",
        sa.Column(
            "card_id",
            sa.Integer(),
            sa.ForeignKey("nomenclatures.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "position_id",
            sa.Integer(),
            sa.ForeignKey("positions.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("usage_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("average_price", sa.Numeric(15, 2)),
        sa.Column(
            "last_used_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("timezone('utc', now())"),
        ),
    )

    with op.batch_alter_table("nomenclatures") as batch_op:
        batch_op.alter_column("name", new_column_name="canonical_name")
        batch_op.alter_column("price_updated_at", new_column_name="price_valid_until")
        batch_op.add_column(sa.Column("code", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("node_id", sa.Integer(), nullable=True))
        batch_op.add_column(
            sa.Column("node_version", sa.Integer(), nullable=False, server_default="1")
        )
        batch_op.add_column(
            sa.Column(
                "lifecycle_status",
                sa.String(length=20),
                nullable=False,
                server_default="draft",
            )
        )
        batch_op.add_column(sa.Column("lifecycle_reason", sa.String(length=255)))
        batch_op.add_column(
            sa.Column(
                "effective_from",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("timezone('utc', now())"),
            )
        )
        batch_op.add_column(sa.Column("effective_to", sa.DateTime(timezone=True)))
        batch_op.add_column(
            sa.Column(
                "attributes_payload",
                postgresql.JSONB(),
                nullable=False,
                server_default=sa.text("'{}'::jsonb"),
            )
        )
        batch_op.add_column(
            sa.Column(
                "methodology_ids",
                postgresql.ARRAY(sa.Integer()),
                nullable=False,
                server_default=sa.text("'{}'::int[]"),
            )
        )
        batch_op.add_column(sa.Column("last_reviewed_at", sa.DateTime(timezone=True)))
        batch_op.add_column(sa.Column("ai_embedding", Vector(3072)))

    op.create_foreign_key(
        "fk_nomenclatures_node_id",
        "nomenclatures",
        "nomenclature_nodes",
        ["node_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        op.f("ix_nomenclatures_node_id"), "nomenclatures", ["node_id"], unique=False
    )
    op.create_index(
        op.f("ix_nomenclatures_lifecycle_status"),
        "nomenclatures",
        ["lifecycle_status"],
        unique=False,
    )

    op.execute(
        "UPDATE nomenclatures SET code = CONCAT('LEG-', id) WHERE code IS NULL OR code = ''"
    )
    op.execute(
        "UPDATE nomenclatures SET lifecycle_status = CASE WHEN is_active IS TRUE THEN 'active' ELSE 'draft' END"
    )
    op.execute(
        "UPDATE nomenclatures SET attributes_payload = COALESCE(standard_parameters, '{}'::jsonb)"
    )

    with op.batch_alter_table("nomenclatures") as batch_op:
        batch_op.alter_column("code", nullable=False)

    op.create_unique_constraint("uq_nomenclatures_code", "nomenclatures", ["code"])


def downgrade() -> None:
    op.drop_constraint("uq_nomenclatures_code", "nomenclatures", type_="unique")
    op.drop_constraint("fk_nomenclatures_node_id", "nomenclatures", type_="foreignkey")
    op.drop_index(op.f("ix_nomenclatures_lifecycle_status"), table_name="nomenclatures")
    op.drop_index(op.f("ix_nomenclatures_node_id"), table_name="nomenclatures")

    with op.batch_alter_table("nomenclatures") as batch_op:
        batch_op.drop_column("ai_embedding")
        batch_op.drop_column("last_reviewed_at")
        batch_op.drop_column("methodology_ids")
        batch_op.drop_column("attributes_payload")
        batch_op.drop_column("effective_to")
        batch_op.drop_column("effective_from")
        batch_op.drop_column("lifecycle_reason")
        batch_op.drop_column("lifecycle_status")
        batch_op.drop_column("node_version")
        batch_op.drop_column("node_id")
        batch_op.drop_column("code")
        batch_op.alter_column("price_valid_until", new_column_name="price_updated_at")
        batch_op.alter_column("canonical_name", new_column_name="name")

    op.drop_table("nomenclature_card_usage")
    op.drop_table("nomenclature_card_synonyms")
    op.drop_index(
        op.f("ix_nomenclature_card_versions_card_id"),
        table_name="nomenclature_card_versions",
    )
    op.drop_table("nomenclature_card_versions")
    op.drop_table("class_schema_presets")
    op.drop_index(
        op.f("ix_nomenclature_class_schema_status"),
        table_name="nomenclature_class_schema",
    )
    op.drop_table("nomenclature_class_schema")
    op.drop_table("nomenclature_attribute_presets")
    op.drop_index(
        op.f("ix_nomenclature_nodes_node_type"), table_name="nomenclature_nodes"
    )
    op.drop_index(op.f("ix_nomenclature_nodes_status"), table_name="nomenclature_nodes")
    op.drop_table("nomenclature_nodes")
