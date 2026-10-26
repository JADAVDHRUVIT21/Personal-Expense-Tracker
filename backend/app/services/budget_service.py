from datetime import date

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate


def create_budget(
    db: Session,
    budget_data: BudgetCreate,
    user_id: int,
) -> Budget:
    existing_budget = db.scalar(
        select(Budget).where(
            Budget.user_id == user_id,
            Budget.month == budget_data.month,
        )
    )

    if existing_budget is not None:
        raise ValueError("A budget already exists for this month.")

    budget = Budget(
        amount=budget_data.amount,
        month=budget_data.month,
        user_id=user_id,
    )

    try:
        db.add(budget)
        db.commit()
        db.refresh(budget)
    except IntegrityError as exc:
        db.rollback()
        raise ValueError(
            "A budget already exists for this month."
        ) from exc
    except Exception:
        db.rollback()
        raise

    return budget


def get_budgets(
    db: Session,
    user_id: int,
    year: int | None = None,
) -> list[Budget]:
    query = select(Budget).where(Budget.user_id == user_id)

    if year is not None:
        query = query.where(
            Budget.month >= date(year, 1, 1),
            Budget.month < date(year + 1, 1, 1),
        )

    query = query.order_by(Budget.month.desc())

    return list(db.scalars(query).all())


def get_budget_by_id(
    db: Session,
    budget_id: int,
    user_id: int,
) -> Budget | None:
    return db.scalar(
        select(Budget).where(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
    )


def update_budget(
    db: Session,
    budget: Budget,
    budget_data: BudgetUpdate,
) -> Budget:
    updates = budget_data.model_dump(exclude_unset=True)

    if not updates:
        raise ValueError("Provide at least one field to update.")

    for field, value in updates.items():
        setattr(budget, field, value)

    try:
        db.commit()
        db.refresh(budget)
    except IntegrityError as exc:
        db.rollback()
        raise ValueError(
            "The budget conflicts with an existing database record."
        ) from exc
    except Exception:
        db.rollback()
        raise

    return budget


def delete_budget(db: Session, budget: Budget) -> None:
    try:
        db.delete(budget)
        db.commit()
    except Exception:
        db.rollback()
        raise