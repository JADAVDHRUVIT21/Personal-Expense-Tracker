
"""Add case-insensitive unique email index.

Revision ID: 55109c974002
Revises: 29d9cb2a4921
"""

from typing import Sequence, Union

from alembic import op


revision: str = "55109c974002"
down_revision: Union[str, Sequence[str], None] = "29d9cb2a4921"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Prevent duplicate email addresses regardless of capitalization."""
    op.execute(
        "CREATE UNIQUE INDEX ix_users_email_lower_unique "
        "ON users (LOWER(email))"
    )


def downgrade() -> None:
    """Remove the case-insensitive email index."""
    op.drop_index(
        "ix_users_email_lower_unique",
        table_name="users",
    )
