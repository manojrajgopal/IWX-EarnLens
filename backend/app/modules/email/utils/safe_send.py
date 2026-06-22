"""Fire-and-forget dispatch that never lets email failures break a request."""
from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

from app.core.logging_config import get_logger
from app.modules.email.models.outbound_message import OutboundMessage

if TYPE_CHECKING:
    from app.modules.email.providers.base.email_provider import EmailProvider

logger = get_logger(__name__)


async def safe_send(provider: "EmailProvider", message: OutboundMessage) -> bool:
    """Send ``message`` in a worker thread, swallowing and logging errors.

    Returns ``True`` on success, ``False`` otherwise. Providers are sync and
    potentially blocking (Gmail API), so we offload to a thread.
    """
    try:
        await asyncio.to_thread(provider.send, message)
        logger.info("Email sent to %s — %s", message.to_email, message.subject)
        return True
    except Exception as exc:  # noqa: BLE001 - email must never crash a request
        logger.warning(
            "Email to %s failed (%s): %s",
            message.to_email,
            message.subject,
            exc,
        )
        return False
