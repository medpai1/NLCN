from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class MealPlanCreate(BaseModel):
    date: str
    meals: Dict[str, Any]


class MealPlanUpdate(BaseModel):
    meals: Dict[str, Any]


class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    date: str
    meals: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

