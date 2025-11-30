"""merge heads after node versions

Revision ID: 14a3405216d4
Revises: 21502979c246, b4bd5d6a3a2e
Create Date: 2025-11-29 13:01:31.162405

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "14a3405216d4"
down_revision: Union[str, None] = ("21502979c246", "b4bd5d6a3a2e")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
