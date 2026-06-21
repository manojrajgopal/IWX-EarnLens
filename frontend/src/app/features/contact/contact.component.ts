import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex-1 flex flex-col">
      <section class="mb-8">
        <h1 class="font-serif text-4xl font-bold mb-2">Contact Us</h1>
        <p class="text-secondary max-w-2xl">
          Have a question, suggestion or need support? We'd love to hear from you.
        </p>
      </section>

      <div class="grid lg:grid-cols-3 gap-6 flex-1">
        <!-- form -->
        <div class="lg:col-span-2">
          <div class="card card-pad">
            <h2 class="font-serif text-lg font-semibold mb-4">Send a message</h2>
            <form (ngSubmit)="send()" class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="field-label">Name</label>
                <input class="input" [(ngModel)]="name" name="name" placeholder="Your name" required />
              </div>
              <div>
                <label class="field-label">Email</label>
                <input class="input" [(ngModel)]="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div class="sm:col-span-2">
                <label class="field-label">Subject</label>
                <select class="select" [(ngModel)]="subject" name="subject">
                  <option value="general">General inquiry</option>
                  <option value="support">Technical support</option>
                  <option value="feedback">Feedback & suggestions</option>
                  <option value="billing">Billing question</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="field-label">Message</label>
                <textarea
                  class="textarea"
                  rows="6"
                  [(ngModel)]="message"
                  name="message"
                  placeholder="Tell us what's on your mind…"
                  required
                ></textarea>
              </div>
              <div class="sm:col-span-2 flex justify-end">
                <button class="btn btn-primary" [disabled]="sending()">
                  {{ sending() ? 'Sending…' : 'Send message' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- info sidebar -->
        <div class="lg:col-span-1 flex flex-col gap-6">
          <div class="card card-pad">
            <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider text-muted">Get in touch</h3>
            <div class="space-y-4 text-sm">
              <div>
                <p class="font-semibold mb-0.5">Email</p>
                <p class="text-secondary">support&#64;earnlens.io</p>
              </div>
              <div class="h-px bg-[var(--border-color)]"></div>
              <div>
                <p class="font-semibold mb-0.5">Response time</p>
                <p class="text-secondary">We typically respond within 24 hours on business days.</p>
              </div>
              <div class="h-px bg-[var(--border-color)]"></div>
              <div>
                <p class="font-semibold mb-0.5">Office hours</p>
                <p class="text-secondary">Monday – Friday, 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>

          <div class="card card-pad flex-1">
            <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider text-muted">FAQ</h3>
            <div class="space-y-3 text-sm">
              <div>
                <p class="font-semibold mb-0.5">Is EarnLens free?</p>
                <p class="text-secondary">Yes — core features are completely free to use.</p>
              </div>
              <div class="h-px bg-[var(--border-color)]"></div>
              <div>
                <p class="font-semibold mb-0.5">Can I export my data?</p>
                <p class="text-secondary">Absolutely. Export income as CSV anytime from Reports or Settings.</p>
              </div>
              <div class="h-px bg-[var(--border-color)]"></div>
              <div>
                <p class="font-semibold mb-0.5">Is my data secure?</p>
                <p class="text-secondary">All data is encrypted in transit and at rest. We never share your information.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactComponent {
  private readonly toast = inject(ToastService);

  name = '';
  email = '';
  subject = 'general';
  message = '';
  readonly sending = signal(false);

  send(): void {
    if (!this.name || !this.email || !this.message) return;
    this.sending.set(true);
    setTimeout(() => {
      this.toast.success('Message sent! We\u2019ll get back to you soon.');
      this.name = '';
      this.email = '';
      this.subject = 'general';
      this.message = '';
      this.sending.set(false);
    }, 800);
  }
}
