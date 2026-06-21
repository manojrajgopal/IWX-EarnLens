"""HTTP routes for user profile management."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user_id, get_user_service
from app.modules.users.controllers.user_controller import UserController
from app.modules.users.schemas.user_schemas import (
    PasswordChange,
    UserPublic,
    UserUpdate,
)
from app.modules.users.services.user_service import UserService
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/users", tags=["Users"])


def _controller(service: UserService = Depends(get_user_service)) -> UserController:
    return UserController(service)


@router.get("/me", response_model=APIResponse[UserPublic])
async def get_me(
    user_id: str = Depends(get_current_user_id),
    controller: UserController = Depends(_controller),
) -> APIResponse[UserPublic]:
    data = await controller.get_me(user_id)
    return APIResponse(data=data)


@router.patch("/me", response_model=APIResponse[UserPublic])
async def update_me(
    payload: UserUpdate,
    user_id: str = Depends(get_current_user_id),
    controller: UserController = Depends(_controller),
) -> APIResponse[UserPublic]:
    data = await controller.update_me(user_id, payload)
    return APIResponse(data=data, message="Profile updated.")


@router.post("/me/change-password", response_model=APIResponse[dict])
async def change_password(
    payload: PasswordChange,
    user_id: str = Depends(get_current_user_id),
    controller: UserController = Depends(_controller),
) -> APIResponse[dict]:
    data = await controller.change_password(user_id, payload)
    return APIResponse(data=data, message="Password changed.")
