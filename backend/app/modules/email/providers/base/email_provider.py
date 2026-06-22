"""Abstract transport contract every email provider implements."""
from __future__ import annotations

from abc import ABC, abstractmethod

from app.modules.email.models.outbound_message import OutboundMessage


class EmailProvider(ABC):
    """Sends a single :class:`OutboundMessage`.

    Implementations are synchronous; the dispatcher offloads them to a
    worker thread so the event loop is never blocked.
    """

    name: str = "base"

    @abstractmethod
    def send(self, message: OutboundMessage) -> None:
        """Deliver ``message`` or raise on failure."""

    @property
    @abstractmethod
    def is_ready(self) -> bool:
        """True when the provider is configured and able to send."""
