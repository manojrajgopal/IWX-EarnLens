import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/** Action bar for the detail page: back, edit and delete. */
@Component({
  selector: 'app-detail-actions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="da">
      <a class="btn btn-ghost" routerLink="/app/income">← Back</a>
      <span class="da__spacer"></span>
      <a class="btn btn-secondary" [routerLink]="['/app/income', incomeId(), 'edit']">
        Edit
      </a>
      <button type="button" class="btn btn-danger" (click)="remove.emit()">
        Delete
      </button>
    </div>
  `,
  styleUrl: './detail-actions.component.css',
})
export class DetailActionsComponent {
  readonly incomeId = input.required<string>();
  readonly remove = output<void>();
}
