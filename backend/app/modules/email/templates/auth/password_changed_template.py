"""Confirmation email sent after a successful password change."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.templates.base.html_layout import render_layout
from app.modules.email.templates.base.theme import EmailTheme


class PasswordChangedTemplate:
    """Tells the user their password was just changed."""

    @staticmethod
    def render(ctx: AuthEmailContext) -> Tuple[str, str]:
        body_html = (
            "<p style='margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;'>"
            "This is a confirmation that the password for your account "
            f"(<strong>{escape(ctx.email)}</strong>) was changed successfully.</p>"
            "<p style='margin:14px 0 0;font-size:13px;line-height:1.6;color:#6b7280;'>"
            "If you didn't make this change, contact support and secure your "
            "account right away.</p>"
        )
        html = render_layout(
            heading="Your password was changed",
            intro=f"Hi {escape(ctx.first_name)},",
            body_html=body_html,
            accent=EmailTheme.ACCENT,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            f"The password for your account ({ctx.email}) was changed "
            "successfully.\n\nIf this wasn't you, contact support immediately.\n"
        )
        return html, text
