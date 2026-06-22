"""Cinematic colour palettes — exact mirror of the frontend PDF themes.

Each palette is a hand-tuned preset. Hex values are kept identical to the
Angular ``pdf-theme.config.ts`` so the server-rendered report is visually
faithful to the original client design.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass(frozen=True)
class Palette:
    """A complete cinematic colour set used by every builder/primitive."""

    name: str
    tagline: str
    # Text
    ink: str
    ink_soft: str
    ink_faint: str
    # Surfaces
    paper: str
    panel: str
    panel_alt: str
    line: str
    # Accents
    accent: str
    accent_soft: str
    accent2: str
    accent3: str
    positive: str
    gold: str
    # Cover
    cover_from: str
    cover_mid: str
    cover_to: str
    cover_glow: str
    on_cover: str
    on_cover_soft: str
    # Chart cycle
    series: List[str] = field(default_factory=list)


THEMES: Dict[str, Palette] = {
    "midnight": Palette(
        name="Midnight Ledger",
        tagline="Deep indigo · aurora accents",
        ink="#0e1430",
        ink_soft="#48507a",
        ink_faint="#8b91b4",
        paper="#ffffff",
        panel="#f5f6fc",
        panel_alt="#eceefa",
        line="#dfe2f2",
        accent="#4f46e5",
        accent_soft="#e7e6fb",
        accent2="#7c3aed",
        accent3="#0ea5e9",
        positive="#0e9f6e",
        gold="#c79a3a",
        cover_from="#0b1030",
        cover_mid="#241a5e",
        cover_to="#4326a8",
        cover_glow="#7c5cff",
        on_cover="#ffffff",
        on_cover_soft="#c4c8f5",
        series=["#6366f1", "#8b5cf6", "#0ea5e9", "#22c55e",
                "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e"],
    ),
    "aurora": Palette(
        name="Aurora Bloom",
        tagline="Emerald · teal · luminous",
        ink="#06281f",
        ink_soft="#3c5f54",
        ink_faint="#7da093",
        paper="#ffffff",
        panel="#f1faf5",
        panel_alt="#e3f4ec",
        line="#cfe9dd",
        accent="#0e9f6e",
        accent_soft="#d6f3e6",
        accent2="#14b8a6",
        accent3="#0ea5e9",
        positive="#0e9f6e",
        gold="#b98a2e",
        cover_from="#03241c",
        cover_mid="#0a5640",
        cover_to="#0f8f6a",
        cover_glow="#4ade80",
        on_cover="#ffffff",
        on_cover_soft="#bfeedb",
        series=["#10b981", "#14b8a6", "#0ea5e9", "#6366f1",
                "#f59e0b", "#84cc16", "#06b6d4", "#a855f7"],
    ),
    "noir": Palette(
        name="Noir Bullion",
        tagline="Charcoal · molten gold",
        ink="#15151a",
        ink_soft="#52525b",
        ink_faint="#9b9ba6",
        paper="#ffffff",
        panel="#f6f6f7",
        panel_alt="#ededf0",
        line="#e0e0e4",
        accent="#b8860b",
        accent_soft="#f4ead0",
        accent2="#a16207",
        accent3="#525252",
        positive="#15803d",
        gold="#caa24a",
        cover_from="#08080a",
        cover_mid="#1c1b21",
        cover_to="#2c2a33",
        cover_glow="#d4af37",
        on_cover="#f7f3e8",
        on_cover_soft="#b9b4a4",
        series=["#caa24a", "#b8860b", "#8c7853", "#525252",
                "#737373", "#a16207", "#3f3f46", "#d4af37"],
    ),
    "classic": Palette(
        name="Classic Slate",
        tagline="Editorial · neutral · timeless",
        ink="#1f2937",
        ink_soft="#566174",
        ink_faint="#94a0b3",
        paper="#ffffff",
        panel="#f7f8fa",
        panel_alt="#eef1f5",
        line="#e2e6ec",
        accent="#2563eb",
        accent_soft="#dceafe",
        accent2="#0f766e",
        accent3="#9333ea",
        positive="#16a34a",
        gold="#b08925",
        cover_from="#101826",
        cover_mid="#1f2d44",
        cover_to="#2f4563",
        cover_glow="#5b8def",
        on_cover="#ffffff",
        on_cover_soft="#aebbd0",
        series=["#2563eb", "#0f766e", "#9333ea", "#ea580c",
                "#16a34a", "#0891b2", "#db2777", "#65a30d"],
    ),
}


def resolve_palette(theme_id: str) -> Palette:
    """Return the palette for ``theme_id`` falling back to midnight."""
    return THEMES.get(theme_id, THEMES["midnight"])


def series_color(palette: Palette, index: int) -> str:
    """Pick a chart colour by index, cycling through the series."""
    return palette.series[index % len(palette.series)]
