"""Preferences API schemas."""
from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import Field

from app.shared.schemas import BaseSchema


class PreferencesUpdate(BaseSchema):
    theme: Optional[str] = Field(default=None, pattern="^(light|dark|system)$")
    default_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    default_group_by: Optional[str] = Field(default=None)
    default_chart_style: Optional[str] = Field(default=None)
    week_starts_on: Optional[str] = Field(default=None)
    number_format: Optional[str] = Field(default=None)
    dashboard_widgets: Optional[Dict[str, bool]] = None
    notifications: Optional[Dict[str, bool]] = None
    metadata: Optional[Dict[str, Any]] = None


class PreferencesPublic(BaseSchema):
    user_id: str
    theme: str = "system"
    default_currency: str = "USD"
    default_group_by: str = "month"
    default_chart_style: str = "area"
    week_starts_on: str = "monday"
    number_format: str = "en-US"
    dashboard_widgets: Dict[str, bool] = Field(default_factory=dict)
    notifications: Dict[str, bool] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
