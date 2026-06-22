"""Email sent when an income entry is deleted."""
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


class IncomeDeletedTemplate:
    @staticmethod
    def render(ctx: IncomeEmailContext) -> Tuple[str, str]:
        body_html = (
            "<p style='margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;'>"
            "An income entry was removed from your account.</p>"
            f"{render_income_card(ctx)}"
            "<p style='margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b7280;'>"
            "If this was a mistake, you can add it again from your dashboard.</p>"
        )
        html = render_layout(
            heading="Income deleted 🗑️",
            intro=f"Hi {escape(ctx.first_name)},",
            body_html=body_html,
            accent=EmailTheme.DANGER,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            f"An income entry was deleted: {ctx.title} — "
            f"{format_money(ctx.amount, ctx.currency)}.\n"
        )
        return html, text
