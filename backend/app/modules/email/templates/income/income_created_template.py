"""Email sent when a new income entry is recorded."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.modules.email.schemas.context_schemas import IncomeEmailContext
from app.modules.email.templates.base.html_layout import render_layout
from app.modules.email.templates.base.theme import EmailTheme
from app.modules.email.templates.income.income_card import (
    format_money,
    render_income_card,
)


class IncomeCreatedTemplate:
    @staticmethod
    def render(ctx: IncomeEmailContext) -> Tuple[str, str]:
        body_html = (
            "<p style='margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;'>"
            "A new income entry was just added to your account.</p>"
            f"{render_income_card(ctx)}"
        )
        html = render_layout(
            heading="Income added ✅",
            intro=f"Nice work, {escape(ctx.first_name)}!",
            body_html=body_html,
            accent=EmailTheme.ACCENT,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            f"A new income entry was added: {ctx.title} — "
            f"{format_money(ctx.amount, ctx.currency)}.\n"
        )
        return html, text
