"""Development fallback provider — logs emails instead of sending them."""
from app.modules.email.providers.console.console_provider import ConsoleProvider

__all__ = ["ConsoleProvider"]
