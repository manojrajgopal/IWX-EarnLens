"""Welcome email sent right after registration."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.core.config import settings
from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.templates.base.html_layout import render_layout


class WelcomeTemplate:
    """Onboarding greeting for new users."""

    @staticmethod
    def render(ctx: AuthEmailContext) -> Tuple[str, str]:
        name = escape(ctx.first_name)
        body_html = (
            "<p style='margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;'>"
            "Your account is ready. With IWX-EarnLens you can record income, track "
            "recurring earnings, visualise trends, and export polished reports."
            "</p>"
        )
        html = render_layout(
            heading=f"Welcome, {name}!",
            intro="We're thrilled to have you on board.",
            body_html=body_html,
            cta_label="Open your dashboard",
            cta_url=f"{settings.FRONTEND_BASE_URL}/app/dashboard",
        )
        text = (
            f"Welcome, {ctx.first_name}!\n\n"
            "Your IWX-EarnLens account is ready. Record income, track recurring "
            "earnings, visualise trends, and export reports anytime.\n"
        )
        return html, text
