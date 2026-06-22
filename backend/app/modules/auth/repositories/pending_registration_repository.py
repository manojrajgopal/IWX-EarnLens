"""Persistence for pending registrations awaiting OTP email verification.

A pending registration is a short-lived staging document that holds a
prospective user's details (and a hashed OTP) until they confirm the code
emailed to them. Only once the OTP matches is a real ``users`` record created.
Documents auto-expire via a TTL index on ``expires_at``.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.core.constants import Collections
from app.shared.base_repository import BaseRepository, to_object_id


class PendingRegistrationRepository(BaseRepository):
    """CRUD for the ``pending_registrations`` staging collection."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.PENDING_REGISTRATIONS)

    async def create_pending(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.create(data)

    async def delete_by_email(self, email: str) -> None:
        """Remove any existing pending registration(s) for an email."""
        await self.collection.delete_many({"email": email.lower()})

    async def get_pending(self, registration_id: str) -> Optional[Dict[str, Any]]:
        return await self.get_by_id(registration_id)

    async def set_otp(
        self,
        registration_id: str,
        otp_hash: str,
        expires_at: datetime,
        resend_count: int,
    ) -> Optional[Dict[str, Any]]:
        """Rotate the OTP: store a fresh hash, reset attempts, extend expiry."""
        return await self.update(
            registration_id,
            {
                "otp_hash": otp_hash,
                "expires_at": expires_at,
                "attempts": 0,
                "resend_count": resend_count,
            },
        )

    async def increment_attempts(self, registration_id: str) -> int:
        """Atomically bump the failed-attempt counter and return the new value."""
        doc = await self.collection.find_one_and_update(
            {"_id": to_object_id(registration_id)},
            {"$inc": {"attempts": 1}},
            return_document=ReturnDocument.AFTER,
        )
        return int(doc.get("attempts", 0)) if doc else 0

    async def delete_pending(self, registration_id: str) -> bool:
        return await self.delete(registration_id)
