"""Tag API schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import Field

from app.shared.schemas import BaseSchema


class TagBase(BaseSchema):
    name: str = Field(min_length=1, max_length=60)
    color: str = Field(default="#f59e0b", max_length=9)


class TagCreate(TagBase):
    pass


class TagUpdate(BaseSchema):
    name: Optional[str] = Field(default=None, min_length=1, max_length=60)
    color: Optional[str] = Field(default=None, max_length=9)


class TagPublic(TagBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
