"""Application factory: assembles middleware, routes, and lifecycle hooks."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.error_handlers import register_exception_handlers
from app.core.logging_config import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware
from app.db.indexes import ensure_indexes
from app.db.mongodb import (
    close_mongo_connection,
    connect_to_mongo,
    get_database,
)

logger = get_logger("earnlens.app")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage startup/shutdown: DB connection and index creation."""
    configure_logging()
    await connect_to_mongo()
    await ensure_indexes(get_database())
    logger.info("%s started (env=%s)", settings.APP_NAME, settings.APP_ENV)
    yield
    await close_mongo_connection()
    logger.info("%s shut down", settings.APP_NAME)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Personal income analytics platform API.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time-Ms"],
    )
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)

    @app.get("/", tags=["Health"])
    async def root() -> dict:
        return {"name": settings.APP_NAME, "version": settings.VERSION, "status": "ok"}

    @app.get("/health", tags=["Health"])
    async def health() -> dict:
        return {"status": "healthy"}

    app.include_router(api_router, prefix=settings.API_PREFIX)
    return app


app = create_app()
