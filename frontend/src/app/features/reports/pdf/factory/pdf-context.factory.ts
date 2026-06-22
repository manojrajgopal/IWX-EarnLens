import { IncomeReport } from '../../../../core/models/report.model';
import { PdfContext, PdfMeta } from '../models/pdf-context.model';
import { ReportOptions } from '../models/report-options.model';
import { resolveTheme } from '../config/pdf-theme.config';
import { formatDateTime, formatRangeLabel } from '../utils/format/date.format';

/**
 * ─────────────────────────────────────────────────────────────
 *  Context factory — binds data + options + theme + metadata
 * ─────────────────────────────────────────────────────────────
 *  The single place that derives everything a builder might need,
 *  keeping every branch of the tree a pure function of context.
 */
export function createPdfContext(report: IncomeReport, options: ReportOptions): PdfContext {
  const theme = resolveTheme(options.themeId);
  const generatedAt = parseDate(report.generated_at) ?? new Date();

  const meta: PdfMeta = {
    appName: 'IWX EarnLens',
    appTagline: 'Shaping dreams with timeless waves',
    generatedAt,
    generatedLabel: `Issued ${formatDateTime(generatedAt)}`,
    rangeLabel: formatRangeLabel(options.startDate, options.endDate),
    edition: `${theme.name} Edition`,
  };

  return { report, options, theme, meta };
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
