
from datetime import datetime
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.core.dependencies import get_current_user

client = TestClient(app)


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
