"""HTTP routes for user preferences."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user_id, get_db
from app.modules.preferences.schemas.preferences_schemas import (
    PreferencesPublic,
    PreferencesUpdate,
)
from app.modules.preferences.services.preferences_service import (
    PreferencesRepository,
    PreferencesService,
)
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/preferences", tags=["Preferences"])


def get_preferences_service(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> PreferencesService:
    return PreferencesService(PreferencesRepository(db))


@router.get("", response_model=APIResponse[PreferencesPublic])
async def get_preferences(
    user_id: str = Depends(get_current_user_id),
    service: PreferencesService = Depends(get_preferences_service),
) -> APIResponse[PreferencesPublic]:
    data = await service.get(user_id)
    return APIResponse(data=PreferencesPublic.model_validate(data))


@router.patch("", response_model=APIResponse[PreferencesPublic])
async def update_preferences(
    payload: PreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    service: PreferencesService = Depends(get_preferences_service),
) -> APIResponse[PreferencesPublic]:
    data = await service.update(user_id, payload.model_dump(exclude_none=True))
    return APIResponse(data=PreferencesPublic.model_validate(data), message="Preferences saved.")
