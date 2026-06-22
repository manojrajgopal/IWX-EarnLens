"""Brand palette used across all email templates."""
from __future__ import annotations


class EmailTheme:
    """Central colour + brand tokens, kept in one place for easy reskinning."""

    BRAND = "IWX-EarnLens"
    PRIMARY = "#6366f1"
    PRIMARY_DARK = "#4f46e5"
    ACCENT = "#10b981"
    DANGER = "#ef4444"
    TEXT = "#1f2937"
    TEXT_MUTED = "#6b7280"
    BG = "#f3f4f6"
    CARD = "#ffffff"
    BORDER = "#e5e7eb"
    FONT = (
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, "
        "Arial, sans-serif"
    )
