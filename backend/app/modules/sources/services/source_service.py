"""Source repository and service."""
from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.taxonomy import TaxonomyRepository, TaxonomyService


class SourceRepository(TaxonomyRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.SOURCES)


class SourceService(TaxonomyService):
    entity_name = "Source"
