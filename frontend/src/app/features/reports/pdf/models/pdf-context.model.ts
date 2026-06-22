import { IncomeReport } from '../../../../core/models/report.model';
import { ReportOptions } from './report-options.model';
import { PdfTheme } from './pdf-theme.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  PDF context — the single payload every builder receives
 * ─────────────────────────────────────────────────────────────
 *  Bundles the data, the user's choices, the resolved theme and
 *  derived metadata so each branch of the tree stays pure.
 */
export interface PdfMeta {
  appName: string;
  appTagline: string;
  generatedAt: Date;
  generatedLabel: string;
  rangeLabel: string;
  edition: string;
}

export interface PdfContext {
  report: IncomeReport;
  options: ReportOptions;
  theme: PdfTheme;
  meta: PdfMeta;
}
