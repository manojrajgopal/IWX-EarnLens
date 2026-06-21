import { Pipe, PipeTransform } from '@angular/core';

/** Renders a human-friendly relative time (e.g. "3 days ago"). */
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const units: [number, string][] = [
      [31536000, 'year'],
      [2592000, 'month'],
      [604800, 'week'],
      [86400, 'day'],
      [3600, 'hour'],
      [60, 'minute'],
    ];

    for (const [secs, label] of units) {
      const interval = Math.floor(seconds / secs);
      if (interval >= 1) {
        return `${interval} ${label}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }
}
