import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { PAGE_GEOMETRY } from '../../config/pdf-page.config';
import { buildCoverBackdrop, buildContentBackdrop } from '../../assets/backgrounds/cinematic-backdrop.asset';

/**
 * ─────────────────────────────────────────────────────────────
 *  Page background factory
 * ─────────────────────────────────────────────────────────────
 *  Page 1 (when a cover is requested) gets the dramatic cover
 *  backdrop; every other page gets the subtle paper backdrop.
 */
export function createBackground(ctx: PdfContext): (currentPage: number) => Content {
  const g = PAGE_GEOMETRY[ctx.options.pageSize];
  const coverOn = ctx.options.sections.cover;
  return (currentPage: number): Content => {
    if (coverOn && currentPage === 1) {
      return { svg: buildCoverBackdrop(ctx.theme.palette, g.width, g.height), width: g.width, height: g.height };
    }
    return { svg: buildContentBackdrop(ctx.theme.palette, g.width, g.height), width: g.width, height: g.height };
  };
}
