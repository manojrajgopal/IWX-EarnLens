import { Component, input, output } from '@angular/core';

import { PaginationMeta } from '../../../../../core/models/api.model';
import { Income } from '../../../../../core/models/income.model';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { OccurrenceRowComponent } from '../occurrence-row/occurrence-row.component';

/** Paginated list of every occurrence that belongs to a series. */
@Component({
  selector: 'app-occurrence-list',
  standalone: true,
  imports: [
    SpinnerComponent,
    EmptyStateComponent,
    PaginationComponent,
    OccurrenceRowComponent,
  ],
  templateUrl: './occurrence-list.component.html',
  styleUrl: './occurrence-list.component.css',
})
export class OccurrenceListComponent {
  readonly occurrences = input.required<Income[]>();
  readonly loading = input(false);
  readonly meta = input<PaginationMeta | null>(null);
  readonly page = input(1);
  /** Id of the income currently being viewed, highlighted in the list. */
  readonly currentId = input<string | null>(null);

  readonly pageChange = output<number>();
}
