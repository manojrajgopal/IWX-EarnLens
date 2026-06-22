/**
 * ─────────────────────────────────────────────────────────────
 *  Report options — the user-chosen preferences (from the dialog)
 * ─────────────────────────────────────────────────────────────
 *  Every cinematic PDF is driven by one of these objects. The
 *  dialog collects it, the facade consumes it.
 */

/** Cinematic colour themes the user can pick in the dialog. */
export type ReportThemeId = 'midnight' | 'aurora' | 'noir' | 'classic';

/** Paper sizes offered to the user. */
export type ReportPageSize = 'A4' | 'LETTER';

/** Density of the entries ledger. */
export type ReportDensity = 'comfortable' | 'compact';

/** Every toggleable section of the document. */
export type ReportSectionId =
  | 'cover'
  | 'summary'
  | 'categories'
  | 'types'
  | 'trend'
  | 'ledger';

/** The full set of preferences captured by the dialog. */
export interface ReportOptions {
  /** Headline printed on the cover. */
  title: string;
  /** Sub-headline printed under the title. */
  subtitle: string;
  /** "Prepared for" name on the cover. */
  preparedFor: string;
  /** Optional date-range start (ISO `yyyy-mm-dd`) — null = all time. */
  startDate: string | null;
  /** Optional date-range end (ISO `yyyy-mm-dd`) — null = open ended. */
  endDate: string | null;
  /** Selected cinematic theme. */
  themeId: ReportThemeId;
  /** Paper size. */
  pageSize: ReportPageSize;
  /** Ledger row spacing. */
  density: ReportDensity;
  /** Embed the IWX seal on the cover & page chrome. */
  includeLogo: boolean;
  /** Render the personal note block on the cover. */
  includeCoverNote: boolean;
  /** Free-text cover note. */
  coverNote: string;
  /** Which sections are printed. */
  sections: Record<ReportSectionId, boolean>;
  /** Max ledger rows (0 = unlimited). */
  ledgerLimit: number;
  /** Download file name (without extension). */
  fileName: string;
}
