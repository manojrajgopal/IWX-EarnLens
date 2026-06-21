"""Business logic for user profile management."""
from __future__ import annotations

from typing import Any, Dict

from app.core.exceptions import BadRequestError, NotFoundError
from app.core.security import hash_password, verify_password
from app.modules.users.repositories.user_repository import UserRepository
from app.modules.users.schemas.user_schemas import (
    PasswordChange,
    UserUpdate,
)


class UserService:
    """Coordinates user-related use cases."""

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def get_profile(self, user_id: str) -> Dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
        return user

    async def update_profile(self, user_id: str, payload: UserUpdate) -> Dict[str, Any]:
        updates = payload.model_dump(exclude_none=True)
        if not updates:
            return await self.get_profile(user_id)
        if "default_currency" in updates:
            updates["default_currency"] = updates["default_currency"].upper()
        updated = await self.repository.update(user_id, updates)
        if not updated:
            raise NotFoundError("User not found.")
        return updated

    async def change_password(self, user_id: str, payload: PasswordChange) -> None:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
        if not verify_password(payload.current_password, user["hashed_password"]):
            raise BadRequestError("Current password is incorrect.")
        await self.repository.update(
            user_id, {"hashed_password": hash_password(payload.new_password)}
        )
