"""Schedules message sends without blocking the request lifecycle."""
from __future__ import annotations

import asyncio
from typing import Set

from app.core.logging_config import get_logger
from app.modules.email.models.outbound_message import OutboundMessage
from app.modules.email.providers.base.email_provider import EmailProvider
from app.modules.email.utils.safe_send import safe_send

logger = get_logger(__name__)


class EmailDispatcher:
    """Fire-and-forget sender backed by a single provider.

    Sends run as background tasks so the HTTP response is never delayed by
    email latency, and failures are logged rather than raised.
    """

    def __init__(self, provider: EmailProvider) -> None:
        self._provider = provider
        # Keep strong refs so tasks aren't garbage-collected mid-flight.
        self._tasks: Set[asyncio.Task] = set()

    @property
    def provider_name(self) -> str:
        return self._provider.name

    @property
    def provider_ready(self) -> bool:
        return self._provider.is_ready

    def dispatch(self, message: OutboundMessage) -> None:
        """Schedule ``message`` for background delivery."""
        try:
            task = asyncio.create_task(safe_send(self._provider, message))
        except RuntimeError:
            # No running loop (e.g. sync context) — send inline as a fallback.
            logger.debug("No event loop; sending email inline.")
            asyncio.run(safe_send(self._provider, message))
            return
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    async def dispatch_now(self, message: OutboundMessage) -> bool:
        """Await delivery directly (used by the test-send endpoint)."""
        return await safe_send(self._provider, message)
