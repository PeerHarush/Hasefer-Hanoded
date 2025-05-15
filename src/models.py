from uuid import UUID

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


class LoginModel(BaseModel):
    email: EmailStr
    password: str


class PasswordUpdateModel(BaseModel):
    new_password: str = Field(min_length=8)


class RefreshModel(BaseModel):
    refresh_token: str

