import { Injectable } from '@angular/core';
import { IncomeReport } from '../../../core/models/report.model';
import { ReportOptions } from './models/report-options.model';
import { createPdfContext } from './factory/pdf-context.factory';
import { buildDocument } from './builders/document/document.builder';
import { downloadPdf, openPdf, pdfToBlob } from './utils/engine/pdf-engine';

/**
 * ═════════════════════════════════════════════════════════════
 *  PdfReportFacade — the trunk of the report tree
 * ═════════════════════════════════════════════════════════════
 *  Every leaf (primitive), branch (builder) and root (config /
 *  assets / utils) connects here. Callers touch nothing else:
 *
 *      facade.download(report, options);
 *
 *  Resolves the context, assembles the cinematic document and
 *  hands it to the engine.
 */
@Injectable({ providedIn: 'root' })
export class PdfReportFacade {
  /** Build + trigger a browser download of the cinematic PDF. */
  async download(report: IncomeReport, options: ReportOptions): Promise<void> {
    const doc = buildDocument(createPdfContext(report, options));
    await downloadPdf(doc, options.fileName);
  }

  /** Build + open the PDF in a new tab (preview). */
  async preview(report: IncomeReport, options: ReportOptions): Promise<void> {
    const doc = buildDocument(createPdfContext(report, options));
    await openPdf(doc);
  }

  /** Build + resolve the PDF as a Blob for custom handling. */
  toBlob(report: IncomeReport, options: ReportOptions): Promise<Blob> {
    const doc = buildDocument(createPdfContext(report, options));
    return pdfToBlob(doc);
  }
}
