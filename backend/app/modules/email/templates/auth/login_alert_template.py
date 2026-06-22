"""Security alert email for a new sign-in."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.templates.base.html_layout import render_layout


def _detail_row(label: str, value: str) -> str:
    return (
        "<tr>"
        f"<td style='padding:6px 0;font-size:13px;color:#6b7280;width:120px;'>{escape(label)}</td>"
        f"<td style='padding:6px 0;font-size:13px;color:#374151;font-weight:600;'>{escape(value)}</td>"
        "</tr>"
    )


class LoginAlertTemplate:
    """Notifies the user that their account was signed into."""

    @staticmethod
    def render(ctx: AuthEmailContext) -> Tuple[str, str]:
        rows = _detail_row("Account", ctx.email)
        if ctx.ip_address:
            rows += _detail_row("IP address", ctx.ip_address)
        if ctx.user_agent:
            rows += _detail_row("Device", ctx.user_agent)

        body_html = (
            "<p style='margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;'>"
            "We noticed a new sign-in to your account. If this was you, no action "
            "is needed.</p>"
            "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' "
            "style='border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;'>"
            f"{rows}</table>"
            "<p style='margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b7280;'>"
            "If this wasn't you, change your password immediately.</p>"
        )
        html = render_layout(
            heading="New sign-in detected",
            intro=f"Hi {escape(ctx.first_name)}, here are the details.",
            body_html=body_html,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            f"A new sign-in to your account ({ctx.email}) was detected.\n"
            f"IP: {ctx.ip_address or 'unknown'}\n"
            f"Device: {ctx.user_agent or 'unknown'}\n\n"
            "If this wasn't you, change your password immediately.\n"
        )
        return html, text
