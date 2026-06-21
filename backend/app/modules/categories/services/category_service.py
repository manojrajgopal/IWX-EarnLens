"""Category repository and service (thin wrappers over taxonomy bases)."""
from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.taxonomy import TaxonomyRepository, TaxonomyService


class CategoryRepository(TaxonomyRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.CATEGORIES)


class CategoryService(TaxonomyService):
    entity_name = "Category"
