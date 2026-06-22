/**
 * ─────────────────────────────────────────────────────────────
 *  Cinematic PDF report engine — public API (the tree's root)
 * ─────────────────────────────────────────────────────────────
 *  One import surface for the whole nested feature:
 *
 *    import { PdfReportFacade, defaultReportOptions } from './pdf';
 */
export { PdfReportFacade } from './pdf-report.facade';

export * from './models';
export {
  PDF_THEMES,
  THEME_ORDER,
  resolveTheme,
  REPORT_SECTIONS,
  defaultReportOptions,
} from './config';
export type { ReportSectionMeta } from './config/report-section.config';
