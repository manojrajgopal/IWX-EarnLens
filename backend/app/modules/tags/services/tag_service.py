"""Tag repository and service."""
from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.taxonomy import TaxonomyRepository, TaxonomyService


class TagRepository(TaxonomyRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.TAGS)


class TagService(TaxonomyService):
    entity_name = "Tag"
