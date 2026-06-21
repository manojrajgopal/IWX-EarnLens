import { DistributionItem, GraphPoint, TotalsSummary } from './analytics.model';

export interface ReportRow {
  title: string;
  amount: number;
  currency: string;
  income_type: string;
  recurrence: string;
  payment_date: string;
  source_name: string;
  category: string;
  status: string;
}

export interface IncomeReport {
  generated_at: string;
  currency: string;
  totals: TotalsSummary;
  by_category: DistributionItem[];
  by_type: DistributionItem[];
  trend: GraphPoint[];
  rows: ReportRow[];
}
