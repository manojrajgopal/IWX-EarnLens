"""Custom exception hierarchy for predictable, structured error handling.

Every domain error inherits from :class:`AppException` so the global
exception handler can translate it into a consistent JSON response.
"""
from __future__ import annotations

from typing import Any, Optional


class AppException(Exception):
    """Base application exception."""

    status_code: int = 500
    error_code: str = "internal_error"
    message: str = "An unexpected error occurred."

    def __init__(
        self,
        message: Optional[str] = None,
        *,
        error_code: Optional[str] = None,
        status_code: Optional[int] = None,
        details: Optional[Any] = None,
    ) -> None:
        self.message = message or self.message
        self.error_code = error_code or self.error_code
        self.status_code = status_code or self.status_code
        self.details = details
        super().__init__(self.message)


class NotFoundError(AppException):
    status_code = 404
    error_code = "not_found"
    message = "Resource not found."


class ValidationError(AppException):
    status_code = 422
    error_code = "validation_error"
    message = "Validation failed."


class ConflictError(AppException):
    status_code = 409
    error_code = "conflict"
    message = "Resource already exists."


class UnauthorizedError(AppException):
    status_code = 401
    error_code = "unauthorized"
    message = "Authentication required."


class ForbiddenError(AppException):
    status_code = 403
    error_code = "forbidden"
    message = "You do not have permission to perform this action."


class BadRequestError(AppException):
    status_code = 400
    error_code = "bad_request"
    message = "The request could not be processed."
