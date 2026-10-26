
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "Category name must contain at least 2 characters."
            )

        return value


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_default: bool

    model_config = ConfigDict(from_attributes=True)
