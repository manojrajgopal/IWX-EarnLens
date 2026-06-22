import type { Content, TableCell, CustomTableLayout } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { contentWidth } from '../../config/pdf-page.config';
import { sectionHeading } from '../../primitives/section-heading/section-heading.primitive';
import { formatMoney } from '../../utils/format/money.format';
import { formatMediumDate } from '../../utils/format/date.format';
import { formatInt } from '../../utils/format/number.format';

/**
 * ─────────────────────────────────────────────────────────────
 *  Ledger builder — the detailed, itemised entries table
 * ─────────────────────────────────────────────────────────────
 */
export function buildLedger(ctx: PdfContext, index: string): Content[] {
  const p = ctx.theme.palette;
  const cw = contentWidth(ctx.options.pageSize);
  const rows = ctx.report.rows ?? [];
  const limit = ctx.options.ledgerLimit > 0 ? ctx.options.ledgerLimit : rows.length;
  const shown = rows.slice(0, limit);
  const hidden = rows.length - shown.length;
  const pad = ctx.options.density === 'compact' ? 4 : 7;

  const heading = sectionHeading({
    index,
    eyebrow: 'Every entry',
    title: 'Detailed ledger',
    subtitle: `${formatInt(shown.length)} of ${formatInt(rows.length)} shown`,
    palette: p,
    width: cw,
  });

  if (!rows.length) {
    return [heading, { text: 'No entries to itemise for this range.', italics: true, color: p.inkFaint, fontSize: 10, margin: [0, 4, 0, 6] }];
  }

  const header: TableCell[] = ['#', 'Title', 'Type', 'Category', 'Source', 'Date', 'Amount'].map(
    (label, i) => ({
      text: label,
      style: 'ledgerHead',
      alignment: i === 6 ? 'right' : i === 0 ? 'center' : 'left',
    }),
  );

  const body: TableCell[][] = [header];
  shown.forEach((row, i) => {
    body.push([
      { text: String(i + 1), alignment: 'center', color: p.inkFaint, fontSize: 8 },
      { text: row.title || '—', bold: true, color: p.ink, fontSize: 8.5 },
      { text: humanize(row.income_type), color: p.inkSoft, fontSize: 8 },
      { text: row.category || '—', color: p.inkSoft, fontSize: 8 },
      { text: row.source_name || '—', color: p.inkSoft, fontSize: 8 },
      { text: formatMediumDate(row.payment_date), color: p.inkSoft, fontSize: 8, noWrap: true },
      { text: formatMoney(row.amount, row.currency || ctx.report.currency), alignment: 'right', bold: true, color: p.ink, fontSize: 8.5, noWrap: true },
    ]);
  });

  const shownTotal = shown.reduce((s, r) => s + r.amount, 0);
  body.push([
    { text: '', border: [false, false, false, false] },
    { text: 'TOTAL (shown)', colSpan: 5, color: p.inkFaint, fontSize: 8, characterSpacing: 1, bold: true, alignment: 'right', margin: [0, 2, 0, 0] },
    {}, {}, {}, {},
    { text: formatMoney(shownTotal, ctx.report.currency), alignment: 'right', bold: true, color: p.accent, fontSize: 9.5 },
  ]);

  const table: Content = {
    table: {
      headerRows: 1,
      widths: [16, '*', 50, 60, 60, 52, 64],
      body,
    },
    layout: ledgerLayout(ctx, pad),
    margin: [0, 0, 0, 6],
  };

  const out: Content[] = [heading, table];
  if (hidden > 0) {
    out.push({
      text: `+ ${formatInt(hidden)} more entries not shown (raise the ledger limit to include them).`,
      italics: true,
      color: p.inkFaint,
      fontSize: 8.5,
      margin: [0, 6, 0, 0],
    });
  }
  return out;
}

function ledgerLayout(ctx: PdfContext, pad: number): CustomTableLayout {
  const p = ctx.theme.palette;
  return {
    hLineWidth: (i, node) => (i === 0 || i === 1 || i === (node.table.body?.length ?? 0) ? 0 : 0.6),
    vLineWidth: () => 0,
    hLineColor: () => p.line,
    fillColor: (rowIndex) => {
      if (rowIndex === 0) return p.ink;
      const last = false;
      return rowIndex % 2 === 0 ? p.panel : null;
    },
    paddingTop: () => pad,
    paddingBottom: () => pad,
    paddingLeft: () => 6,
    paddingRight: () => 6,
  };
}

function humanize(value: string): string {
  return (value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
