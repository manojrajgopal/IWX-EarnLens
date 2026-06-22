"""One-time passcode email sent during registration to verify the address."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.templates.base.html_layout import render_layout


class RegistrationOtpTemplate:
    """Renders the email carrying the registration verification code."""

    @staticmethod
    def render(ctx: AuthEmailContext) -> Tuple[str, str]:
        name = escape(ctx.first_name)
        code = escape(ctx.otp_code or "------")
        minutes = ctx.otp_expiry_minutes or 10
        spaced_code = " ".join(list(code))

        body_html = (
            "<p style='margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;'>"
            "Use the verification code below to finish creating your "
            "IWX-EarnLens account. Enter it on the verification screen to "
            "confirm this is really you."
            "</p>"
            "<div style='margin:4px 0 18px;padding:18px 20px;text-align:center;"
            "background:#f1f5ff;border:1px solid #dbe3ff;border-radius:12px;'>"
            f"<span style='font-size:34px;font-weight:700;letter-spacing:10px;"
            f"color:#1e1b4b;font-family:monospace;'>{escape(spaced_code)}</span>"
            "</div>"
            "<p style='margin:0 0 6px;font-size:13px;line-height:1.6;color:#6b7280;'>"
            f"This code expires in <strong>{minutes} minutes</strong>. "
            "If you didn't request it, you can safely ignore this email."
            "</p>"
        )
        html = render_layout(
            heading=f"Verify your email, {name}",
            intro="One quick step to secure your new account.",
            body_html=body_html,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            f"Your IWX-EarnLens verification code is: {ctx.otp_code or ''}\n"
            f"It expires in {minutes} minutes.\n\n"
            "If you didn't request this, you can ignore this email.\n"
        )
        return html, text
