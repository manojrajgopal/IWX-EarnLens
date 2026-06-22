"""The fully-rendered, provider-agnostic email ready to be sent."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(slots=True, frozen=True)
class OutboundMessage:
    """A renderable email decoupled from any transport.

    Providers consume this; rendering produces it. Keeping it transport-free
    means the same message can be sent over Gmail, SMTP, or logged in dev.
    """

    to_email: str
    subject: str
    html_body: str
    text_body: str
    to_name: Optional[str] = None

    @property
    def recipient_display(self) -> str:
        """``Name <email>`` when a name is present, else the bare address."""
        if self.to_name:
            return f"{self.to_name} <{self.to_email}>"
        return self.to_email
