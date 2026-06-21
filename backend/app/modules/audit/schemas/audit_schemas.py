"""Audit log API schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from app.shared.schemas import BaseSchema


class AuditLogPublic(BaseSchema):
    id: str
    user_id: str
    action: str
    entity: str
    entity_id: Optional[str] = None
    summary: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None
