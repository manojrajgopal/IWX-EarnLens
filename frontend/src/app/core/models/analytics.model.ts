export type GroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ChartStyle = 'line' | 'bar' | 'area' | 'stacked';
export type SplitBy = 'income_type' | 'category_id' | 'source_id' | 'recurrence' | null;

export interface TotalsSummary {
  total: number;
  count: number;
  average: number;
  minimum: number;
  maximum: number;
}

export interface RecurringSplit {
  recurring_total: number;
  recurring_count: number;
  one_time_total: number;
  one_time_count: number;
}

export interface PeriodSummary {
  this_week: number;
  this_month: number;
  this_quarter: number;
  this_year: number;
}

export interface DistributionItem {
  key: string;
  label: string;
  total: number;
  count: number;
  percentage: number;
  color?: string | null;
}

export interface TopSource {
  source_id?: string | null;
  label: string;
  total: number;
  count: number;
}

export interface GrowthMetric {
  current: number;
  previous: number;
  change: number;
  change_percent: number;
}

export interface GraphPoint {
  period: string;
  label: string;
  total: number;
  count: number;
}

export interface GraphSeries {
  key: string;
  label: string;
  color?: string | null;
  points: GraphPoint[];
}

export interface GraphResponse {
  group_by: GroupBy;
  labels: string[];
  series: GraphSeries[];
  totals_by_period: GraphPoint[];
}

export interface DashboardSummary {
  totals: TotalsSummary;
  recurring: RecurringSplit;
  periods: PeriodSummary;
  growth: GrowthMetric;
  by_category: DistributionItem[];
  by_source: DistributionItem[];
  by_type: DistributionItem[];
  top_sources: TopSource[];
  trend: GraphPoint[];
  currency: string;
  generated_at: string;
}
