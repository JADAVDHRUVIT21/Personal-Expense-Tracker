
from datetime import date, datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class BudgetCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    month: date
    category_id: int = Field(gt=0)

    @field_validator("month")
    @classmethod
    def validate_month(cls, value: date) -> date:
        if value.day != 1:
            raise ValueError(
                "Month must be the first day of the month, e.g. 2026-10-01."
            )
        return value


class BudgetUpdate(BaseModel):
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    @model_validator(mode="before")
    @classmethod
    def validate_update_data(cls, data):
        if not isinstance(data, dict):
            return data

        if not data:
            raise ValueError(
                "Provide at least one field to update."
            )

        if "amount" in data and data["amount"] is None:
            raise ValueError(
                "Budget amount cannot be null."
            )

        return data


class BudgetResponse(BaseModel):
    id: int
    amount: Decimal
    month: date
    category_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
