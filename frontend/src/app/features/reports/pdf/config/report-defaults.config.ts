import { ReportOptions } from '../models/report-options.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Default options factory
 * ─────────────────────────────────────────────────────────────
 *  Produces a fully-populated ReportOptions so the dialog always
 *  opens pre-filled with sensible cinematic defaults.
 */
export function defaultReportOptions(overrides: Partial<ReportOptions> = {}): ReportOptions {
  return {
    title: 'Income Intelligence Report',
    subtitle: 'A cinematic ledger of your earnings',
    preparedFor: '',
    startDate: null,
    endDate: null,
    themeId: 'midnight',
    pageSize: 'A4',
    density: 'comfortable',
    includeLogo: true,
    includeCoverNote: false,
    coverNote: '',
    sections: {
      cover: true,
      summary: true,
      categories: true,
      types: true,
      trend: true,
      ledger: true,
    },
    ledgerLimit: 0,
    fileName: 'earnlens-report',
    ...overrides,
  };
}
