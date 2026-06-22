import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { PAGE_GEOMETRY } from '../../config/pdf-page.config';
import { createBackground } from '../chrome/page-background.builder';
import { createHeader } from '../chrome/page-header.builder';
import { createFooter } from '../chrome/page-footer.builder';
import { buildCover } from '../cover/cover-page.builder';
import { buildSummary } from '../summary/summary-section.builder';
import { buildCategoryBreakdown } from '../breakdown/category-breakdown.builder';
import { buildTypeBreakdown } from '../breakdown/type-breakdown.builder';
import { buildTrend } from '../trend/trend-section.builder';
import { buildLedger } from '../ledger/ledger-table.builder';

/**
 * ─────────────────────────────────────────────────────────────
 *  Document builder — the trunk that joins every branch
 * ─────────────────────────────────────────────────────────────
 *  Reads the toggles, numbers the chapters, lays out the page
 *  chrome and returns a finished pdfmake document definition.
 */
export function buildDocument(ctx: PdfContext): TDocumentDefinitions {
  const g = PAGE_GEOMETRY[ctx.options.pageSize];
  const p = ctx.theme.palette;
  const content: Content[] = [];

  if (ctx.options.sections.cover) {
    content.push(...buildCover(ctx));
  }

  // Ordered chapters with live numbering.
  const chapters: Array<() => Content[]> = [];
  let n = 0;
  const idx = () => String(++n).padStart(2, '0');

  if (ctx.options.sections.summary) chapters.push(() => buildSummary(ctx, idx()));
  if (ctx.options.sections.categories) chapters.push(() => buildCategoryBreakdown(ctx, idx()));
  if (ctx.options.sections.types) chapters.push(() => buildTypeBreakdown(ctx, idx()));
  if (ctx.options.sections.trend) chapters.push(() => buildTrend(ctx, idx()));
  if (ctx.options.sections.ledger) chapters.push(() => buildLedger(ctx, idx()));

  const coverPresent = ctx.options.sections.cover;
  chapters.forEach((make, i) => {
    const group = make();
    if (!group.length) return;
    const breakBefore = coverPresent || i > 0;
    if (breakBefore) {
      (group[0] as unknown as Record<string, unknown>)['pageBreak'] = 'before';
    }
    content.push(...group, { text: '', margin: [0, 6, 0, 0] });
  });

  return {
    pageSize: ctx.options.pageSize,
    pageMargins: g.margin,
    background: createBackground(ctx),
    header: createHeader(ctx),
    footer: createFooter(ctx),
    info: {
      title: ctx.options.title,
      author: 'IWX EarnLens',
      subject: ctx.options.subtitle,
      keywords: 'income, report, earnlens, iwx',
      creator: 'IWX EarnLens',
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: p.ink,
      lineHeight: 1.2,
    },
    styles: {
      ledgerHead: {
        color: '#ffffff',
        bold: true,
        fontSize: 8,
        characterSpacing: 0.4,
      },
    },
    content,
  };
}
