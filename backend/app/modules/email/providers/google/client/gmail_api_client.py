"""Low-level Gmail API client: builds the service and sends raw messages."""
from __future__ import annotations

from typing import Any, Optional

from app.core.logging_config import get_logger
from app.modules.email.providers.google.oauth.credential_factory import (
    CredentialFactory,
)

logger = get_logger(__name__)


class GmailApiClient:
    """Caches an authenticated Gmail service and sends base64url payloads.

    The Google client library is synchronous and the discovery build is
    relatively expensive, so the service handle is lazily created and reused.
    The google imports themselves are deferred to call time so the wider app
    can run without the optional google dependencies installed.
    """

    def __init__(self) -> None:
        self._service: Optional[Any] = None

    def _ensure_service(self) -> Any:
        if self._service is not None:
            return self._service
        from google.auth.transport.requests import Request  # noqa: PLC0415
        from googleapiclient.discovery import build  # noqa: PLC0415

        credentials = CredentialFactory.build()
        if not credentials.valid:
            credentials.refresh(Request())
        # cache_discovery=False avoids noisy warnings on some environments.
        self._service = build(
            "gmail", "v1", credentials=credentials, cache_discovery=False
        )
        return self._service

    def send_raw(self, raw_message: str) -> str:
        """Send a base64url-encoded MIME message; return the Gmail message id."""
        service = self._ensure_service()
        result = (
            service.users()
            .messages()
            .send(userId="me", body={"raw": raw_message})
            .execute()
        )
        message_id = result.get("id", "")
        logger.debug("Gmail accepted message id=%s", message_id)
        return message_id
