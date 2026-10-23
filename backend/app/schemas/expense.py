
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    title: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=2000)
    expense_date: date
    category_id: int = Field(gt=0)


class ExpenseUpdate(BaseModel):
    amount: Decimal | None = Field(
        default=None, gt=0, max_digits=12, decimal_places=2
    )
    title: str | None = Field(
        default=None, min_length=2, max_length=150
    )
    description: str | None = Field(default=None, max_length=2000)
    expense_date: date | None = None
    category_id: int | None = Field(default=None, gt=0)


class ExpenseResponse(BaseModel):
    id: int
    amount: Decimal
    title: str
    description: str | None
    expense_date: date
    user_id: int
    category_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
