/**
 * ─────────────────────────────────────────────────────────────
 *  Dialog domain models
 * ─────────────────────────────────────────────────────────────
 *  The cinematic, fully-flexible alert/confirm system.
 *  Everything is driven by a `DialogConfig` and resolved through
 *  a promise so callers can `await` a user's decision.
 */

/** Visual + semantic variant. Drives accent color, icon and defaults. */
export type DialogVariant =
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'create'
  | 'update'
  | 'question';

/** Button visual treatment. */
export type DialogButtonStyle = 'solid' | 'ghost' | 'outline';

/** Button semantic tone — maps to a color. */
export type DialogButtonTone =
  | 'neutral'
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning';

/** A single, fully-configurable action button. */
export interface DialogButton {
  /** Value returned to the caller when this button is chosen. */
  id: string;
  label: string;
  style?: DialogButtonStyle;
  tone?: DialogButtonTone;
  /** Render a leading icon (emoji or short text). */
  icon?: string;
  /** Auto-focus this button when the dialog opens. */
  autofocus?: boolean;
  /** Close the dialog after click (default true). */
  closeOnClick?: boolean;
  /** Disable this button (e.g. while a type-to-confirm gate is unmet). */
  gated?: boolean;
}

/** Full dialog configuration. */
export interface DialogConfig {
  variant?: DialogVariant;
  title: string;
  message?: string;
  /** A highlighted entity name woven into the message line. */
  highlight?: string;
  /** Override the variant's default icon (SVG path `d` or emoji). */
  icon?: string;
  /** Custom buttons. When omitted, sensible defaults are derived. */
  buttons?: DialogButton[];
  /** Require the user to type this exact text to enable the primary action. */
  requireText?: string | null;
  /** Allow backdrop click / Escape to dismiss (default true). */
  dismissible?: boolean;
  /** Optional small print shown beneath the message. */
  note?: string;
}

/** A live dialog instance tracked by the service. */
export interface DialogInstance extends DialogConfig {
  id: number;
  buttons: DialogButton[];
  resolve: (chosenId: string | null) => void;
}

/** Convenience options for the `confirm()` helper. */
export interface ConfirmOptions {
  variant?: DialogVariant;
  title: string;
  message?: string;
  highlight?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireText?: string | null;
  icon?: string;
  dismissible?: boolean;
  note?: string;
}

/** Convenience options for the `alert()` helper. */
export interface AlertOptions {
  variant?: DialogVariant;
  title: string;
  message?: string;
  highlight?: string;
  okLabel?: string;
  icon?: string;
  note?: string;
}
