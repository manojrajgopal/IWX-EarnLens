import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { PAGE_GEOMETRY, contentWidth } from '../../config/pdf-page.config';
import { buildLogoSvg } from '../../assets/logo/iwx-logo.asset';
import { pillSvg } from '../../primitives/pill/pill.primitive';
import { escapeSvgText } from '../../utils/svg/svg.util';
import { formatMoney } from '../../utils/format/money.format';
import { formatInt } from '../../utils/format/number.format';
import { lighten, rgba } from '../../utils/color/color.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Cover page builder — the opening title sequence
 * ─────────────────────────────────────────────────────────────
 */
export function buildCover(ctx: PdfContext): Content[] {
  const p = ctx.theme.palette;
  const cw = contentWidth(ctx.options.pageSize);
  const g = PAGE_GEOMETRY[ctx.options.pageSize];
  const out: Content[] = [];

  // ── seal ──────────────────────────────────────────────
  if (ctx.options.includeLogo) {
    const logo = buildLogoSvg({
      discFrom: lighten(p.coverMid, 0.06),
      discTo: p.coverFrom,
      ring: p.coverGlow,
      text: p.onCoverSoft,
      wave: p.coverGlow,
      mark: p.onCover,
    });
    out.push({
      columns: [{ width: '*', text: '' }, { svg: logo, width: 132 }, { width: '*', text: '' }],
      margin: [0, 36, 0, 22],
    });
  } else {
    out.push({ text: '', margin: [0, 70, 0, 0] });
  }

  // ── edition pill ──────────────────────────────────────
  out.push(centerSvg(pillSvg({
    text: ctx.meta.edition,
    fill: rgba(p.onCover, 0.12),
    textColor: p.onCover,
    border: rgba(p.coverGlow, 0.6),
    width: 188,
    height: 22,
  }), 188, [0, 0, 0, 18]));

  // ── title ─────────────────────────────────────────────
  out.push({
    text: ctx.options.title,
    font: undefined,
    fontSize: 34,
    bold: true,
    color: p.onCover,
    alignment: 'center',
    lineHeight: 1.04,
    margin: [24, 0, 24, 8],
    characterSpacing: 0.5,
  } as Content);

  out.push({
    text: ctx.options.subtitle,
    fontSize: 12,
    color: p.onCoverSoft,
    alignment: 'center',
    italics: true,
    margin: [40, 0, 40, 18],
  });

  // ── glowing divider ───────────────────────────────────
  out.push(coverDivider(p, cw));

  // ── headline total ────────────────────────────────────
  out.push({
    text: 'TOTAL INCOME CAPTURED',
    fontSize: 8.5,
    color: p.onCoverSoft,
    alignment: 'center',
    characterSpacing: 3,
    margin: [0, 20, 0, 4],
  });
  out.push({
    text: formatMoney(ctx.report.totals.total, ctx.report.currency),
    fontSize: 30,
    bold: true,
    color: p.onCover,
    alignment: 'center',
    margin: [0, 0, 0, 6],
  });
  out.push({
    text: `${formatInt(ctx.report.totals.count)} entries · ${ctx.meta.rangeLabel}`,
    fontSize: 9.5,
    color: p.onCoverSoft,
    alignment: 'center',
    margin: [0, 0, 0, 26],
  });

  // ── meta plate ────────────────────────────────────────
  out.push(metaPlate(ctx, cw));

  // ── optional note ─────────────────────────────────────
  if (ctx.options.includeCoverNote && ctx.options.coverNote.trim()) {
    out.push(noteCard(ctx, cw));
  }

  // push everything toward vertical centre with a tail spacer
  out.push({ text: '', margin: [0, 0, 0, g.height * 0.02] });
  return out;
}

function centerSvg(svg: string, width: number, margin: [number, number, number, number]): Content {
  return { columns: [{ width: '*', text: '' }, { svg, width }, { width: '*', text: '' }], margin };
}

function coverDivider(p: PdfContext['theme']['palette'], w: number): Content {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="10" viewBox="0 0 ${w} 10">
  <defs>
    <linearGradient id="cvDiv" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.coverGlow}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${p.coverGlow}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${p.coverGlow}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="4.5" width="${w}" height="1" fill="url(#cvDiv)"/>
  <circle cx="${w / 2}" cy="5" r="3" fill="${p.coverGlow}"/>
</svg>`.trim();
  return { svg, width: w };
}

function metaPlate(ctx: PdfContext, w: number): Content {
  const p = ctx.theme.palette;
  const h = 64;
  const col = w / 3;
  const cell = (x: number, label: string, value: string) => `
    <text x="${x + col / 2}" y="24" fill="${p.onCoverSoft}" font-family="Helvetica, Arial, sans-serif" font-size="7.5" letter-spacing="2" text-anchor="middle">${escapeSvgText(label)}</text>
    <text x="${x + col / 2}" y="42" fill="${p.onCover}" font-family="Georgia, serif" font-size="12" font-weight="700" text-anchor="middle">${escapeSvgText(value)}</text>`;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${rgba(p.onCover, 0.06)}" stroke="${rgba(p.onCover, 0.18)}"/>
  <line x1="${col}" y1="14" x2="${col}" y2="${h - 14}" stroke="${rgba(p.onCover, 0.16)}"/>
  <line x1="${col * 2}" y1="14" x2="${col * 2}" y2="${h - 14}" stroke="${rgba(p.onCover, 0.16)}"/>
  ${cell(0, 'PREPARED FOR', ctx.options.preparedFor || '—')}
  ${cell(col, 'COVERAGE', ctx.meta.rangeLabel)}
  ${cell(col * 2, 'ISSUED', ctx.meta.generatedLabel)}
</svg>`.trim();
  return { svg, width: w, margin: [0, 0, 0, 16] };
}

function noteCard(ctx: PdfContext, w: number): Content {
  const p = ctx.theme.palette;
  return {
    margin: [0, 4, 0, 0],
    table: {
      widths: ['*'],
      body: [[
        {
          stack: [
            { text: 'A NOTE', fontSize: 7.5, characterSpacing: 2.5, color: p.coverGlow, margin: [0, 0, 0, 4] },
            { text: ctx.options.coverNote.trim(), fontSize: 10, color: p.onCoverSoft, italics: true, lineHeight: 1.3 },
          ],
          fillColor: rgba(p.onCover, 0.05),
          border: [false, false, false, false],
          margin: [14, 12, 14, 12],
        },
      ]],
    },
    layout: 'noBorders',
  };
}
