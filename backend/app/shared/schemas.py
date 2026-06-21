"""Reusable Pydantic schema primitives shared across modules."""
from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any, Generic, List, Optional, TypeVar

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import BeforeValidator

T = TypeVar("T")


def _validate_object_id(value: Any) -> str:
    """Coerce ObjectId/str into a string id."""
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, str):
        return value
    raise ValueError("Invalid object id")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


class BaseSchema(BaseModel):
    """Base for all API schemas."""

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str, datetime: lambda v: v.isoformat()},
    )


class TimestampMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class APIResponse(BaseSchema, Generic[T]):
    """Uniform success envelope returned to the frontend."""

    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None


class PaginationMeta(BaseSchema):
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginatedResponse(BaseSchema, Generic[T]):
    success: bool = True
    data: List[T] = Field(default_factory=list)
    meta: PaginationMeta
