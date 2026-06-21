"""Generic async MongoDB repository providing reusable CRUD operations.

Feature repositories inherit from :class:`BaseRepository` and only add
domain-specific queries, keeping data-access code DRY and consistent.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase

from app.core.exceptions import NotFoundError


def to_object_id(value: str) -> ObjectId:
    """Safely convert a string into an ObjectId."""
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise NotFoundError("Invalid identifier.") from exc


def serialize(document: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert Mongo ``_id`` into a string ``id`` field for API responses."""
    if not document:
        return None
    document = dict(document)
    if "_id" in document:
        document["id"] = str(document.pop("_id"))
    return document


class BaseRepository:
    """Reusable CRUD operations bound to a single collection."""

    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str) -> None:
        self.db = db
        self.collection_name = collection_name

    @property
    def collection(self) -> AsyncIOMotorCollection:
        return self.db[self.collection_name]

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        data.setdefault("created_at", now)
        data.setdefault("updated_at", now)
        result = await self.collection.insert_one(data)
        created = await self.collection.find_one({"_id": result.inserted_id})
        return serialize(created)  # type: ignore[return-value]

    async def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        document = await self.collection.find_one({"_id": to_object_id(doc_id)})
        return serialize(document)

    async def get_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        document = await self.collection.find_one(query)
        return serialize(document)

    async def list(
        self,
        query: Optional[Dict[str, Any]] = None,
        *,
        skip: int = 0,
        limit: int = 100,
        sort: Optional[List[tuple]] = None,
    ) -> List[Dict[str, Any]]:
        cursor = self.collection.find(query or {})
        if sort:
            cursor = cursor.sort(sort)
        cursor = cursor.skip(skip).limit(limit)
        return [serialize(doc) for doc in await cursor.to_list(length=limit)]  # type: ignore

    async def count(self, query: Optional[Dict[str, Any]] = None) -> int:
        return await self.collection.count_documents(query or {})

    async def update(self, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": to_object_id(doc_id)}, {"$set": data}
        )
        return await self.get_by_id(doc_id)

    async def delete(self, doc_id: str) -> bool:
        result = await self.collection.delete_one({"_id": to_object_id(doc_id)})
        return result.deleted_count > 0

    async def aggregate(self, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        cursor = self.collection.aggregate(pipeline)
        return await cursor.to_list(length=None)
