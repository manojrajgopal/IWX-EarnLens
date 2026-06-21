import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center" [style.min-height]="height()">
      <div class="el-spinner"></div>
    </div>
  `,
  styles: [
    `
      .el-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--border-color);
        border-top-color: var(--accent);
        border-radius: 999px;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {
  readonly height = input<string>('160px');
}
