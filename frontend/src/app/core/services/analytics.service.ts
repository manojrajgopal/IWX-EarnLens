import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardSummary, DistributionItem, GraphResponse, GroupBy, SplitBy } from '../models/analytics.model';
import { IncomeFilters } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiService);

  dashboard(filters: IncomeFilters): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/analytics/dashboard', this.api.toParams({ ...filters }));
  }

  graph(filters: IncomeFilters, groupBy: GroupBy, splitBy: SplitBy): Observable<GraphResponse> {
    const params = this.api.toParams({ ...filters, group_by: groupBy, split_by: splitBy ?? '' });
    return this.api.get<GraphResponse>('/analytics/graph', params);
  }

  distribution(filters: IncomeFilters, by: 'category' | 'source' | 'type'): Observable<DistributionItem[]> {
    return this.api.get<DistributionItem[]>(
      '/analytics/distribution',
      this.api.toParams({ ...filters, by }),
    );
  }
}
