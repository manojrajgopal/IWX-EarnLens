"""Thin controller translating HTTP requests into service calls."""
from __future__ import annotations

from typing import Any, Dict

from app.modules.users.schemas.user_schemas import (
    PasswordChange,
    UserPublic,
    UserUpdate,
)
from app.modules.users.services.user_service import UserService


class UserController:
    """Adapts service results into API schemas."""

    def __init__(self, service: UserService) -> None:
        self.service = service

    async def get_me(self, user_id: str) -> UserPublic:
        user = await self.service.get_profile(user_id)
        return UserPublic.model_validate(user)

    async def update_me(self, user_id: str, payload: UserUpdate) -> UserPublic:
        user = await self.service.update_profile(user_id, payload)
        return UserPublic.model_validate(user)

    async def change_password(self, user_id: str, payload: PasswordChange) -> Dict[str, Any]:
        await self.service.change_password(user_id, payload)
        return {"changed": True}
