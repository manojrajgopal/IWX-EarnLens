"""Renders the subject + body for an event and wraps it as OutboundMessage."""
from __future__ import annotations

from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.constants.email_subjects import EMAIL_SUBJECTS
from app.modules.email.models.outbound_message import OutboundMessage
from app.modules.email.rendering.recipient import resolve_recipient
from app.modules.email.templates.registry import AnyContext, TemplateRegistry


class TemplateRenderer:
    """Composes subject + html/text into a transport-ready message."""

    def render(self, event: EmailEvent, context: AnyContext) -> OutboundMessage:
        renderer = TemplateRegistry.resolve(event)
        html_body, text_body = renderer(context)
        subject = EMAIL_SUBJECTS.get(event, "IWX-EarnLens notification")
        email, name = resolve_recipient(context)
        return OutboundMessage(
            to_email=email,
            to_name=name,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )
