
from datetime import datetime
from decimal import Decimal
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.dependencies import get_current_user
from app.main import app
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.schemas.category import CategoryCreate
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

client = TestClient(app)


# Root and health endpoint tests

def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == (
        "Personal Expense Tracker API is running"
    )


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# Authentication requirement tests

def test_expenses_require_authentication():
    response = client.get("/api/v1/expenses")

    assert response.status_code in (401, 403)


def test_categories_require_authentication():
    response = client.get("/api/v1/categories")

    assert response.status_code in (401, 403)


def test_budgets_require_authentication():
    response = client.get("/api/v1/budgets")

    assert response.status_code in (401, 403)


def test_analytics_requires_authentication():
    response = client.get("/api/v1/analytics/dashboard")

    assert response.status_code in (401, 403)


# Expense filter registration tests

def test_expense_filters_are_registered():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    parameters = response.json()["paths"][
        "/api/v1/expenses"
    ]["get"]["parameters"]

    parameter_names = {
        parameter["name"] for parameter in parameters
    }

    assert {
        "category_id",
        "start_date",
        "end_date",
        "min_amount",
        "max_amount",
        "sort_by",
        "sort_order",
    }.issubset(parameter_names)


# Authentication API tests

def test_register_endpoint():
    fake_user = {
        "id": 999999,
        "full_name": "API Test User",
        "email": "api-test@example.com",
        "is_active": True,
        "created_at": datetime(2026, 10, 22, 10, 0, 0),
    }

    with patch(
        "app.api.routes.auth.register_user",
        return_value=fake_user,
    ):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "API Test User",
                "email": "api-test@example.com",
                "password": "StrongTest@123",
            },
        )

    assert response.status_code == 201
    assert response.json()["full_name"] == "API Test User"
    assert response.json()["email"] == "api-test@example.com"


def test_login_success():
    fake_user = Mock()
    fake_user.id = 999999

    with patch(
        "app.api.routes.auth.authenticate_user",
        return_value=fake_user,
    ):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "api-test@example.com",
                "password": "StrongTest@123",
            },
        )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_login_invalid_credentials():
    with patch(
        "app.api.routes.auth.authenticate_user",
        return_value=None,
    ):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "api-test@example.com",
                "password": "WrongPassword@123",
            },
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_current_user_profile():
    fake_user = Mock()
    fake_user.id = 999999
    fake_user.full_name = "API Test User"
    fake_user.email = "api-test@example.com"
    fake_user.is_active = True
    fake_user.created_at = datetime(2026, 10, 22, 10, 0, 0)

    app.dependency_overrides[get_current_user] = lambda: fake_user

    try:
        response = client.get("/api/v1/auth/me")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 200
    assert response.json()["full_name"] == "API Test User"
    assert response.json()["email"] == "api-test@example.com"
    assert response.json()["is_active"] is True
    assert "created_at" in response.json()


# Budget creation validation tests

def test_budget_create_accepts_valid_data():
    budget = BudgetCreate.model_validate(
        {
            "amount": "5000.00",
            "month": "2026-10-01",
        }
    )

    assert budget.amount == Decimal("5000.00")
    assert budget.month.isoformat() == "2026-10-01"


def test_budget_create_rejects_non_positive_amount():
    with pytest.raises(ValidationError):
        BudgetCreate.model_validate(
            {
                "amount": "0",
                "month": "2026-10-01",
            }
        )


def test_budget_create_rejects_month_not_first_day():
    with pytest.raises(ValidationError):
        BudgetCreate.model_validate(
            {
                "amount": "5000.00",
                "month": "2026-10-15",
            }
        )


def test_budget_create_rejects_invalid_month():
    with pytest.raises(ValidationError):
        BudgetCreate.model_validate(
            {
                "amount": "5000.00",
                "month": "invalid-date",
            }
        )


# Budget update validation tests

def test_budget_update_rejects_null_amount():
    with pytest.raises(ValidationError):
        BudgetUpdate.model_validate({"amount": None})


def test_budget_update_rejects_empty_data():
    with pytest.raises(ValidationError):
        BudgetUpdate.model_validate({})


def test_budget_update_accepts_valid_amount():
    budget = BudgetUpdate.model_validate(
        {"amount": "5000.00"}
    )

    assert budget.amount == Decimal("5000.00")


def test_budget_update_rejects_non_positive_amount():
    with pytest.raises(ValidationError):
        BudgetUpdate.model_validate({"amount": "0"})


# Expense create validation tests

def valid_expense_data():
    return {
        "amount": "250.50",
        "title": "Lunch",
        "description": "Lunch expense",
        "expense_date": "2026-10-22",
        "category_id": 1,
    }


def test_expense_create_accepts_valid_data():
    expense = ExpenseCreate.model_validate(valid_expense_data())

    assert expense.amount == Decimal("250.50")
    assert expense.title == "Lunch"
    assert expense.category_id == 1


def test_expense_create_rejects_non_positive_amount():
    data = valid_expense_data()
    data["amount"] = "0"

    with pytest.raises(ValidationError):
        ExpenseCreate.model_validate(data)


def test_expense_create_rejects_blank_title():
    data = valid_expense_data()
    data["title"] = "   "

    with pytest.raises(ValidationError):
        ExpenseCreate.model_validate(data)


def test_expense_create_trims_title():
    data = valid_expense_data()
    data["title"] = "  Lunch  "

    expense = ExpenseCreate.model_validate(data)

    assert expense.title == "Lunch"


# Expense update validation tests

def test_expense_update_rejects_null_amount():
    with pytest.raises(ValidationError):
        ExpenseUpdate.model_validate({"amount": None})


def test_expense_update_rejects_null_title():
    with pytest.raises(ValidationError):
        ExpenseUpdate.model_validate({"title": None})


def test_expense_update_rejects_null_expense_date():
    with pytest.raises(ValidationError):
        ExpenseUpdate.model_validate({"expense_date": None})


def test_expense_update_rejects_null_category_id():
    with pytest.raises(ValidationError):
        ExpenseUpdate.model_validate({"category_id": None})


def test_expense_update_rejects_blank_title():
    with pytest.raises(ValidationError):
        ExpenseUpdate.model_validate({"title": "   "})


def test_expense_update_accepts_valid_partial_update():
    expense = ExpenseUpdate.model_validate(
        {"amount": "450.75"}
    )

    assert expense.amount == Decimal("450.75")
    assert expense.model_dump(exclude_unset=True) == {
        "amount": Decimal("450.75")
    }


def test_expense_update_allows_clearing_description():
    expense = ExpenseUpdate.model_validate(
        {"description": None}
    )

    assert expense.description is None
    assert expense.model_dump(exclude_unset=True) == {
        "description": None
    }


# Category validation tests

def test_category_create_accepts_valid_data():
    category = CategoryCreate.model_validate(
        {
            "name": "Food",
            "description": "Food and dining expenses",
        }
    )

    assert category.name == "Food"
    assert category.description == "Food and dining expenses"


def test_category_create_rejects_blank_name():
    with pytest.raises(ValidationError):
        CategoryCreate.model_validate({"name": "   "})


def test_category_create_trims_name():
    category = CategoryCreate.model_validate(
        {"name": "  Transport  "}
    )

    assert category.name == "Transport"


# Analytics API tests

def test_analytics_dashboard_passes_user_and_year():
    fake_user = Mock()
    fake_user.id = 999999

    fake_analytics = {
        "total_expenses": Decimal("1250.50"),
        "expense_count": 3,
        "monthly_summary": [],
        "category_summary": [],
    }

    app.dependency_overrides[get_current_user] = lambda: fake_user

    try:
        with patch(
            "app.api.routes.analytics.get_dashboard_analytics",
            return_value=fake_analytics,
        ) as mock_analytics:
            response = client.get(
                "/api/v1/analytics/dashboard?year=2026"
            )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 200
    assert response.json()["total_expenses"] == "1250.50"
    assert response.json()["expense_count"] == 3

    mock_analytics.assert_called_once_with(
        db=mock_analytics.call_args.kwargs["db"],
        user_id=999999,
        year=2026,
    )


def test_analytics_dashboard_rejects_invalid_year():
    fake_user = Mock()
    fake_user.id = 999999

    app.dependency_overrides[get_current_user] = lambda: fake_user

    try:
        response = client.get(
            "/api/v1/analytics/dashboard?year=1999"
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 422
