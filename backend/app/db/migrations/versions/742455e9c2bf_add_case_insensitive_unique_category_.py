"""Add case-insensitive unique category name index.

Revision ID: 742455e9c2bf
Revises: 55109c974002
"""

from typing import Sequence, Union

from alembic import op


revision: str = "742455e9c2bf"
down_revision: Union[str, Sequence[str], None] = "55109c974002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Enforce case-insensitive category name uniqueness."""

    op.execute(
        """
        CREATE UNIQUE INDEX ix_categories_name_lower_unique
        ON categories (LOWER(name))
        """
    )


def downgrade() -> None:
    """Remove the case-insensitive category name index."""

    op.drop_index(
        "ix_categories_name_lower_unique",
        table_name="categories",
    )