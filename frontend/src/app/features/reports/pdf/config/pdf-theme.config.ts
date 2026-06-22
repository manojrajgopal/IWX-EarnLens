import { PdfTheme } from '../models/pdf-theme.model';
import { ReportThemeId } from '../models/report-options.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Cinematic theme presets
 * ─────────────────────────────────────────────────────────────
 *  Four hand-tuned palettes. Each one re-skins the entire PDF —
 *  cover gradient, chart series, panels, ink and gold accents.
 */
export const PDF_THEMES: Record<ReportThemeId, PdfTheme> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Ledger',
    tagline: 'Deep indigo · aurora accents',
    palette: {
      ink: '#0e1430',
      inkSoft: '#48507a',
      inkFaint: '#8b91b4',
      paper: '#ffffff',
      panel: '#f5f6fc',
      panelAlt: '#eceefa',
      line: '#dfe2f2',
      accent: '#4f46e5',
      accentSoft: '#e7e6fb',
      accent2: '#7c3aed',
      accent3: '#0ea5e9',
      positive: '#0e9f6e',
      gold: '#c79a3a',
      coverFrom: '#0b1030',
      coverMid: '#241a5e',
      coverTo: '#4326a8',
      coverGlow: '#7c5cff',
      onCover: '#ffffff',
      onCoverSoft: '#c4c8f5',
    },
    series: ['#6366f1', '#8b5cf6', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'],
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Bloom',
    tagline: 'Emerald · teal · luminous',
    palette: {
      ink: '#06281f',
      inkSoft: '#3c5f54',
      inkFaint: '#7da093',
      paper: '#ffffff',
      panel: '#f1faf5',
      panelAlt: '#e3f4ec',
      line: '#cfe9dd',
      accent: '#0e9f6e',
      accentSoft: '#d6f3e6',
      accent2: '#14b8a6',
      accent3: '#0ea5e9',
      positive: '#0e9f6e',
      gold: '#b98a2e',
      coverFrom: '#03241c',
      coverMid: '#0a5640',
      coverTo: '#0f8f6a',
      coverGlow: '#4ade80',
      onCover: '#ffffff',
      onCoverSoft: '#bfeedb',
    },
    series: ['#10b981', '#14b8a6', '#0ea5e9', '#6366f1', '#f59e0b', '#84cc16', '#06b6d4', '#a855f7'],
  },
  noir: {
    id: 'noir',
    name: 'Noir Bullion',
    tagline: 'Charcoal · molten gold',
    palette: {
      ink: '#15151a',
      inkSoft: '#52525b',
      inkFaint: '#9b9ba6',
      paper: '#ffffff',
      panel: '#f6f6f7',
      panelAlt: '#ededf0',
      line: '#e0e0e4',
      accent: '#b8860b',
      accentSoft: '#f4ead0',
      accent2: '#a16207',
      accent3: '#525252',
      positive: '#15803d',
      gold: '#caa24a',
      coverFrom: '#08080a',
      coverMid: '#1c1b21',
      coverTo: '#2c2a33',
      coverGlow: '#d4af37',
      onCover: '#f7f3e8',
      onCoverSoft: '#b9b4a4',
    },
    series: ['#caa24a', '#b8860b', '#8c7853', '#525252', '#737373', '#a16207', '#3f3f46', '#d4af37'],
  },
  classic: {
    id: 'classic',
    name: 'Classic Slate',
    tagline: 'Editorial · neutral · timeless',
    palette: {
      ink: '#1f2937',
      inkSoft: '#566174',
      inkFaint: '#94a0b3',
      paper: '#ffffff',
      panel: '#f7f8fa',
      panelAlt: '#eef1f5',
      line: '#e2e6ec',
      accent: '#2563eb',
      accentSoft: '#dceafe',
      accent2: '#0f766e',
      accent3: '#9333ea',
      positive: '#16a34a',
      gold: '#b08925',
      coverFrom: '#101826',
      coverMid: '#1f2d44',
      coverTo: '#2f4563',
      coverGlow: '#5b8def',
      onCover: '#ffffff',
      onCoverSoft: '#aebbd0',
    },
    series: ['#2563eb', '#0f766e', '#9333ea', '#ea580c', '#16a34a', '#0891b2', '#db2777', '#65a30d'],
  },
};

/** Resolve a theme by id with a safe fallback. */
export function resolveTheme(id: ReportThemeId): PdfTheme {
  return PDF_THEMES[id] ?? PDF_THEMES.midnight;
}

/** Ordered list for the dialog's theme picker. */
export const THEME_ORDER: ReportThemeId[] = ['midnight', 'aurora', 'noir', 'classic'];
