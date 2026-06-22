import { ReportPageSize } from '../models/report-options.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Page geometry — sizes, margins & safe areas (in PDF points)
 * ─────────────────────────────────────────────────────────────
 */
export interface PageGeometry {
  width: number;
  height: number;
  margin: [number, number, number, number]; // L, T, R, B
}

const A4: PageGeometry = {
  width: 595.28,
  height: 841.89,
  margin: [44, 96, 44, 70],
};

const LETTER: PageGeometry = {
  width: 612,
  height: 792,
  margin: [46, 96, 46, 70],
};

export const PAGE_GEOMETRY: Record<ReportPageSize, PageGeometry> = { A4, LETTER };

/** Usable content width after horizontal margins. */
export function contentWidth(size: ReportPageSize): number {
  const g = PAGE_GEOMETRY[size];
  return g.width - g.margin[0] - g.margin[2];
}

/** pdfmake page-size keyword. */
export function pageSizeKeyword(size: ReportPageSize): 'A4' | 'LETTER' {
  return size;
}
