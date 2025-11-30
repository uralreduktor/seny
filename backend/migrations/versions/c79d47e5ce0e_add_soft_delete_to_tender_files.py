"""add soft delete columns to tender files

Revision ID: c79d47e5ce0e
Revises: 110cfe9a8b04
Create Date: 2025-11-28 12:34:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c79d47e5ce0e"
down_revision: Union[str, None] = "110cfe9a8b04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tender_files",
        sa.Column(
            "is_archived", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.add_column(
        "tender_files",
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tender_files", "archived_at")
    op.drop_column("tender_files", "is_archived")
