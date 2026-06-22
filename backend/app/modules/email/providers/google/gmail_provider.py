"""Gmail provider — implements the EmailProvider contract via the Gmail API."""
from __future__ import annotations

from app.core.config import settings
from app.modules.email.models.outbound_message import OutboundMessage
from app.modules.email.providers.base.email_provider import EmailProvider
from app.modules.email.providers.google.client.gmail_api_client import GmailApiClient
from app.modules.email.utils.mime_builder import build_raw_message


class GmailProvider(EmailProvider):
    """Sends mail through a Google account using OAuth2 + the Gmail API."""

    name = "gmail"

    def __init__(self) -> None:
        self._client = GmailApiClient()

    def send(self, message: OutboundMessage) -> None:
        sender_email = settings.EMAIL_SENDER_ADDRESS or settings.GOOGLE_CLIENT_ID
        raw = build_raw_message(
            message,
            sender_email=sender_email,
            sender_name=settings.EMAIL_SENDER_NAME,
        )
        self._client.send_raw(raw)

    @property
    def is_ready(self) -> bool:
        return settings.google_oauth_configured
