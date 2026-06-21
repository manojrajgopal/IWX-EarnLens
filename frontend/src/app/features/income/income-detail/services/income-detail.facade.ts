import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { PaginationMeta } from '../../../../core/models/api.model';
import { Income, SeriesSummary } from '../../../../core/models/income.model';
import { CategoryService } from '../../../../core/services/category.service';
import { IncomeService } from '../../../../core/services/income.service';
import { SourceService } from '../../../../core/services/source.service';
import { TagService } from '../../../../core/services/tag.service';
import { DetailSection } from '../models/detail-field.model';
import { DetailLookups, EMPTY_LOOKUPS } from '../models/detail-lookups.model';
import { belongsToSeries, isSeriesParent } from '../utils/income-classify.util';
import { buildDetailSections } from '../utils/detail-sections.util';

const OCCURRENCES_PAGE_SIZE = 12;

function toMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/**
 * Orchestrates everything the income detail page needs: the income itself,
 * the name lookups used to resolve foreign keys, the series roll-up, and the
 * paginated list of occurrences. Provided per-instance by the detail page so
 * its state resets cleanly on every navigation.
 */
@Injectable()
export class IncomeDetailFacade {
  private readonly incomeApi = inject(IncomeService);
  private readonly categoryApi = inject(CategoryService);
  private readonly sourceApi = inject(SourceService);
  private readonly tagApi = inject(TagService);

  // ─── Primary income ───
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly income = signal<Income | null>(null);
  readonly lookups = signal<DetailLookups>(EMPTY_LOOKUPS);

  // ─── Series roll-up ───
  readonly summary = signal<SeriesSummary | null>(null);

  // ─── Occurrences ───
  readonly occurrences = signal<Income[]>([]);
  readonly occLoading = signal(false);
  readonly occMeta = signal<PaginationMeta | null>(null);
  readonly occPage = signal(1);

  // ─── Derived view state ───
  readonly sections = computed<DetailSection[]>(() => {
    const income = this.income();
    return income ? buildDetailSections(income, this.lookups()) : [];
  });

  readonly isParent = computed(() => {
    const income = this.income();
    return income ? isSeriesParent(income) : false;
  });

  readonly hasSeries = computed(() => {
    const income = this.income();
    return income ? belongsToSeries(income) : false;
  });

  load(id: string): void {
    this.reset();
    forkJoin({
      income: this.incomeApi.get(id),
      categories: this.categoryApi.list(),
      sources: this.sourceApi.list(),
      tags: this.tagApi.list(),
    }).subscribe({
      next: ({ income, categories, sources, tags }) => {
        this.income.set(income);
        this.lookups.set({
          categories: toMap(categories),
          sources: toMap(sources),
          tags: toMap(tags),
        });
        this.loading.set(false);
        if (belongsToSeries(income)) {
          this.loadSummary(id);
          this.loadOccurrences(id, 1);
        }
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  loadOccurrences(id: string, page: number): void {
    this.occLoading.set(true);
    this.occPage.set(page);
    this.incomeApi.occurrences(id, page, OCCURRENCES_PAGE_SIZE).subscribe({
      next: (res) => {
        this.occurrences.set(res.data);
        this.occMeta.set(res.meta);
        this.occLoading.set(false);
      },
      error: () => this.occLoading.set(false),
    });
  }

  private loadSummary(id: string): void {
    this.incomeApi.seriesSummary(id).subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => this.summary.set(null),
    });
  }

  private reset(): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.income.set(null);
    this.summary.set(null);
    this.occurrences.set([]);
    this.occMeta.set(null);
    this.occPage.set(1);
  }
}
