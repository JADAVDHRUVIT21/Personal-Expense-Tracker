from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate


DEFAULT_CATEGORIES = [
    {
        "name": "Food",
        "description": "Meals, groceries, and dining",
    },
    {
        "name": "Travel",
        "description": "Transport, fuel, and travel expenses",
    },
    {
        "name": "Shopping",
        "description": "Clothing and personal purchases",
    },
    {
        "name": "Bills",
        "description": "Utilities and recurring bills",
    },
    {
        "name": "Healthcare",
        "description": "Medical and healthcare expenses",
    },
    {
        "name": "Entertainment",
        "description": "Movies, games, and leisure activities",
    },
    {
        "name": "Education",
        "description": "Courses, books, and learning expenses",
    },
    {
        "name": "Other",
        "description": "Expenses that do not fit other categories",
    },
]


def seed_default_categories(db: Session) -> None:
    """Insert default categories that do not already exist."""

    existing_names = {
        name.casefold()
        for name in db.scalars(select(Category.name)).all()
    }

    missing_categories = [
        Category(
            name=item["name"],
            description=item["description"],
            is_default=True,
        )
        for item in DEFAULT_CATEGORIES
        if item["name"].casefold() not in existing_names
    ]

    if not missing_categories:
        return

    try:
        db.add_all(missing_categories)
        db.commit()
    except IntegrityError:
        db.rollback()

        # Another request may have inserted the categories
        # concurrently. Recheck before deciding whether to fail.
        existing_names = {
            name.casefold()
            for name in db.scalars(select(Category.name)).all()
        }

        if any(
            item["name"].casefold() not in existing_names
            for item in DEFAULT_CATEGORIES
        ):
            raise


def get_categories(db: Session) -> list[Category]:
    """Return all categories ordered by name."""

    return list(
        db.scalars(
            select(Category).order_by(Category.name.asc())
        ).all()
    )


def create_category(
    db: Session,
    category_data: CategoryCreate,
) -> Category:
    """Create a category unless its name already exists."""

    name = category_data.name.strip()

    if len(name) < 2:
        raise ValueError(
            "Category name must contain at least 2 characters."
        )

    existing_category = db.scalar(
        select(Category).where(
            func.lower(Category.name) == name.lower()
        )
    )

    if existing_category is not None:
        raise ValueError(
            "A category with this name already exists."
        )

    category = Category(
        name=name,
        description=category_data.description,
        is_default=False,
    )

    try:
        db.add(category)
        db.commit()
        db.refresh(category)
    except Exception:
        db.rollback()
        raise

    return category