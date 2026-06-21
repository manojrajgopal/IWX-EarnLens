import { Injectable, signal } from '@angular/core';
import {
  AlertOptions,
  ConfirmOptions,
  DialogButton,
  DialogConfig,
  DialogInstance,
  DialogVariant,
} from '../models/dialog.model';
import { DIALOG_THEME, primaryToneFor } from '../config/dialog-theme.config';
import { nextDialogId } from '../utils/dialog-id.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  DialogService — the cinematic alert / confirm engine
 * ─────────────────────────────────────────────────────────────
 *  Promise-based so callers can simply:
 *
 *    const ok = await dialog.confirm({
 *      variant: 'danger',
 *      title: 'Delete tag?',
 *      highlight: 'Marketing',
 *      confirmLabel: 'Delete',
 *    });
 *    if (!ok) return;
 *
 *  Or full control:
 *
 *    const choice = await dialog.open({ title, buttons: [...] });
 *
 *  Dialogs queue automatically — only one is shown at a time.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  /** Currently visible dialog (null when nothing is open). */
  readonly active = signal<DialogInstance | null>(null);

  /** Pending dialogs waiting for the current one to close. */
  private readonly queue: DialogInstance[] = [];

  /* ── Low-level: full configuration, returns chosen button id ── */
  open(config: DialogConfig): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const variant = config.variant ?? 'question';
      const instance: DialogInstance = {
        ...config,
        id: nextDialogId(),
        variant,
        dismissible: config.dismissible ?? true,
        buttons: this.resolveButtons(config, variant),
        resolve,
      };

      if (this.active()) {
        this.queue.push(instance);
      } else {
        this.active.set(instance);
      }
    });
  }

  /* ── Confirm: two-button, resolves boolean ── */
  async confirm(opts: ConfirmOptions): Promise<boolean> {
    const variant = opts.variant ?? 'question';
    const theme = DIALOG_THEME[variant];
    const choice = await this.open({
      variant,
      title: opts.title,
      message: opts.message,
      highlight: opts.highlight,
      icon: opts.icon,
      note: opts.note,
      requireText: opts.requireText ?? null,
      dismissible: opts.dismissible ?? true,
      buttons: [
        {
          id: 'cancel',
          label: opts.cancelLabel ?? 'Cancel',
          style: 'ghost',
          tone: 'neutral',
        },
        {
          id: 'confirm',
          label: opts.confirmLabel ?? theme.confirm,
          style: 'solid',
          tone: primaryToneFor(variant),
          autofocus: true,
          gated: !!opts.requireText,
        },
      ],
    });
    return choice === 'confirm';
  }

  /* ── Alert: single acknowledge button ── */
  async alert(opts: AlertOptions): Promise<void> {
    const variant = opts.variant ?? 'info';
    const theme = DIALOG_THEME[variant];
    await this.open({
      variant,
      title: opts.title,
      message: opts.message,
      highlight: opts.highlight,
      icon: opts.icon,
      note: opts.note,
      dismissible: true,
      buttons: [
        {
          id: 'ok',
          label: opts.okLabel ?? theme.confirm,
          style: 'solid',
          tone: primaryToneFor(variant),
          autofocus: true,
        },
      ],
    });
  }

  /* ── Sugar helpers per variant ── */
  danger(opts: Omit<ConfirmOptions, 'variant'>): Promise<boolean> {
    return this.confirm({ ...opts, variant: 'danger' });
  }
  warn(opts: Omit<ConfirmOptions, 'variant'>): Promise<boolean> {
    return this.confirm({ ...opts, variant: 'warning' });
  }

  /* ── Resolution from the host (button click / dismiss) ── */
  resolveActive(chosenId: string | null): void {
    const current = this.active();
    if (!current) return;
    current.resolve(chosenId);
    this.advance();
  }

  /** Pop the next queued dialog (or clear). */
  private advance(): void {
    const next = this.queue.shift() ?? null;
    this.active.set(next);
  }

  /** Derive default buttons when none provided. */
  private resolveButtons(config: DialogConfig, variant: DialogVariant): DialogButton[] {
    if (config.buttons?.length) return config.buttons;
    const theme = DIALOG_THEME[variant];
    return [
      { id: 'cancel', label: 'Cancel', style: 'ghost', tone: 'neutral' },
      {
        id: 'confirm',
        label: theme.confirm,
        style: 'solid',
        tone: primaryToneFor(variant),
        autofocus: true,
        gated: !!config.requireText,
      },
    ];
  }
}
