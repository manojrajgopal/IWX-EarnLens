import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../../../core/services/email.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EmailChannel } from '../../../../core/models/preferences.model';

/**
 * ───────────────────────────────────────────────────────────────
 *  Email notifications console — a floating preference window.
 * ───────────────────────────────────────────────────────────────
 *  Surfaces every transactional email the platform can send and
 *  lets the user arm or silence each one. A master switch governs
 *  the whole channel; security mail (password reset) stays locked
 *  on so an account can always be recovered.
 *
 *  Emits the full notification payload — `{ email, channels }` —
 *  so the parent can persist it through the preferences endpoint
 *  in a single PATCH (the backend backfills any missing keys).
 */
export interface EmailNotificationsResult {
  email: boolean;
  channels: Record<string, boolean>;
}

@Component({
  selector: 'app-email-notifications-dialog',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './email-notifications-dialog.component.html',
  styleUrl: './email-notifications-dialog.component.css',
})
export class EmailNotificationsDialogComponent {
  private readonly emailApi = inject(EmailService);
  private readonly toast = inject(ToastService);

  /** Controls visibility. */
  readonly open = input(false);
  /** Master email switch as currently stored. */
  readonly emailEnabled = input(true);
  /** Per-channel toggles as currently stored. */
  readonly channelState = input<Record<string, boolean>>({});

  readonly confirm = output<EmailNotificationsResult>();
  readonly cancel = output<void>();

  /** Per-channel working copy. */
  readonly channels = signal<Record<string, boolean>>({});
  /** Catalog fetched from the backend (label / group / locked). */
  readonly catalog = signal<EmailChannel[]>([]);
  readonly loading = signal(false);
  readonly testing = signal(false);

  /** Channels arranged by their group header, in catalog order. */
  readonly groups = computed(() => {
    const order: string[] = [];
    const byGroup = new Map<string, EmailChannel[]>();
    for (const channel of this.catalog()) {
      if (!byGroup.has(channel.group)) {
        byGroup.set(channel.group, []);
        order.push(channel.group);
      }
      byGroup.get(channel.group)!.push(channel);
    }
    return order.map((name) => ({ name, items: byGroup.get(name)! }));
  });

  /** Only the editable (non-locked) channels — the income notifications. */
  readonly editable = computed(() => this.catalog().filter((c) => !c.locked));

  /** How many editable channels the user currently has armed. */
  readonly activeCount = computed(
    () => this.editable().filter((c) => this.channels()[c.key]).length,
  );

  constructor() {
    // Load the catalog once.
    this.loadCatalog();

    // Reset the working copy each time the window opens.
    let wasOpen = false;
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !wasOpen) {
        this.channels.set({ ...this.channelState() });
      }
      wasOpen = isOpen;
    });
  }

  private loadCatalog(): void {
    this.loading.set(true);
    this.emailApi.channels().subscribe({
      next: (list) => {
        this.catalog.set(list);
        // Ensure every catalog key has a defined toggle (default on).
        this.channels.update((current) => {
          const next = { ...current };
          for (const c of list) {
            if (next[c.key] === undefined) next[c.key] = true;
          }
          return next;
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleChannel(channel: EmailChannel): void {
    if (channel.locked) return;
    this.channels.update((c) => ({ ...c, [channel.key]: !c[channel.key] }));
  }

  isOn(channel: EmailChannel): boolean {
    // Mandatory channels always read as on.
    return channel.locked || !!this.channels()[channel.key];
  }

  sendTest(): void {
    if (this.testing()) return;
    this.testing.set(true);
    this.emailApi.sendTest().subscribe({
      next: () => {
        this.toast.success('Test email queued — check your inbox.');
        this.testing.set(false);
      },
      error: () => {
        this.toast.error('Could not send the test email.');
        this.testing.set(false);
      },
    });
  }

  save(): void {
    // Force every mandatory channel on, then persist. The master email
    // switch stays enabled — only the editable income channels vary.
    const channels = { ...this.channels() };
    for (const c of this.catalog()) {
      if (c.locked) channels[c.key] = true;
    }
    this.confirm.emit({ email: true, channels });
  }

  dismiss(): void {
    this.cancel.emit();
  }
}
