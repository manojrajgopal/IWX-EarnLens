import { Pipe, PipeTransform } from '@angular/core';

/** Converts snake_case / kebab-case identifiers into Title Case labels. */
@Pipe({ name: 'humanize', standalone: true })
export class HumanizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
