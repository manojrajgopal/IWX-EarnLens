import { Injectable, signal } from '@angular/core';

/**
 * Tracks whether the user has accepted Terms and Privacy Policy.
 * Both must be accepted for the register checkbox to auto-tick.
 * State resets on page refresh (session-only, not persisted).
 */
@Injectable({ providedIn: 'root' })
export class LegalAcceptanceService {
  readonly termsAccepted = signal(false);
  readonly privacyAccepted = signal(false);

  /** True when both documents have been accepted in-session. */
  get allAccepted(): boolean {
    return this.termsAccepted() && this.privacyAccepted();
  }

  acceptTerms(): void {
    this.termsAccepted.set(true);
  }

  acceptPrivacy(): void {
    this.privacyAccepted.set(true);
  }

  reset(): void {
    this.termsAccepted.set(false);
    this.privacyAccepted.set(false);
  }
}
