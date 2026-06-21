/**
 * Toast domain models.
 * The public surface kept backward-compatible: kind + message,
 * extended with optional title, custom duration and timestamps.
 */

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
  /** Auto-dismiss duration in ms. 0 = sticky (never auto-dismiss). */
  duration: number;
  createdAt: number;
}

export interface ToastOptions {
  /** Override the default heading for the toast kind. */
  title?: string;
  /** Auto-dismiss duration in ms. Pass 0 to keep it sticky. */
  duration?: number;
}
