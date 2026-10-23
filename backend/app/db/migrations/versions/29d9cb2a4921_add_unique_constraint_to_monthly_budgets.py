
"""Add unique constraint to monthly budgets.

Revision ID: 29d9cb2a4921
Revises: c24e83935b73
"""

from typing import Sequence, Union

from alembic import op


# Revision identifiers used by Alembic.
revision: str = "29d9cb2a4921"
down_revision: Union[str, Sequence[str], None] = "c24e83935b73"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add a unique budget per user per month."""
    op.create_unique_constraint(
        "uq_budgets_user_id_month",
        "budgets",
        ["user_id", "month"],
    )


def downgrade() -> None:
    """Remove the monthly budget unique constraint."""
    op.drop_constraint(
        "uq_budgets_user_id_month",
        "budgets",
        type_="unique",
    )
