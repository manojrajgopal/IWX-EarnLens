"""The public surface other modules use to send email.

Callers build a typed context and call ``send`` with an event. Rendering and
transport are handled internally; preference gating is the caller's job (via
:class:`NotificationGate`) so domain modules stay in control of policy.
"""
from __future__ import annotations

from app.core.logging_config import get_logger
from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.providers.provider_factory import build_provider
from app.modules.email.rendering.template_renderer import TemplateRenderer
from app.modules.email.services.dispatch.email_dispatcher import EmailDispatcher
from app.modules.email.templates.registry import AnyContext

logger = get_logger(__name__)


class EmailService:
    """Facade over rendering + dispatch for a single configured provider."""

    def __init__(self) -> None:
        self._renderer = TemplateRenderer()
        self._dispatcher = EmailDispatcher(build_provider())

    # ------------------------------------------------------------------ #
    # Status
    # ------------------------------------------------------------------ #
    @property
    def provider_name(self) -> str:
        return self._dispatcher.provider_name

    @property
    def is_ready(self) -> bool:
        return self._dispatcher.provider_ready

    # ------------------------------------------------------------------ #
    # Sending
    # ------------------------------------------------------------------ #
    def send(self, event: EmailEvent, context: AnyContext) -> None:
        """Render ``event`` with ``context`` and dispatch in the background."""
        try:
            message = self._renderer.render(event, context)
        except Exception as exc:  # noqa: BLE001 - never break the caller
            logger.warning("Failed to render email for %s: %s", event, exc)
            return
        self._dispatcher.dispatch(message)

    async def send_now(self, event: EmailEvent, context: AnyContext) -> bool:
        """Render and await delivery (used for diagnostics/test endpoints)."""
        message = self._renderer.render(event, context)
        return await self._dispatcher.dispatch_now(message)
