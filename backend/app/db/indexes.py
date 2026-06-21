"""Index definitions, created idempotently on startup."""
from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, TEXT

from app.core.constants import Collections
from app.core.logging_config import get_logger

logger = get_logger("earnlens.db.indexes")


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all required indexes. Safe to call repeatedly."""
    await db[Collections.USERS].create_index([("email", ASCENDING)], unique=True)
    await db[Collections.USERS].create_index([("username", ASCENDING)], unique=True, sparse=True)

    incomes = db[Collections.INCOMES]
    await incomes.create_index([("user_id", ASCENDING), ("payment_date", DESCENDING)])
    await incomes.create_index([("user_id", ASCENDING), ("income_type", ASCENDING)])
    await incomes.create_index([("user_id", ASCENDING), ("category_id", ASCENDING)])
    await incomes.create_index([("user_id", ASCENDING), ("source_id", ASCENDING)])
    await incomes.create_index([("user_id", ASCENDING), ("recurrence", ASCENDING)])
    await incomes.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await incomes.create_index([("title", TEXT), ("notes", TEXT), ("source_name", TEXT)])

    for name in (Collections.CATEGORIES, Collections.SOURCES, Collections.TAGS):
        await db[name].create_index([("user_id", ASCENDING), ("name", ASCENDING)], unique=True)

    tokens = db[Collections.REFRESH_TOKENS]
    await tokens.create_index([("user_id", ASCENDING)])
    await tokens.create_index([("token", ASCENDING)], unique=True)
    await tokens.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)

    await db[Collections.AUDIT_LOGS].create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )
    await db[Collections.PREFERENCES].create_index([("user_id", ASCENDING)], unique=True)

    logger.info("MongoDB indexes ensured")
