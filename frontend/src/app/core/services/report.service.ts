import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IncomeFilters } from '../models/income.model';
import { IncomeReport } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  generate(filters: IncomeFilters): Observable<IncomeReport> {
    return this.api.get<IncomeReport>('/reports/generate', this.api.toParams({ ...filters }));
  }

  exportCsv(filters: IncomeFilters): Observable<Blob> {
    return this.api.getBlob('/reports/export/csv', this.api.toParams({ ...filters }));
  }

  /** Generate the cinematic PDF server-side and resolve it as a Blob. */
  exportPdf(options: Record<string, unknown>): Observable<Blob> {
    return this.api.postBlob('/reports/export/pdf', options);
  }
}
