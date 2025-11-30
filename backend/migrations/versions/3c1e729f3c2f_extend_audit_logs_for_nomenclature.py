"""extend audit logs for nomenclature context

Revision ID: 3c1e729f3c2f
Revises: 14a3405216d4
Create Date: 2025-11-29 14:10:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c1e729f3c2f"
down_revision: Union[str, None] = "14a3405216d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "audit_logs",
        "tender_id",
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.add_column(
        "audit_logs",
        sa.Column(
            "entity_type",
            sa.String(length=50),
            nullable=False,
            server_default=sa.text("'tender'"),
        ),
    )
    op.add_column(
        "audit_logs",
        sa.Column("entity_id", sa.Integer(), nullable=True),
    )
    op.execute(
        """
        UPDATE audit_logs
        SET entity_type = 'tender',
            entity_id = tender_id
        WHERE entity_type IS NULL
        """
    )
    op.create_index(
        "ix_audit_logs_entity",
        "audit_logs",
        ["entity_type", "entity_id"],
    )
    op.alter_column(
        "audit_logs",
        "entity_type",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_index("ix_audit_logs_entity", table_name="audit_logs")
    op.drop_column("audit_logs", "entity_id")
    op.drop_column("audit_logs", "entity_type")
    op.alter_column(
        "audit_logs",
        "tender_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
