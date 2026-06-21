import { Pipe, PipeTransform } from '@angular/core';
import { CURRENCY_SYMBOLS } from '../../core/constants/app.constants';

/** Formats a number as a currency string with grouping and symbol. */
@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'INR', compact = false): string {
    const amount = value ?? 0;
    const symbol = CURRENCY_SYMBOLS[currency] ?? '';
    if (compact && Math.abs(amount) >= 1000) {
      return `${symbol}${this.compact(amount)}`;
    }
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  }

  private compact(value: number): string {
    if (Math.abs(value) >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }
}
