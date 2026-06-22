"""A no-network provider that logs the email — used when Gmail isn't set up."""
from __future__ import annotations

from app.core.logging_config import get_logger
from app.modules.email.models.outbound_message import OutboundMessage
from app.modules.email.providers.base.email_provider import EmailProvider

logger = get_logger(__name__)


class ConsoleProvider(EmailProvider):
    """Prints the email to the log. Always 'ready'; never touches the network."""

    name = "console"

    def send(self, message: OutboundMessage) -> None:
        logger.info(
            "\n[ConsoleProvider] Email (not actually sent)\n"
            "  To:      %s\n"
            "  Subject: %s\n"
            "  ----- text -----\n%s\n",
            message.recipient_display,
            message.subject,
            message.text_body,
        )

    @property
    def is_ready(self) -> bool:
        return True
