import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * ─────────────────────────────────────────────────────────────
 *  PDF engine — the single seam to pdfmake
 * ─────────────────────────────────────────────────────────────
 *  Isolates the only third-party dependency so every other file
 *  in the tree stays pure & framework-agnostic. Wires the bundled
 *  Roboto VFS exactly once, lazily.
 */
let vfsReady = false;

function ensureFonts(): void {
  if (vfsReady) return;
  // pdfmake 0.3.x ships the vfs map as the default export of vfs_fonts.
  (pdfMake as unknown as { vfs: unknown }).vfs = pdfFonts as unknown;
  vfsReady = true;
}

/** Trigger a browser download of the assembled document. */
export function downloadPdf(doc: TDocumentDefinitions, fileName: string): void {
  ensureFonts();
  pdfMake.createPdf(doc).download(safeName(fileName));
}

/** Open the assembled document in a new tab (preview). */
export function openPdf(doc: TDocumentDefinitions): void {
  ensureFonts();
  pdfMake.createPdf(doc).open();
}

/** Resolve the document to a Blob (for custom handling). */
export function pdfToBlob(doc: TDocumentDefinitions): Promise<Blob> {
  ensureFonts();
  return new Promise<Blob>((resolve) => {
    (pdfMake.createPdf(doc) as unknown as { getBlob: (cb: (blob: Blob) => void) => void }).getBlob(
      (blob: Blob) => resolve(blob),
    );
  });
}

function safeName(name: string): string {
  const base = (name || 'earnlens-report').replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-');
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}
