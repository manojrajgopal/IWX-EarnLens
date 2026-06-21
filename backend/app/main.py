"""Uvicorn entrypoint.

Run with: ``uvicorn app.main:app --reload``
"""
from __future__ import annotations

import uvicorn

from app.application import app
from app.core.config import settings

__all__ = ["app"]


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
