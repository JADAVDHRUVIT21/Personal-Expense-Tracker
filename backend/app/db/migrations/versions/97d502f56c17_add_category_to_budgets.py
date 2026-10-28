
"""add category to budgets

Revision ID: 97d502f56c17
Revises: 742455e9c2bf
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "97d502f56c17"
down_revision: Union[str, Sequence[str], None] = "742455e9c2bf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the new field as nullable first to preserve existing rows.
    op.add_column(
        "budgets",
        sa.Column("category_id", sa.Integer(), nullable=True),
    )

    # Assign the existing budgets to Food (category ID 1).
    op.execute(
        sa.text(
            "UPDATE budgets SET category_id = 1 "
            "WHERE category_id IS NULL"
        )
    )

    # Make category_id mandatory.
    op.alter_column(
        "budgets",
        "category_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # Link budgets to categories.
    op.create_foreign_key(
        "fk_budgets_category_id_categories",
        "budgets",
        "categories",
        ["category_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_index(
        "ix_budgets_category_id",
        "budgets",
        ["category_id"],
        unique=False,
    )

    # Remove the old one-budget-per-user-per-month constraint.
    op.drop_constraint(
        "uq_budgets_user_id_month",
        "budgets",
        type_="unique",
    )

    # Allow one budget per category for each user and month.
    op.create_unique_constraint(
        "uq_budgets_user_category_month",
        "budgets",
        ["user_id", "category_id", "month"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_budgets_user_category_month",
        "budgets",
        type_="unique",
    )

    op.create_unique_constraint(
        "uq_budgets_user_id_month",
        "budgets",
        ["user_id", "month"],
    )

    op.drop_index(
        "ix_budgets_category_id",
        table_name="budgets",
    )

    op.drop_constraint(
        "fk_budgets_category_id_categories",
        "budgets",
        type_="foreignkey",
    )

    op.drop_column("budgets", "category_id")
