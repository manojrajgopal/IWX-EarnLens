"""HTTP routes for income categories."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user_id, get_db
from app.modules.categories.schemas.category_schemas import (
    CategoryCreate,
    CategoryPublic,
    CategoryUpdate,
)
from app.modules.categories.services.category_service import (
    CategoryRepository,
    CategoryService,
)
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


def get_category_service(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> CategoryService:
    return CategoryService(CategoryRepository(db))


@router.post(
    "", response_model=APIResponse[CategoryPublic], status_code=status.HTTP_201_CREATED
)
async def create_category(
    payload: CategoryCreate,
    user_id: str = Depends(get_current_user_id),
    service: CategoryService = Depends(get_category_service),
) -> APIResponse[CategoryPublic]:
    item = await service.create(user_id, payload.model_dump())
    return APIResponse(data=CategoryPublic.model_validate(item), message="Category created.")


@router.get("", response_model=APIResponse[List[CategoryPublic]])
async def list_categories(
    user_id: str = Depends(get_current_user_id),
    service: CategoryService = Depends(get_category_service),
) -> APIResponse[List[CategoryPublic]]:
    items = await service.list(user_id)
    return APIResponse(data=[CategoryPublic.model_validate(i) for i in items])


@router.patch("/{category_id}", response_model=APIResponse[CategoryPublic])
async def update_category(
    category_id: str,
    payload: CategoryUpdate,
    user_id: str = Depends(get_current_user_id),
    service: CategoryService = Depends(get_category_service),
) -> APIResponse[CategoryPublic]:
    item = await service.update(user_id, category_id, payload.model_dump(exclude_none=True))
    return APIResponse(data=CategoryPublic.model_validate(item), message="Category updated.")


@router.delete("/{category_id}", response_model=APIResponse[dict])
async def delete_category(
    category_id: str,
    user_id: str = Depends(get_current_user_id),
    service: CategoryService = Depends(get_category_service),
) -> APIResponse[dict]:
    await service.delete(user_id, category_id)
    return APIResponse(data={"deleted": True}, message="Category deleted.")
