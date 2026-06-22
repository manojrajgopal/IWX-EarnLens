import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { buildDistributionSection } from './distribution-section.builder';

/**
 * ─────────────────────────────────────────────────────────────
 *  Category breakdown — a thin leaf over the shared engine
 * ─────────────────────────────────────────────────────────────
 */
export function buildCategoryBreakdown(ctx: PdfContext, index: string): Content[] {
  return buildDistributionSection(ctx, {
    index,
    eyebrow: 'Where it comes from',
    title: 'Income by category',
    items: ctx.report.by_category,
    emptyHint: 'No categorised income in this range.',
  });
}
