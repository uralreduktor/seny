"""add trigram index for nomenclature search

Revision ID: 9b07c1e2fa3e
Revises: 14a3405216d4
Create Date: 2025-11-29 14:45:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9b07c1e2fa3e"
down_revision: Union[str, None] = "14a3405216d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.create_index(
        "ix_nomenclatures_canonical_name_trgm",
        "nomenclatures",
        ["canonical_name"],
        postgresql_using="gin",
        postgresql_ops={"canonical_name": "gin_trgm_ops"},
    )


def downgrade() -> None:
    op.drop_index("ix_nomenclatures_canonical_name_trgm", table_name="nomenclatures")
