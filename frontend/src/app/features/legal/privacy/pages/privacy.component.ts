import { Component, inject, afterNextRender, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LegalHeaderComponent } from '../../shared/components/legal-header/legal-header.component';
import { AcceptButtonComponent } from '../../shared/components/accept-button/accept-button.component';
import { LegalSectionComponent } from '../../terms/components/legal-section/legal-section.component';
import { PRIVACY_SECTIONS } from '../content/privacy-sections';
import { PRIVACY_META } from '../content/privacy-meta';
import { LegalAcceptanceService } from '../../shared/services/legal-acceptance.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [LegalHeaderComponent, AcceptButtonComponent, LegalSectionComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
})
export class PrivacyComponent {
  private readonly router = inject(Router);
  private readonly acceptance = inject(LegalAcceptanceService);
  private readonly el = inject(ElementRef);

  readonly sections = PRIVACY_SECTIONS;
  readonly meta = PRIVACY_META;

  constructor() {
    afterNextRender(() => this.initScrollReveal());
  }

  onAccept(): void {
    this.acceptance.acceptPrivacy();
    this.router.navigate(['/register']);
  }

  private initScrollReveal(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    this.el.nativeElement.querySelectorAll('.scroll-reveal').forEach((el: Element) => observer.observe(el));
  }
}
