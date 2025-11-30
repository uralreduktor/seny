"""add_node_versions_and_card_codes

Revision ID: b4bd5d6a3a2e
Revises: fa2b1697a009
Create Date: 2025-11-29 10:25:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b4bd5d6a3a2e"
down_revision: Union[str, None] = "fa2b1697a009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "nomenclature_node_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "node_id",
            sa.Integer(),
            sa.ForeignKey("nomenclature_nodes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("node_type", sa.String(length=20), nullable=False),
        sa.Column(
            "depth",
            sa.SmallInteger(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("effective_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effective_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("timezone('utc', now())"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "node_id",
            "version",
            name="uq_nomenclature_node_version",
        ),
    )
    op.create_index(
        "ix_nomenclature_node_versions_node_id",
        "nomenclature_node_versions",
        ["node_id"],
    )
    op.create_index(
        "ix_nomenclature_node_versions_node_type",
        "nomenclature_node_versions",
        ["node_type"],
    )
    op.create_index(
        "ix_nomenclature_node_versions_status",
        "nomenclature_node_versions",
        ["status"],
    )

    op.add_column(
        "nomenclatures",
        sa.Column("segment_code", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "nomenclatures",
        sa.Column("family_code", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "nomenclatures",
        sa.Column("class_code", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "nomenclatures",
        sa.Column("category_code", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "nomenclatures",
        sa.Column("price_confidence", sa.Numeric(5, 2), nullable=True),
    )
    op.add_column(
        "nomenclatures",
        sa.Column(
            "related_nomenclature_ids",
            postgresql.ARRAY(sa.Integer()),
            nullable=False,
            server_default=sa.text("ARRAY[]::integer[]"),
        ),
    )
    op.add_column(
        "nomenclatures",
        sa.Column(
            "audit_log_id",
            sa.Integer(),
            sa.ForeignKey("audit_logs.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_nomenclatures_segment_code", "nomenclatures", ["segment_code"])
    op.create_index("ix_nomenclatures_family_code", "nomenclatures", ["family_code"])
    op.create_index("ix_nomenclatures_class_code", "nomenclatures", ["class_code"])
    op.create_index(
        "ix_nomenclatures_category_code", "nomenclatures", ["category_code"]
    )

    op.execute(
        """
        WITH RECURSIVE ancestors AS (
            SELECT
                nn.id AS current_id,
                nn.id AS leaf_id,
                nn.parent_id,
                nn.code,
                nn.node_type
            FROM nomenclature_nodes nn
            UNION ALL
            SELECT
                parent.id,
                ancestors.leaf_id,
                parent.parent_id,
                parent.code,
                parent.node_type
            FROM ancestors
            JOIN nomenclature_nodes parent ON ancestors.parent_id = parent.id
        ),
        aggregated AS (
            SELECT
                leaf_id,
                MAX(CASE WHEN node_type = 'segment' THEN code END) AS segment_code,
                MAX(CASE WHEN node_type = 'family' THEN code END) AS family_code,
                MAX(CASE WHEN node_type = 'class' THEN code END) AS class_code,
                MAX(CASE WHEN node_type = 'category' THEN code END) AS category_code
            FROM ancestors
            GROUP BY leaf_id
        )
        UPDATE nomenclatures n
        SET
            segment_code = aggregated.segment_code,
            family_code = aggregated.family_code,
            class_code = aggregated.class_code,
            category_code = aggregated.category_code
        FROM aggregated
        WHERE n.node_id = aggregated.leaf_id
        """
    )

    op.execute(
        """
        INSERT INTO nomenclature_node_versions (
            node_id,
            parent_id,
            code,
            name,
            node_type,
            depth,
            version,
            status,
            is_archived,
            effective_from,
            effective_to,
            metadata,
            created_at
        )
        SELECT
            id,
            parent_id,
            code,
            name,
            node_type,
            depth,
            version,
            status,
            is_archived,
            effective_from,
            effective_to,
            metadata,
            timezone('utc', now())
        FROM nomenclature_nodes
        """
    )


def downgrade() -> None:
    op.drop_index(
        "ix_nomenclatures_category_code",
        table_name="nomenclatures",
    )
    op.drop_index("ix_nomenclatures_class_code", table_name="nomenclatures")
    op.drop_index("ix_nomenclatures_family_code", table_name="nomenclatures")
    op.drop_index("ix_nomenclatures_segment_code", table_name="nomenclatures")
    op.drop_column("nomenclatures", "audit_log_id")
    op.drop_column("nomenclatures", "related_nomenclature_ids")
    op.drop_column("nomenclatures", "price_confidence")
    op.drop_column("nomenclatures", "category_code")
    op.drop_column("nomenclatures", "class_code")
    op.drop_column("nomenclatures", "family_code")
    op.drop_column("nomenclatures", "segment_code")

    op.drop_index(
        "ix_nomenclature_node_versions_status",
        table_name="nomenclature_node_versions",
    )
    op.drop_index(
        "ix_nomenclature_node_versions_node_type",
        table_name="nomenclature_node_versions",
    )
    op.drop_index(
        "ix_nomenclature_node_versions_node_id",
        table_name="nomenclature_node_versions",
    )
    op.drop_table("nomenclature_node_versions")
