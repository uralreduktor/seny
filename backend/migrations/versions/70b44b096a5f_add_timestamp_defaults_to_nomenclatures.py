"""add timestamp defaults to nomenclatures

Revision ID: 70b44b096a5f
Revises: 6902cc744a95
Create Date: 2025-11-28 07:28:18.165170

"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "70b44b096a5f"
down_revision: Union[str, None] = "6902cc744a95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE nomenclatures SET created_at = timezone('utc', now()) WHERE created_at IS NULL;"
    )
    op.execute(
        "UPDATE nomenclatures SET updated_at = timezone('utc', now()) WHERE updated_at IS NULL;"
    )

    op.alter_column(
        "nomenclatures",
        "created_at",
        existing_type=sa.DateTime(),
        server_default=sa.text("timezone('utc', now())"),
        nullable=False,
    )
    op.alter_column(
        "nomenclatures",
        "updated_at",
        existing_type=sa.DateTime(),
        server_default=sa.text("timezone('utc', now())"),
        nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "nomenclatures",
        "updated_at",
        existing_type=sa.DateTime(),
        server_default=None,
        nullable=True,
    )
    op.alter_column(
        "nomenclatures",
        "created_at",
        existing_type=sa.DateTime(),
        server_default=None,
        nullable=True,
    )
