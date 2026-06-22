import type { TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * ─────────────────────────────────────────────────────────────
 *  PDF engine — the single seam to pdfmake
 * ─────────────────────────────────────────────────────────────
 *  Isolates the only third-party dependency so every other file
 *  in the tree stays pure & framework-agnostic.
 *
 *  pdfmake is a large, non-ESM CommonJS bundle. Evaluating it
 *  eagerly (at import time) pulls a ~2 MB module — and its bundled
 *  globals shim — into the reports route's construction path, which
 *  can stall change detection on this page. We therefore load it
 *  *lazily* via dynamic import the first time an export is requested,
 *  wiring the bundled Roboto VFS exactly once.
 */

interface PdfDocStatic {
  download(fileName?: string): void;
  open(): void;
  getBlob(cb: (blob: Blob) => void): void;
}

interface PdfMakeStatic {
  vfs: unknown;
  createPdf(doc: TDocumentDefinitions): PdfDocStatic;
}

let pdfMakePromise: Promise<PdfMakeStatic> | null = null;

/** Resolve pdfmake on demand, loading the bundle + fonts only once. */
function getPdfMake(): Promise<PdfMakeStatic> {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const [pdfMakeMod, vfsMod] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);
      const pdfMake = (((pdfMakeMod as Record<string, unknown>)['default'] ??
        pdfMakeMod) as unknown) as PdfMakeStatic;
      const vfsExport = ((vfsMod as Record<string, unknown>)['default'] ??
        vfsMod) as Record<string, unknown>;
      // pdfmake 0.3.x ships the vfs map as the export of vfs_fonts.
      pdfMake.vfs = vfsExport['vfs'] ?? vfsExport;
      return pdfMake;
    })();
  }
  return pdfMakePromise;
}

/** Trigger a browser download of the assembled document. */
export async function downloadPdf(doc: TDocumentDefinitions, fileName: string): Promise<void> {
  const pdfMake = await getPdfMake();
  pdfMake.createPdf(doc).download(safeName(fileName));
}

/** Open the assembled document in a new tab (preview). */
export async function openPdf(doc: TDocumentDefinitions): Promise<void> {
  const pdfMake = await getPdfMake();
  pdfMake.createPdf(doc).open();
}

/** Resolve the document to a Blob (for custom handling). */
export async function pdfToBlob(doc: TDocumentDefinitions): Promise<Blob> {
  const pdfMake = await getPdfMake();
  return new Promise<Blob>((resolve) => {
    pdfMake.createPdf(doc).getBlob((blob: Blob) => resolve(blob));
  });
}

function safeName(name: string): string {
  const base = (name || 'earnlens-report').replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-');
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}
