import type { Content } from 'pdfmake/interfaces';
import { DistributionItem } from '../../../../../core/models/analytics.model';
import { PdfContext } from '../../models/pdf-context.model';
import { contentWidth } from '../../config/pdf-page.config';
import { sectionHeading } from '../../primitives/section-heading/section-heading.primitive';
import { donutChart } from '../../primitives/donut-chart/donut-chart.primitive';
import { distributionRow } from '../../primitives/distribution-bar/distribution-bar.primitive';
import { formatMoney } from '../../utils/format/money.format';
import { formatInt } from '../../utils/format/number.format';
import { seriesColor } from '../../utils/color/color.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Distribution section — donut + ranked share bars
 * ─────────────────────────────────────────────────────────────
 *  Shared engine behind both the category and type breakdowns so
 *  the two leaf builders stay one-liners.
 */
export interface DistributionSectionConfig {
  index: string;
  eyebrow: string;
  title: string;
  items: DistributionItem[];
  emptyHint: string;
  maxRows?: number;
}

export function buildDistributionSection(ctx: PdfContext, cfg: DistributionSectionConfig): Content[] {
  const p = ctx.theme.palette;
  const cw = contentWidth(ctx.options.pageSize);
  const cur = ctx.report.currency;
  const heading = sectionHeading({ index: cfg.index, eyebrow: cfg.eyebrow, title: cfg.title, subtitle: `${cfg.items.length} groups`, palette: p, width: cw });

  if (!cfg.items.length) {
    return [heading, emptyNote(ctx, cw, cfg.emptyHint)];
  }

  const sorted = [...cfg.items].sort((a, b) => b.total - a.total);
  const limit = cfg.maxRows ?? 8;
  const shown = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  const restTotal = rest.reduce((s, i) => s + i.total, 0);
  const restCount = rest.reduce((s, i) => s + i.count, 0);
  const grandTotal = sorted.reduce((s, i) => s + i.total, 0);

  const donutSlices = shown.map((item, i) => ({
    label: item.label,
    value: item.total,
    color: item.color || seriesColor(ctx.theme.series, i),
  }));
  if (restTotal > 0) {
    donutSlices.push({ label: 'Other', value: restTotal, color: p.inkFaint });
  }

  const donut = donutChart({
    slices: donutSlices,
    centerTop: 'Total',
    centerValue: formatMoney(grandTotal, cur),
    palette: p,
    size: 150,
  });

  const rows: Content[] = shown.map((item, i) => {
    const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;
    return distributionRow({
      rank: i,
      label: item.label,
      amountLabel: formatMoney(item.total, cur),
      countLabel: `${formatInt(item.count)} entries`,
      percentage: pct,
      color: item.color || seriesColor(ctx.theme.series, i),
      palette: p,
      width: cw - 174,
    });
  });
  if (restTotal > 0) {
    rows.push(
      distributionRow({
        rank: 99,
        label: `Other (${rest.length})`,
        amountLabel: formatMoney(restTotal, cur),
        countLabel: `${formatInt(restCount)} entries`,
        percentage: grandTotal > 0 ? (restTotal / grandTotal) * 100 : 0,
        color: p.inkFaint,
        palette: p,
        width: cw - 174,
      }),
    );
  }

  return [
    heading,
    {
      columns: [
        { width: 150, stack: [donut], margin: [0, 6, 0, 0] },
        { width: 'auto', stack: rows, margin: [10, 0, 0, 0] },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 6],
    },
  ];
}

function emptyNote(ctx: PdfContext, w: number, hint: string): Content {
  const p = ctx.theme.palette;
  return {
    table: { widths: ['*'], body: [[{ text: hint, italics: true, color: p.inkFaint, fontSize: 10, margin: [14, 16, 14, 16], fillColor: p.panel, border: [false, false, false, false] }]] },
    layout: 'noBorders',
    margin: [0, 0, 0, 6],
  };
}
