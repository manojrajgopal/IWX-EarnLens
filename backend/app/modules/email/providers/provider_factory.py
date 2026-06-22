"""Selects the active email provider based on configuration."""
from __future__ import annotations

from app.core.config import settings
from app.core.logging_config import get_logger
from app.modules.email.providers.base.email_provider import EmailProvider
from app.modules.email.providers.console.console_provider import ConsoleProvider
from app.modules.email.providers.google.gmail_provider import GmailProvider

logger = get_logger(__name__)


def build_provider() -> EmailProvider:
    """Return Gmail when OAuth2 is configured, else the console fallback."""
    if settings.EMAIL_ENABLED and settings.google_oauth_configured:
        logger.info("Email provider: Gmail API (OAuth2).")
        return GmailProvider()
    logger.info(
        "Email provider: Console (Gmail not configured or email disabled)."
    )
    return ConsoleProvider()
