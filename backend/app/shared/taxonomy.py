"""Reusable base classes for user-scoped, named taxonomy entities.

Categories, sources, and tags all share the same shape: a user-owned,
uniquely-named record. These bases provide CRUD with ownership and
uniqueness enforcement so each module stays tiny.
"""
from __future__ import annotations

from typing import Any, Dict, List

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import ConflictError, NotFoundError
from app.shared.base_repository import BaseRepository, to_object_id


class TaxonomyRepository(BaseRepository):
    """CRUD bound to a single user-scoped, named collection."""

    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str) -> None:
        super().__init__(db, collection_name)

    async def list_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        return await self.list(
            {"user_id": user_id}, skip=0, limit=500, sort=[("name", 1)]
        )

    async def get_owned(self, doc_id: str, user_id: str):
        return await self.get_one({"_id": to_object_id(doc_id), "user_id": user_id})

    async def delete_owned(self, doc_id: str, user_id: str) -> bool:
        result = await self.collection.delete_one(
            {"_id": to_object_id(doc_id), "user_id": user_id}
        )
        return result.deleted_count > 0


class TaxonomyService:
    """Generic create/list/update/delete for a taxonomy entity."""

    entity_name: str = "Item"

    def __init__(self, repository: TaxonomyRepository) -> None:
        self.repository = repository

    async def create(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data = {**data, "user_id": user_id}
        try:
            return await self.repository.create(data)
        except DuplicateKeyError as exc:
            raise ConflictError(f"{self.entity_name} with this name already exists.") from exc

    async def list(self, user_id: str) -> List[Dict[str, Any]]:
        return await self.repository.list_for_user(user_id)

    async def get(self, user_id: str, doc_id: str) -> Dict[str, Any]:
        item = await self.repository.get_owned(doc_id, user_id)
        if not item:
            raise NotFoundError(f"{self.entity_name} not found.")
        return item

    async def update(
        self, user_id: str, doc_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        await self.get(user_id, doc_id)
        try:
            return await self.repository.update(doc_id, data)
        except DuplicateKeyError as exc:
            raise ConflictError(f"{self.entity_name} with this name already exists.") from exc

    async def delete(self, user_id: str, doc_id: str) -> None:
        deleted = await self.repository.delete_owned(doc_id, user_id)
        if not deleted:
            raise NotFoundError(f"{self.entity_name} not found.")
