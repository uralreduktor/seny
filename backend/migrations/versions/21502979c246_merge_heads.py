"""merge_heads

Revision ID: 21502979c246
Revises: 734112275faa, c79d47e5ce0e
Create Date: 2025-11-28 18:50:40.109568

"""

from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "21502979c246"
down_revision: Union[str, None] = ("734112275faa", "c79d47e5ce0e")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
