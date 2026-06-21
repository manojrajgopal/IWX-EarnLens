import { Component, input } from '@angular/core';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MoneyPipe],
  template: `
    <div class="card card-pad animate-in h-full">
      <div class="flex items-start justify-between">
        <div>
          <p class="field-label !mb-1">{{ label() }}</p>
          <p class="text-2xl font-bold tracking-tight">
            @if (isMoney()) {
              {{ $any(value()) | money: currency() }}
            } @else {
              {{ value() }}
            }
          </p>
        </div>
        <div class="stat-icon" [style.background]="accent() + '1a'" [style.color]="accent()">
          {{ icon() }}
        </div>
      </div>
      @if (hint()) {
        <p class="text-xs text-muted mt-3 flex items-center gap-1.5">
          @if (trend() !== 0) {
            <span [class.text-positive]="trend() > 0" [class.text-negative]="trend() < 0">
              {{ trend() > 0 ? '▲' : '▼' }} {{ absTrend() }}%
            </span>
          }
          {{ hint() }}
        </p>
      }
    </div>
  `,
  styles: [
    `
      .stat-icon {
        width: 2.6rem;
        height: 2.6rem;
        border-radius: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }
    `,
  ],
})
export class StatCardComponent {
  readonly label = input<string>('');
  readonly value = input<number | string>(0);
  readonly icon = input<string>('💰');
  readonly accent = input<string>('#6366f1');
  readonly hint = input<string>('');
  readonly currency = input<string>('INR');
  readonly isMoney = input<boolean>(true);
  readonly trend = input<number>(0);

  absTrend(): number {
    return Math.abs(this.trend());
  }
}
