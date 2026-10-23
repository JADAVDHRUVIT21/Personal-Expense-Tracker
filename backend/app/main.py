
from fastapi import FastAPI

from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.categories import router as categories_router
from app.api.routes.expenses import router as expenses_router
from app.api.routes.budgets import router as budgets_router
from app.api.routes.analytics import router as analytics_router


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Personal Expense Tracker API is running"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy"
    }


# Authentication endpoints
app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX,
)

# Expense category endpoints
app.include_router(
    categories_router,
    prefix=settings.API_V1_PREFIX,
)

# Expense management endpoints
app.include_router(
    expenses_router,
    prefix=settings.API_V1_PREFIX,
)

# Monthly budget endpoints
app.include_router(
    budgets_router,
    prefix=settings.API_V1_PREFIX,
)

# Dashboard analytics endpoints
app.include_router(
    analytics_router,
    prefix=settings.API_V1_PREFIX,
)
