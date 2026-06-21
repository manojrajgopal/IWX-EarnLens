import { ToastKind } from '../models/toast.model';

/**
 * Per-kind visual theme: accent color, default heading and the SVG
 * path used to draw the icon. Centralized so all toast visuals stay
 * consistent and easy to tweak.
 */
export interface ToastTheme {
  /** Default heading when no custom title is provided. */
  title: string;
  /** Accent color CSS value (drives glow, ring, progress, border). */
  accent: string;
  /** Soft tint used for the icon halo. */
  glow: string;
  /** SVG path(s) for the icon glyph (24×24 viewBox, stroke-based). */
  icon: string;
}

export const TOAST_THEME: Record<ToastKind, ToastTheme> = {
  success: {
    title: 'Success',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    icon: 'M20 6L9 17l-5-5',
  },
  error: {
    title: 'Something went wrong',
    accent: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.45)',
    icon: 'M18 6L6 18M6 6l12 12',
  },
  warning: {
    title: 'Heads up',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    icon: 'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  },
  info: {
    title: 'Good to know',
    accent: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.45)',
    icon: 'M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  },
};

/** Default auto-dismiss duration in milliseconds. */
export const TOAST_DEFAULT_DURATION = 4600;
