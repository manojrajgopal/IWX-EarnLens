"""Shared rendering helpers for income emails."""
from __future__ import annotations

from html import escape

from app.modules.email.schemas.context_schemas import IncomeEmailContext

# Minimal currency symbol map; falls back to the ISO code.
_SYMBOLS = {
    "INR": "₹",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "AUD": "A$",
    "CAD": "C$",
}


def format_money(amount: float, currency: str) -> str:
    symbol = _SYMBOLS.get(currency.upper(), f"{currency} ")
    return f"{symbol}{amount:,.2f}"


def _row(label: str, value: str) -> str:
    return (
        "<tr>"
        f"<td style='padding:7px 0;font-size:13px;color:#6b7280;width:130px;'>{escape(label)}</td>"
        f"<td style='padding:7px 0;font-size:14px;color:#111827;font-weight:600;'>{escape(value)}</td>"
        "</tr>"
    )


def render_income_card(ctx: IncomeEmailContext) -> str:
    """Render the boxed summary of an income entry."""
    rows = _row("Title", ctx.title or "—")
    rows += _row("Amount", format_money(ctx.amount, ctx.currency))
    if ctx.income_type:
        rows += _row("Type", ctx.income_type.replace("_", " ").title())
    if ctx.status:
        rows += _row("Status", ctx.status.replace("_", " ").title())
    if ctx.payment_date:
        rows += _row("Date", ctx.payment_date)
    return (
        "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' "
        "style='border:1px solid #e5e7eb;border-radius:10px;padding:6px 16px;'>"
        f"{rows}</table>"
    )
