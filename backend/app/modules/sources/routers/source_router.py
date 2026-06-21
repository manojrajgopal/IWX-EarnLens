"""HTTP routes for income sources."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user_id, get_db
from app.modules.sources.schemas.source_schemas import (
    SourceCreate,
    SourcePublic,
    SourceUpdate,
)
from app.modules.sources.services.source_service import (
    SourceRepository,
    SourceService,
)
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/sources", tags=["Sources"])


def get_source_service(db: AsyncIOMotorDatabase = Depends(get_db)) -> SourceService:
    return SourceService(SourceRepository(db))


@router.post(
    "", response_model=APIResponse[SourcePublic], status_code=status.HTTP_201_CREATED
)
async def create_source(
    payload: SourceCreate,
    user_id: str = Depends(get_current_user_id),
    service: SourceService = Depends(get_source_service),
) -> APIResponse[SourcePublic]:
    item = await service.create(user_id, payload.model_dump())
    return APIResponse(data=SourcePublic.model_validate(item), message="Source created.")


@router.get("", response_model=APIResponse[List[SourcePublic]])
async def list_sources(
    user_id: str = Depends(get_current_user_id),
    service: SourceService = Depends(get_source_service),
) -> APIResponse[List[SourcePublic]]:
    items = await service.list(user_id)
    return APIResponse(data=[SourcePublic.model_validate(i) for i in items])


@router.patch("/{source_id}", response_model=APIResponse[SourcePublic])
async def update_source(
    source_id: str,
    payload: SourceUpdate,
    user_id: str = Depends(get_current_user_id),
    service: SourceService = Depends(get_source_service),
) -> APIResponse[SourcePublic]:
    item = await service.update(user_id, source_id, payload.model_dump(exclude_none=True))
    return APIResponse(data=SourcePublic.model_validate(item), message="Source updated.")


@router.delete("/{source_id}", response_model=APIResponse[dict])
async def delete_source(
    source_id: str,
    user_id: str = Depends(get_current_user_id),
    service: SourceService = Depends(get_source_service),
) -> APIResponse[dict]:
    await service.delete(user_id, source_id)
    return APIResponse(data={"deleted": True}, message="Source deleted.")
