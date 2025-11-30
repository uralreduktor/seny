"""merge heads after search improvements

Revision ID: 707fc7c74066
Revises: 6df63f8f93dd, 9b07c1e2fa3e
Create Date: 2025-11-29 20:16:46.956864

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "707fc7c74066"
down_revision: Union[str, None] = ("6df63f8f93dd", "9b07c1e2fa3e")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
