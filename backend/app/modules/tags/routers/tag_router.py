"""HTTP routes for income tags."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user_id, get_db
from app.modules.tags.schemas.tag_schemas import TagCreate, TagPublic, TagUpdate
from app.modules.tags.services.tag_service import TagRepository, TagService
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/tags", tags=["Tags"])


def get_tag_service(db: AsyncIOMotorDatabase = Depends(get_db)) -> TagService:
    return TagService(TagRepository(db))


@router.post("", response_model=APIResponse[TagPublic], status_code=status.HTTP_201_CREATED)
async def create_tag(
    payload: TagCreate,
    user_id: str = Depends(get_current_user_id),
    service: TagService = Depends(get_tag_service),
) -> APIResponse[TagPublic]:
    item = await service.create(user_id, payload.model_dump())
    return APIResponse(data=TagPublic.model_validate(item), message="Tag created.")


@router.get("", response_model=APIResponse[List[TagPublic]])
async def list_tags(
    user_id: str = Depends(get_current_user_id),
    service: TagService = Depends(get_tag_service),
) -> APIResponse[List[TagPublic]]:
    items = await service.list(user_id)
    return APIResponse(data=[TagPublic.model_validate(i) for i in items])


@router.patch("/{tag_id}", response_model=APIResponse[TagPublic])
async def update_tag(
    tag_id: str,
    payload: TagUpdate,
    user_id: str = Depends(get_current_user_id),
    service: TagService = Depends(get_tag_service),
) -> APIResponse[TagPublic]:
    item = await service.update(user_id, tag_id, payload.model_dump(exclude_none=True))
    return APIResponse(data=TagPublic.model_validate(item), message="Tag updated.")


@router.delete("/{tag_id}", response_model=APIResponse[dict])
async def delete_tag(
    tag_id: str,
    user_id: str = Depends(get_current_user_id),
    service: TagService = Depends(get_tag_service),
) -> APIResponse[dict]:
    await service.delete(user_id, tag_id)
    return APIResponse(data={"deleted": True}, message="Tag deleted.")
