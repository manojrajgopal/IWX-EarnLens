"""Shared email scaffolding: theme tokens and the HTML layout."""
from app.modules.email.templates.base.html_layout import render_layout
from app.modules.email.templates.base.theme import EmailTheme

__all__ = ["render_layout", "EmailTheme"]
