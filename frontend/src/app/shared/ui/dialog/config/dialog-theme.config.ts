import { DialogButton, DialogVariant } from '../models/dialog.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Per-variant cinematic theme
 * ─────────────────────────────────────────────────────────────
 *  Each variant carries its accent palette, ambient glow, an
 *  animated Lucide-style icon path and sensible text defaults.
 */
export interface DialogTheme {
  /** Primary accent (rings, glow, solid buttons). */
  accent: string;
  /** Soft translucent accent for the icon halo. */
  halo: string;
  /** Ambient glow color used behind the panel. */
  glow: string;
  /** Lucide-style 24×24 stroke path data for the icon. */
  iconPath: string;
  /** Default heading when none supplied. */
  title: string;
  /** Default confirm label. */
  confirm: string;
}

export const DIALOG_THEME: Record<DialogVariant, DialogTheme> = {
  danger: {
    accent: '#ef4444',
    halo: 'rgba(239, 68, 68, 0.14)',
    glow: 'rgba(239, 68, 68, 0.35)',
    iconPath:
      'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
    title: 'Delete item?',
    confirm: 'Delete',
  },
  warning: {
    accent: '#f59e0b',
    halo: 'rgba(245, 158, 11, 0.14)',
    glow: 'rgba(245, 158, 11, 0.35)',
    iconPath:
      'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    title: 'Are you sure?',
    confirm: 'Proceed',
  },
  success: {
    accent: '#22c55e',
    halo: 'rgba(34, 197, 94, 0.14)',
    glow: 'rgba(34, 197, 94, 0.35)',
    iconPath: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
    title: 'Success',
    confirm: 'Great',
  },
  info: {
    accent: '#3b82f6',
    halo: 'rgba(59, 130, 246, 0.14)',
    glow: 'rgba(59, 130, 246, 0.35)',
    iconPath: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
    title: 'Heads up',
    confirm: 'Got it',
  },
  create: {
    accent: '#10b981',
    halo: 'rgba(16, 185, 129, 0.14)',
    glow: 'rgba(16, 185, 129, 0.35)',
    iconPath: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v8M8 12h8',
    title: 'Create new',
    confirm: 'Create',
  },
  update: {
    accent: '#6366f1',
    halo: 'rgba(99, 102, 241, 0.14)',
    glow: 'rgba(99, 102, 241, 0.35)',
    iconPath:
      'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
    title: 'Save changes?',
    confirm: 'Save',
  },
  question: {
    accent: '#8b5cf6',
    halo: 'rgba(139, 92, 246, 0.14)',
    glow: 'rgba(139, 92, 246, 0.35)',
    iconPath:
      'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
    title: 'Confirm',
    confirm: 'Confirm',
  },
};

/** Map a variant to the tone its primary button should use. */
export function primaryToneFor(variant: DialogVariant): DialogButton['tone'] {
  switch (variant) {
    case 'danger':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'success':
    case 'create':
      return 'success';
    default:
      return 'primary';
  }
}
