import { Injectable, signal } from '@angular/core';
import { Toast, ToastKind, ToastOptions } from '../../shared/ui/toast/models/toast.model';
import {
  TOAST_DEFAULT_DURATION,
  TOAST_THEME,
} from '../../shared/ui/toast/config/toast-theme.config';

export type { Toast, ToastKind, ToastOptions } from '../../shared/ui/toast/models/toast.model';

/**
 * Cinematic toast notifications. Public API is backward compatible:
 *   toast.success('Saved!')
 *   toast.error('Failed.', { title: 'Upload error', duration: 6000 })
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  /** Most recent toasts cap to avoid runaway stacks. */
  private readonly MAX_VISIBLE = 4;

  success(message: string, options?: ToastOptions): number {
    return this.push('success', message, options);
  }

  error(message: string, options?: ToastOptions): number {
    return this.push('error', message, options);
  }

  warning(message: string, options?: ToastOptions): number {
    return this.push('warning', message, options);
  }

  info(message: string, options?: ToastOptions): number {
    return this.push('info', message, options);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private push(kind: ToastKind, message: string, options?: ToastOptions): number {
    const id = ++this.counter;
    const toast: Toast = {
      id,
      kind,
      message,
      title: options?.title ?? TOAST_THEME[kind].title,
      duration: options?.duration ?? TOAST_DEFAULT_DURATION,
      createdAt: Date.now(),
    };
    this.toasts.update((list) => {
      const next = [...list, toast];
      return next.length > this.MAX_VISIBLE ? next.slice(next.length - this.MAX_VISIBLE) : next;
    });
    return id;
  }
}
