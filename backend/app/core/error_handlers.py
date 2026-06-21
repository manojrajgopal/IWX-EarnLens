"""Global exception handlers that translate errors into JSON envelopes."""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException
from app.core.logging_config import get_logger

logger = get_logger("earnlens.error")


def _envelope(status_code: int, error_code: str, message: str, details=None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {"code": error_code, "message": message, "details": details},
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all exception handlers to the application."""

    @app.exception_handler(AppException)
    async def _app_exception(_: Request, exc: AppException) -> JSONResponse:
        return _envelope(exc.status_code, exc.error_code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def _validation_exception(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return _envelope(422, "validation_error", "Request validation failed.", exc.errors())

    @app.exception_handler(StarletteHTTPException)
    async def _http_exception(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return _envelope(exc.status_code, "http_error", str(exc.detail))

    @app.exception_handler(Exception)
    async def _unhandled_exception(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_exception: %s", exc)
        return _envelope(500, "internal_error", "An unexpected error occurred.")
