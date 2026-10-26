
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def create_expense(
    db: Session,
    expense_data: ExpenseCreate,
    user_id: int,
) -> Expense:
    category = db.scalar(
        select(Category).where(
            Category.id == expense_data.category_id
        )
    )

    if category is None:
        raise ValueError("Category not found.")

    title = expense_data.title.strip()

    if not title:
        raise ValueError("Expense title cannot be empty.")

    expense = Expense(
        amount=expense_data.amount,
        title=title,
        description=expense_data.description,
        expense_date=expense_data.expense_date,
        category_id=expense_data.category_id,
        user_id=user_id,
    )

    try:
        db.add(expense)
        db.commit()
        db.refresh(expense)
    except Exception:
        db.rollback()
        raise

    return expense


def get_expenses(
    db: Session,
    user_id: int,
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    min_amount: Decimal | None = None,
    max_amount: Decimal | None = None,
    sort_by: str = "expense_date",
    sort_order: str = "desc",
) -> list[Expense]:
    query = select(Expense).where(
        Expense.user_id == user_id
    )

    if category_id is not None:
        query = query.where(
            Expense.category_id == category_id
        )

    if start_date is not None:
        query = query.where(
            Expense.expense_date >= start_date
        )

    if end_date is not None:
        query = query.where(
            Expense.expense_date <= end_date
        )

    if min_amount is not None:
        query = query.where(
            Expense.amount >= min_amount
        )

    if max_amount is not None:
        query = query.where(
            Expense.amount <= max_amount
        )

    sort_columns = {
        "expense_date": Expense.expense_date,
        "amount": Expense.amount,
        "title": Expense.title,
        "created_at": Expense.created_at,
    }

    sort_column = sort_columns[sort_by]

    if sort_order == "asc":
        query = query.order_by(
            sort_column.asc(),
            Expense.id.asc(),
        )
    else:
        query = query.order_by(
            sort_column.desc(),
            Expense.id.desc(),
        )

    return list(db.scalars(query).all())


def get_expense_by_id(
    db: Session,
    expense_id: int,
    user_id: int,
) -> Expense | None:
    return db.scalar(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == user_id,
        )
    )


def update_expense(
    db: Session,
    expense: Expense,
    expense_data: ExpenseUpdate,
) -> Expense:
    updates = expense_data.model_dump(
        exclude_unset=True
    )

    if "title" in updates and updates["title"] is not None:
        updates["title"] = updates["title"].strip()

        if not updates["title"]:
            raise ValueError(
                "Expense title cannot be empty."
            )

    if (
        "category_id" in updates
        and updates["category_id"] is not None
    ):
        category = db.scalar(
            select(Category).where(
                Category.id == updates["category_id"]
            )
        )

        if category is None:
            raise ValueError("Category not found.")

    for field, value in updates.items():
        setattr(expense, field, value)

    try:
        db.commit()
        db.refresh(expense)
    except Exception:
        db.rollback()
        raise

    return expense


def delete_expense(
    db: Session,
    expense: Expense,
) -> None:
    try:
        db.delete(expense)
        db.commit()
    except Exception:
        db.rollback()
        raise
