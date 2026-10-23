
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ExpenseSummary(BaseModel):
    total_expenses: Decimal
    expense_count: int


class MonthlyExpenseSummary(BaseModel):
    year: int
    month: int
    total_expenses: Decimal
    expense_count: int


class CategoryExpenseSummary(BaseModel):
    category_id: int
    category_name: str
    total_expenses: Decimal
    expense_count: int


class DashboardAnalyticsResponse(BaseModel):
    total_expenses: Decimal
    expense_count: int
    monthly_summary: list[MonthlyExpenseSummary]
    category_summary: list[CategoryExpenseSummary]

    model_config = ConfigDict(from_attributes=True)
