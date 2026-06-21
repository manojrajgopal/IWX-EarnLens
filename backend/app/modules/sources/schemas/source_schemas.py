"""Source API schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import Field

from app.shared.schemas import BaseSchema


class SourceBase(BaseSchema):
    name: str = Field(min_length=1, max_length=120)
    source_type: Optional[str] = Field(default="other", max_length=40)
    website: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=280)
    color: str = Field(default="#22c55e", max_length=9)
    icon: Optional[str] = Field(default=None, max_length=40)


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseSchema):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    source_type: Optional[str] = Field(default=None, max_length=40)
    website: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=280)
    color: Optional[str] = Field(default=None, max_length=9)
    icon: Optional[str] = Field(default=None, max_length=40)


class SourcePublic(SourceBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
