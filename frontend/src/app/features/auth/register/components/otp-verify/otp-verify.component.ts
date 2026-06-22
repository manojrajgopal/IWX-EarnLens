import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';

/**
 * Presentational OTP entry — six auto-advancing digit boxes with paste
 * support, a resend control (cooldown + remaining count) and a live
 * expiry countdown. All network work is delegated to the parent via
 * the {@link verify}, {@link resend} and {@link back} outputs.
 */
@Component({
  selector: 'app-otp-verify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="otp">
      <p class="otp__lead">
        We emailed a 6-digit verification code to
        <span class="otp__email">{{ email() }}</span>. Enter it below to finish
        creating your account.
      </p>

      <div
        class="otp__boxes"
        [class.otp__boxes--error]="!!error()"
        (paste)="onPaste($event)"
      >
        @for (digit of digits(); track $index) {
          <input
            #box
            class="otp__box"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            [value]="digit"
            [disabled]="loading()"
            (input)="onInput($index, $event)"
            (keydown)="onKeydown($index, $event)"
            (focus)="onFocus($event)"
            [attr.aria-label]="'Digit ' + ($index + 1)"
          />
        }
      </div>

      @if (error()) {
        <p class="otp__error">{{ error() }}</p>
      } @else if (expirySeconds() > 0) {
        <p class="otp__hint">Code expires in {{ formatTime(expirySeconds()) }}</p>
      } @else {
        <p class="otp__hint otp__hint--expired">
          This code has expired. Request a new one below.
        </p>
      }

      <button
        type="button"
        class="otp__cta"
        [disabled]="loading() || !isComplete()"
        [class.otp__cta--loading]="loading()"
        (click)="submit()"
      >
        <span class="otp__cta-bg"></span>
        <span class="otp__cta-content">
          @if (loading()) {
            <span class="otp__cta-spinner"></span>
            <span>Verifying…</span>
          } @else {
            <span>Verify &amp; create account</span>
            <span class="otp__cta-arrow">→</span>
          }
        </span>
      </button>

      <div class="otp__foot">
        <button
          type="button"
          class="otp__link"
          [disabled]="resendCooldown() > 0 || resending() || resendsRemaining() <= 0"
          (click)="resend.emit()"
        >
          @if (resending()) {
            Sending…
          } @else if (resendCooldown() > 0) {
            Resend code in {{ resendCooldown() }}s
          } @else if (resendsRemaining() <= 0) {
            No resends left
          } @else {
            Resend code
          }
        </button>
        <span class="otp__sep">•</span>
        <button type="button" class="otp__link" [disabled]="loading()" (click)="back.emit()">
          Change details
        </button>
      </div>
    </div>
  `,
  styleUrl: './otp-verify.component.css',
})
export class OtpVerifyComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly email = input('');
  readonly loading = input(false);
  readonly resending = input(false);
  readonly error = input<string | null>(null);
  readonly resendsRemaining = input(3);
  /** Seconds until the current code expires (resets when a new code arrives). */
  readonly expiresIn = input(600);

  readonly verify = output<string>();
  readonly resend = output<void>();
  readonly back = output<void>();

  readonly digits = signal<string[]>(['', '', '', '', '', '']);
  readonly expirySeconds = signal(600);
  readonly resendCooldown = signal(30);

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');

  constructor() {
    // Sync the expiry countdown whenever a fresh code window is provided.
    effect(() => {
      this.expirySeconds.set(this.expiresIn());
      this.resendCooldown.set(30);
    });

    // Clear the boxes and refocus when the parent reports a verification error.
    effect(() => {
      if (this.error()) {
        this.digits.set(['', '', '', '', '', '']);
        queueMicrotask(() => this.focusBox(0));
      }
    });

    const timer = setInterval(() => {
      this.expirySeconds.update((s) => (s > 0 ? s - 1 : 0));
      this.resendCooldown.update((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  isComplete(): boolean {
    return this.digits().every((d) => d !== '');
  }

  private code(): string {
    return this.digits().join('');
  }

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const char = input.value.replace(/\D/g, '').slice(-1);
    this.setDigit(index, char);
    input.value = char;
    if (char && index < 5) {
      this.focusBox(index + 1);
    }
    if (char && this.isComplete() && !this.loading()) {
      this.submit();
    }
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      event.preventDefault();
      this.setDigit(index - 1, '');
      this.focusBox(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusBox(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusBox(index + 1);
    }
  }

  onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    this.digits.set(next);
    const last = Math.min(text.length, 6) - 1;
    queueMicrotask(() => this.focusBox(last < 5 ? last + 1 : 5));
    if (this.isComplete() && !this.loading()) {
      this.submit();
    }
  }

  submit(): void {
    if (this.isComplete() && !this.loading()) {
      this.verify.emit(this.code());
    }
  }

  formatTime(total: number): string {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private setDigit(index: number, value: string): void {
    this.digits.update((arr) => {
      const next = [...arr];
      next[index] = value;
      return next;
    });
  }

  private focusBox(index: number): void {
    const el = this.boxes()[index]?.nativeElement;
    el?.focus();
    el?.select();
  }
}
