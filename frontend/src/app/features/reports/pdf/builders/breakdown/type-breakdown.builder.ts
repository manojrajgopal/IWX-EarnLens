import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { buildDistributionSection } from './distribution-section.builder';

/**
 * ─────────────────────────────────────────────────────────────
 *  Type composition — a thin leaf over the shared engine
 * ─────────────────────────────────────────────────────────────
 */
export function buildTypeBreakdown(ctx: PdfContext, index: string): Content[] {
  return buildDistributionSection(ctx, {
    index,
    eyebrow: 'How it is earned',
    title: 'Income by type',
    items: ctx.report.by_type,
    emptyHint: 'No typed income in this range.',
  });
}
