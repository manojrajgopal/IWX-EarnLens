"""Number, money and date formatting — mirrors the frontend format utils."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

# Common currency symbols for compact rendering; falls back to the ISO code.
_CURRENCY_SYMBOLS = {
    "USD": "$", "EUR": "€", "GBP": "£", "INR": "₹", "JPY": "¥",
    "AUD": "A$", "CAD": "C$", "SGD": "S$", "CHF": "CHF ", "CNY": "¥",
    "AED": "د.إ ", "NZD": "NZ$", "ZAR": "R", "BRL": "R$", "RUB": "₽",
    "HKD": "HK$", "KRW": "₩", "SEK": "kr ", "NOK": "kr ", "DKK": "kr ",
}


def _symbol(currency: str) -> str:
    return _CURRENCY_SYMBOLS.get((currency or "").upper(), f"{currency} ")


def format_money(value: float, currency: str) -> str:
    """``$2,847,300.50`` style currency string."""
    sym = _symbol(currency)
    try:
        return f"{sym}{value:,.2f}"
    except (TypeError, ValueError):
        return f"{currency} {value:.2f}"


def format_money_compact(value: float, currency: str) -> str:
    """Compact money for tight chart labels — ``$2.8K`` / ``$1.2M``."""
    sym = _symbol(currency)
    n = abs(value)
    if n >= 1_000_000_000:
        body = f"{value / 1_000_000_000:.1f}B"
    elif n >= 1_000_000:
        body = f"{value / 1_000_000:.1f}M"
    elif n >= 1_000:
        body = f"{value / 1_000:.1f}K"
    else:
        body = f"{value:.0f}"
    body = body.replace(".0B", "B").replace(".0M", "M").replace(".0K", "K")
    return f"{sym}{body}"


def format_int(value: float) -> str:
    """Grouped integer — ``1,284``."""
    try:
        return f"{int(round(value)):,}"
    except (TypeError, ValueError):
        return str(value)


def format_percent(value: float) -> str:
    """One-decimal percentage — ``42.5%``."""
    return f"{value:.1f}%"


def _coerce_dt(value) -> Optional[datetime]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip()
    if not text:
        return None
    try:
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        return datetime.fromisoformat(text)
    except ValueError:
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y/%m/%d"):
            try:
                return datetime.strptime(str(value)[:19], fmt)
            except ValueError:
                continue
    return None


def format_medium_date(value) -> str:
    """``22 Jun 2025``."""
    dt = _coerce_dt(value)
    return dt.strftime("%d %b %Y") if dt else "—"


def format_date_time(value) -> str:
    """``22 Jun 2025 · 14:08``."""
    dt = _coerce_dt(value)
    return dt.strftime("%d %b %Y · %H:%M") if dt else "—"


def format_range_label(start, end) -> str:
    """Human coverage label for cover/header/section subtitles."""
    s = _coerce_dt(start)
    e = _coerce_dt(end)
    if s and e:
        return f"{s.strftime('%d %b %Y')} — {e.strftime('%d %b %Y')}"
    if s:
        return f"From {s.strftime('%d %b %Y')}"
    if e:
        return f"Up to {e.strftime('%d %b %Y')}"
    return "All time"


def humanize(value: str) -> str:
    """``freelance_work`` → ``Freelance Work``."""
    if not value:
        return "—"
    return " ".join(part.capitalize() for part in str(value).replace("-", "_").split("_"))
