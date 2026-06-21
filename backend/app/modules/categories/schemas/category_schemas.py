"""Category API schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import Field

from app.shared.schemas import BaseSchema


class CategoryBase(BaseSchema):
    name: str = Field(min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=280)
    color: str = Field(default="#6366f1", max_length=9)
    icon: Optional[str] = Field(default=None, max_length=40)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseSchema):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=280)
    color: Optional[str] = Field(default=None, max_length=9)
    icon: Optional[str] = Field(default=None, max_length=40)


class CategoryPublic(CategoryBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
