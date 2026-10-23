
from datetime import date

from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.expense import Expense


def get_dashboard_analytics(
    db: Session,
    user_id: int,
    year: int | None = None,
) -> dict:
    # Calculate overall expense totals for the authenticated user.
    totals_query = select(
        func.coalesce(func.sum(Expense.amount), 0),
        func.count(Expense.id),
    ).where(Expense.user_id == user_id)

    if year is not None:
        totals_query = totals_query.where(
            Expense.expense_date >= date(year, 1, 1),
            Expense.expense_date < date(year + 1, 1, 1),
        )

    total_expenses, expense_count = db.execute(
        totals_query
    ).one()

    # Calculate monthly expense totals.
    monthly_query = (
        select(
            extract("year", Expense.expense_date).label("year"),
            extract("month", Expense.expense_date).label("month"),
            func.coalesce(func.sum(Expense.amount), 0).label(
                "total_expenses"
            ),
            func.count(Expense.id).label("expense_count"),
        )
        .where(Expense.user_id == user_id)
    )

    if year is not None:
        monthly_query = monthly_query.where(
            Expense.expense_date >= date(year, 1, 1),
            Expense.expense_date < date(year + 1, 1, 1),
        )

    monthly_rows = db.execute(
        monthly_query
        .group_by(
            extract("year", Expense.expense_date),
            extract("month", Expense.expense_date),
        )
        .order_by(
            extract("year", Expense.expense_date),
            extract("month", Expense.expense_date),
        )
    ).all()

    monthly_summary = [
        {
            "year": int(row.year),
            "month": int(row.month),
            "total_expenses": row.total_expenses,
            "expense_count": row.expense_count,
        }
        for row in monthly_rows
    ]

    # Calculate category-wise expense totals.
    category_query = (
        select(
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            func.coalesce(func.sum(Expense.amount), 0).label(
                "total_expenses"
            ),
            func.count(Expense.id).label("expense_count"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where(Expense.user_id == user_id)
    )

    if year is not None:
        category_query = category_query.where(
            Expense.expense_date >= date(year, 1, 1),
            Expense.expense_date < date(year + 1, 1, 1),
        )

    category_rows = db.execute(
        category_query
        .group_by(Category.id, Category.name)
        .order_by(func.sum(Expense.amount).desc())
    ).all()

    category_summary = [
        {
            "category_id": row.category_id,
            "category_name": row.category_name,
            "total_expenses": row.total_expenses,
            "expense_count": row.expense_count,
        }
        for row in category_rows
    ]

    return {
        "total_expenses": total_expenses,
        "expense_count": expense_count,
        "monthly_summary": monthly_summary,
        "category_summary": category_summary,
    }
