"""Builds a base64url-encoded MIME payload for the Gmail API."""
from __future__ import annotations

import base64
from email.message import EmailMessage
from typing import Optional

from app.modules.email.models.outbound_message import OutboundMessage
from app.modules.email.utils.address import format_address


def build_mime(
    message: OutboundMessage,
    sender_email: str,
    sender_name: Optional[str] = None,
) -> EmailMessage:
    """Assemble a multipart/alternative MIME message (text + HTML)."""
    mime = EmailMessage()
    mime["To"] = format_address(message.to_email, message.to_name)
    mime["From"] = format_address(sender_email, sender_name)
    mime["Subject"] = message.subject
    mime.set_content(message.text_body or "")
    mime.add_alternative(message.html_body, subtype="html")
    return mime


def build_raw_message(
    message: OutboundMessage,
    sender_email: str,
    sender_name: Optional[str] = None,
) -> str:
    """Return the base64url string the Gmail ``send`` endpoint expects."""
    mime = build_mime(message, sender_email, sender_name)
    return base64.urlsafe_b64encode(mime.as_bytes()).decode("utf-8")
