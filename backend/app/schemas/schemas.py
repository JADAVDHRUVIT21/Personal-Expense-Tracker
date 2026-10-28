# schemas.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class IncomeBase(BaseModel):
    title: str
    amount: float
    income_date: date
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(IncomeBase):
    pass

class IncomeResponse(IncomeBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True # Use orm_mode = True if on Pydantic v1
        
class GoalBase(BaseModel):
    title: str
    target_amount: float
    saved_amount: float = 0.0
    target_date: Optional[date] = None
    color: Optional[str] = "#4f46e5"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True