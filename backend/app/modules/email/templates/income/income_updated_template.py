"""Email sent when an income entry is updated."""
from __future__ import annotations

from html import escape
from typing import Tuple

from app.modules.email.schemas.context_schemas import IncomeEmailContext
from app.modules.email.templates.base.html_layout import render_layout
from app.modules.email.templates.income.income_card import (
    format_money,
    render_income_card,
)


class IncomeUpdatedTemplate:
    @staticmethod
    def render(ctx: IncomeEmailContext) -> Tuple[str, str]:
        body_html = (
            "<p style='margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;'>"
            "One of your income entries was updated. Here's how it looks now:</p>"
            f"{render_income_card(ctx)}"
        )
        html = render_layout(
            heading="Income updated ✏️",
            intro=f"Hi {escape(ctx.first_name)},",
            body_html=body_html,
        )
        text = (
            f"Hi {ctx.first_name},\n\n"
            f"An income entry was updated: {ctx.title} — "
            f"{format_money(ctx.amount, ctx.currency)}.\n"
        )
        return html, text
