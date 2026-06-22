"""Password reset email carrying the secure reset link."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.templates.base.html_layout import render_layout


class PasswordResetTemplate:
    """Delivers the time-limited password reset link."""

    @staticmethod
    def render(ctx: AuthEmailContext) -> Tuple[str, str]:
        link = ctx.reset_link or ""
        body_html = (
            "<p style='margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;'>"
            "We received a request to reset your password. Click the button below "
            "to choose a new one. This link expires shortly for your security.</p>"
            "<p style='margin:14px 0 0;font-size:13px;line-height:1.6;color:#6b7280;'>"
            "If you didn't request this, you can safely ignore this email — your "
            "password won't change.</p>"
        )
        html = render_layout(
            heading="Reset your password",
            intro=f"Hi {escape(ctx.first_name)}, let's get you back in.",
            body_html=body_html,
            cta_label="Reset password",
            cta_url=link,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            "We received a request to reset your password. Use the link below to "
            "choose a new one (it expires shortly):\n\n"
            f"{link}\n\n"
            "If you didn't request this, ignore this email.\n"
        )
        return html, text
