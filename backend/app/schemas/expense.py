
from datetime import date, datetime
from decimal import Decimal
from typing import Self

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class ExpenseCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    title: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=2000)
    expense_date: date
    category_id: int = Field(gt=0)

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError("Title must contain at least 2 characters.")

        return value


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

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return value

        value = value.strip()

        if len(value) < 2:
            raise ValueError("Title must contain at least 2 characters.")

        return value

    @model_validator(mode="after")
    def reject_null_for_required_update_fields(self) -> Self:
        for field_name in (
            "amount",
            "title",
            "expense_date",
            "category_id",
        ):
            if (
                field_name in self.model_fields_set
                and getattr(self, field_name) is None
            ):
                raise ValueError(
                    f"{field_name} cannot be null."
                )

        return self


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
