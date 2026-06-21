"""Audit repository and service."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.core.logging_config import get_logger
from app.shared.base_repository import BaseRepository

logger = get_logger("earnlens.audit")


class AuditRepository(BaseRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.AUDIT_LOGS)

    async def list_for_user(
        self, user_id: str, *, skip: int, limit: int
    ) -> List[Dict[str, Any]]:
        return await self.list(
            {"user_id": user_id}, skip=skip, limit=limit, sort=[("created_at", -1)]
        )


class AuditService:
    """Records user actions. Failures never break the primary use case."""

    def __init__(self, repository: AuditRepository) -> None:
        self.repository = repository

    async def record(
        self,
        user_id: str,
        action: str,
        entity: str,
        *,
        entity_id: Optional[str] = None,
        summary: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        try:
            await self.repository.create(
                {
                    "user_id": user_id,
                    "action": action,
                    "entity": entity,
                    "entity_id": entity_id,
                    "summary": summary,
                    "metadata": metadata or {},
                }
            )
        except Exception as exc:  # pragma: no cover - audit must never block
            logger.warning("Failed to record audit log: %s", exc)

    async def list(self, user_id: str, *, skip: int, limit: int) -> List[Dict[str, Any]]:
        return await self.repository.list_for_user(user_id, skip=skip, limit=limit)

    async def count(self, user_id: str) -> int:
        return await self.repository.count({"user_id": user_id})
