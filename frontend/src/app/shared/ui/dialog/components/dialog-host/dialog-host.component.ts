import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DialogService } from '../../services/dialog.service';
import { DialogButton } from '../../models/dialog.model';
import { DIALOG_ANIM } from '../../tokens/dialog-animation.tokens';
import { DialogPanelComponent } from '../dialog-panel/dialog-panel.component';

/**
 * Root-level host. Mount once (in the app root) — it listens to the
 * DialogService, renders the active panel inside an animated backdrop
 * and manages the enter/leave choreography plus Escape / backdrop
 * dismissal.
 */
@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [DialogPanelComponent],
  template: `
    @if (active(); as dialog) {
      <div
        class="dh"
        [class.dh--leaving]="leaving()"
        (click)="onBackdrop()"
      >
        <div class="dh__backdrop"></div>
        <app-dialog-panel
          [data]="dialog"
          [leaving]="leaving()"
          (chosen)="onChoose($event)"
        />
      </div>
    }
  `,
  styleUrl: './dialog-host.component.css',
})
export class DialogHostComponent {
  private readonly dialog = inject(DialogService);

  protected readonly active = computed(() => this.dialog.active());
  protected readonly leaving = signal(false);

  private pendingResult: string | null = null;

  constructor() {
    // Lock body scroll while a dialog is visible.
    effect(() => {
      const open = !!this.active();
      if (typeof document !== 'undefined') {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    });
  }

  protected onChoose(btn: DialogButton): void {
    const close = btn.closeOnClick ?? true;
    if (!close) return;
    this.dismissWith(btn.id);
  }

  protected onBackdrop(): void {
    const current = this.active();
    if (!current || current.dismissible === false) return;
    this.dismissWith(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    const current = this.active();
    if (!current || current.dismissible === false) return;
    this.dismissWith(null);
  }

  /** Play the leave animation, then resolve the service promise. */
  private dismissWith(result: string | null): void {
    if (this.leaving()) return;
    this.pendingResult = result;
    this.leaving.set(true);
    setTimeout(() => {
      this.leaving.set(false);
      this.dialog.resolveActive(this.pendingResult);
      this.pendingResult = null;
    }, DIALOG_ANIM.leave);
  }
}
