"""MongoDB connection lifecycle management.

A single Motor client is created at startup and shared across the app.
Repositories receive the database handle through dependency injection,
never importing the client directly.
"""
from __future__ import annotations

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger("earnlens.db")


class MongoManager:
    """Holds the singleton Motor client and database handle."""

    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


mongo = MongoManager()


async def connect_to_mongo() -> None:
    """Open the MongoDB connection at application startup."""
    logger.info("Connecting to MongoDB at %s", settings.MONGODB_URI)
    mongo.client = AsyncIOMotorClient(settings.MONGODB_URI, uuidRepresentation="standard")
    mongo.database = mongo.client[settings.MONGODB_DB_NAME]
    # Fail fast if the server is unreachable.
    await mongo.client.admin.command("ping")
    logger.info("MongoDB connection established (db=%s)", settings.MONGODB_DB_NAME)


async def close_mongo_connection() -> None:
    """Close the MongoDB connection at application shutdown."""
    if mongo.client:
        mongo.client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle (used by DI)."""
    if mongo.database is None:
        raise RuntimeError("Database not initialized. Did startup run?")
    return mongo.database
