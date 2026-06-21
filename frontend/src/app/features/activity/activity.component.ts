import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivityService } from '../../core/services/activity.service';
import { ActivityLog } from '../../core/models/preferences.model';
import { PaginationMeta } from '../../core/models/api.model';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { HumanizePipe } from '../../shared/pipes/humanize.pipe';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, EmptyStateComponent, TimeAgoPipe, HumanizePipe],
  templateUrl: './activity.component.html',
})
export class ActivityComponent implements OnInit {
  private readonly api = inject(ActivityService);

  readonly loading = signal(true);
  readonly logs = signal<ActivityLog[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly page = signal(1);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list(this.page(), 20).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  icon(action: string): string {
    if (action.includes('create')) return '＋';
    if (action.includes('update')) return '✎';
    if (action.includes('delete')) return '🗑';
    if (action.includes('login')) return '→';
    return '•';
  }
}
