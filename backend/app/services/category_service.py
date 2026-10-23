
from sqlalchemy import select
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

    existing_names = set(
        db.scalars(select(Category.name)).all()
    )

    missing_categories = [
        Category(
            name=item["name"],
            description=item["description"],
            is_default=True,
        )
        for item in DEFAULT_CATEGORIES
        if item["name"] not in existing_names
    ]

    if not missing_categories:
        return

    db.add_all(missing_categories)

    try:
        db.commit()
    except Exception:
        db.rollback()
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

    if not name:
        raise ValueError("Category name cannot be empty.")

    existing_category = db.scalar(
        select(Category).where(Category.name.ilike(name))
    )

    if existing_category:
        raise ValueError("A category with this name already exists.")

    category = Category(
        name=name,
        description=category_data.description,
        is_default=False,
    )

    db.add(category)

    try:
        db.commit()
        db.refresh(category)
    except Exception:
        db.rollback()
        raise

    return category
