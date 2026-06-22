"""Transport providers — how a message physically leaves the system."""
from app.modules.email.providers.base.email_provider import EmailProvider
from app.modules.email.providers.console.console_provider import ConsoleProvider
from app.modules.email.providers.google.gmail_provider import GmailProvider

__all__ = ["EmailProvider", "ConsoleProvider", "GmailProvider"]
