/**
 * ─────────────────────────────────────────────────────────────
 *  Dialog animation timing tokens
 * ─────────────────────────────────────────────────────────────
 *  Centralized so enter/leave choreography stays in sync between
 *  the host (mount/unmount lifecycle) and the panel (CSS keyframes).
 */

export const DIALOG_ANIM = {
  /** Entrance duration (ms) — must match panel enter keyframes. */
  enter: 460,
  /** Exit duration (ms) — host waits this long before unmounting. */
  leave: 300,
  /** Stagger step between internal elements (icon → title → body → actions). */
  stagger: 70,
} as const;
