"""Thin wrapper around the Gmail send endpoint."""
from app.modules.email.providers.google.client.gmail_api_client import GmailApiClient

__all__ = ["GmailApiClient"]
