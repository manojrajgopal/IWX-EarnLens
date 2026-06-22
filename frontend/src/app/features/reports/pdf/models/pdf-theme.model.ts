import { ReportThemeId } from './report-options.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  PDF theme model — the colour DNA of a cinematic report
 * ─────────────────────────────────────────────────────────────
 */

/** Flat palette consumed by every builder & primitive. */
export interface PdfPalette {
  /** Primary body text. */
  ink: string;
  /** Secondary / muted text. */
  inkSoft: string;
  /** Faint captions & hairlines text. */
  inkFaint: string;
  /** Page paper colour. */
  paper: string;
  /** Card / panel fill. */
  panel: string;
  /** Alternate panel fill (zebra, sub-cards). */
  panelAlt: string;
  /** Hairline borders. */
  line: string;
  /** Primary accent. */
  accent: string;
  /** Soft tint of the accent (fills). */
  accentSoft: string;
  /** Secondary accent. */
  accent2: string;
  /** Tertiary accent. */
  accent3: string;
  /** Positive / money tone. */
  positive: string;
  /** Premium gold tone. */
  gold: string;
  /** Cover gradient — top stop. */
  coverFrom: string;
  /** Cover gradient — mid stop. */
  coverMid: string;
  /** Cover gradient — bottom stop. */
  coverTo: string;
  /** Cover glow / aura colour. */
  coverGlow: string;
  /** Text on the cover. */
  onCover: string;
  /** Muted text on the cover. */
  onCoverSoft: string;
}

/** A complete cinematic theme. */
export interface PdfTheme {
  id: ReportThemeId;
  name: string;
  tagline: string;
  palette: PdfPalette;
  /** Ordered palette for charts & distributions. */
  series: string[];
}
