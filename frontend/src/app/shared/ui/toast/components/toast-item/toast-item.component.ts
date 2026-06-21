import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Toast } from '../../models/toast.model';
import { TOAST_THEME } from '../../config/toast-theme.config';

/**
 * A single cinematic toast. Owns its own lifecycle:
 *  - animated entrance (slide + scale + blur + glow sweep)
 *  - countdown progress bar (pausable on hover)
 *  - graceful exit animation before requesting removal
 */
@Component({
  selector: 'app-toast-item',
  standalone: true,
  template: `
    <div
      class="ct"
      [class.ct--leaving]="leaving()"
      [attr.data-kind]="toast().kind"
      [style.--ct-accent]="theme().accent"
      [style.--ct-glow]="theme().glow"
      (mouseenter)="pause()"
      (mouseleave)="resume()"
      role="status"
      aria-live="polite"
    >
      <!-- ambient aura / glow -->
      <span class="ct__aura"></span>
      <span class="ct__beam"></span>

      <!-- icon with animated ring -->
      <div class="ct__icon">
        <svg class="ct__ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle class="ct__ring-track" cx="22" cy="22" r="20" />
          <circle class="ct__ring-spin" cx="22" cy="22" r="20" />
        </svg>
        <svg
          class="ct__glyph"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path [attr.d]="theme().icon" />
        </svg>
      </div>

      <!-- text -->
      <div class="ct__body">
        <p class="ct__title">{{ toast().title }}</p>
        <p class="ct__msg">{{ toast().message }}</p>
      </div>

      <!-- close -->
      <button type="button" class="ct__close" (click)="close()" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  `,
  styleUrl: './toast-item.component.css',
})
export class ToastItemComponent implements OnInit, OnDestroy {
  readonly toast = input.required<Toast>();
  readonly dismissed = output<number>();

  protected readonly leaving = signal(false);
  protected readonly paused = signal(false);

  protected readonly theme = computed(() => TOAST_THEME[this.toast().kind]);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private remaining = 0;
  private startedAt = 0;
  private readonly EXIT_MS = 460;

  ngOnInit(): void {
    const duration = this.toast().duration;
    if (duration > 0) {
      this.remaining = duration;
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  /** Begin (or resume) the auto-dismiss countdown. */
  private startCountdown(): void {
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.close(), this.remaining);
  }

  pause(): void {
    if (this.toast().duration <= 0 || this.leaving()) return;
    this.paused.set(true);
    this.clearTimer();
    this.remaining -= Date.now() - this.startedAt;
  }

  resume(): void {
    if (this.toast().duration <= 0 || this.leaving()) return;
    this.paused.set(false);
    if (this.remaining > 0) this.startCountdown();
  }

  /** Play exit animation, then ask the container to remove us. */
  close(): void {
    if (this.leaving()) return;
    this.clearTimer();
    this.leaving.set(true);
    setTimeout(() => this.dismissed.emit(this.toast().id), this.EXIT_MS);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
