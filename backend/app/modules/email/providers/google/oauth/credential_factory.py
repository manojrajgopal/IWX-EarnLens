"""Builds and refreshes Google OAuth2 credentials from a refresh token."""
from __future__ import annotations

from typing import TYPE_CHECKING, Any, List

from app.core.config import settings

if TYPE_CHECKING:  # pragma: no cover - typing only, avoids importing google eagerly
    from google.oauth2.credentials import Credentials

# Sending mail is the only scope we require.
GMAIL_SEND_SCOPES: List[str] = ["https://www.googleapis.com/auth/gmail.send"]

_GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"


class CredentialFactory:
    """Constructs :class:`google.oauth2.credentials.Credentials`.

    A long-lived refresh token (``GOOGLE_REFRESH_TOKEN``) is exchanged by the
    Google client library for short-lived access tokens automatically, so we
    never persist access tokens ourselves. The Google import is deferred to
    call time so the application can boot (and fall back to the console
    provider) even when the optional google libraries are not installed.
    """

    @staticmethod
    def build() -> "Credentials":
        """Create credentials from the configured Google OAuth2 settings."""
        from google.oauth2.credentials import Credentials  # noqa: PLC0415

        return Credentials(
            token=settings.GOOGLE_ACCESS_TOKEN or None,
            refresh_token=settings.GOOGLE_REFRESH_TOKEN,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            token_uri=_GOOGLE_TOKEN_URI,
            scopes=GMAIL_SEND_SCOPES,
        )
