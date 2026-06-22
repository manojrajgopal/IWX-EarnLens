"""FastAPI dependency providers for the email module."""
from app.modules.email.dependencies.email_dependencies import (
    get_email_notifier,
    get_email_service,
)

__all__ = ["get_email_service", "get_email_notifier"]
