import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PulseMetric } from './models/welcome.types';

import { SectionShellComponent } from './ui/section-shell/section-shell.component';
import { HeroComponent } from './sections/hero/hero.component';
import { IntroFilmComponent } from './sections/intro-film/intro-film.component';
import { UserPulseComponent } from './sections/user-pulse/user-pulse.component';
import { FeatureShowcaseComponent } from './sections/feature-showcase/feature-showcase.component';
import { JourneyComponent } from './sections/journey/journey.component';
import { WhyEarnlensComponent } from './sections/why-earnlens/why-earnlens.component';
import { NavigatorComponent } from './sections/navigator/navigator.component';
import { FaqComponent } from './sections/faq/faq.component';
import { FinaleComponent } from './sections/finale/finale.component';

/* ════════════════════════════════════════════════════════════
   WELCOME — the post-login home base.

   This orchestrator is the single trunk every branch connects
   to: hero, intro film, your pulse, features, journey, why,
   navigator, FAQ and finale. It only ever surfaces NON-sensitive
   information (counts, never amounts; no graphs), keeping the
   page a calm, cinematic overview rather than a data dashboard.
   ════════════════════════════════════════════════════════════ */

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    SectionShellComponent,
    HeroComponent,
    IntroFilmComponent,
    UserPulseComponent,
    FeatureShowcaseComponent,
    JourneyComponent,
    WhyEarnlensComponent,
    NavigatorComponent,
    FaqComponent,
    FinaleComponent,
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly analytics = inject(AnalyticsService);

  private readonly user = this.auth.currentUser;
  readonly metricsLoading = signal(true);
  readonly metrics = signal<PulseMetric[]>([]);

  /** First name only — warm, never formal. */
  readonly firstName = computed(() => {
    const full = this.user()?.full_name?.trim();
    if (full) return full.split(/\s+/)[0];
    return this.user()?.username || 'there';
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Welcome back';
  });

  readonly fullName = computed(() => this.user()?.full_name ?? '');
  readonly username = computed(() => this.user()?.username ?? '');
  readonly email = computed(() => this.user()?.email ?? '');
  readonly currency = computed(() => this.user()?.default_currency ?? '');
  readonly role = computed(() => this.user()?.role ?? 'user');

  readonly initials = computed(() => {
    const full = this.user()?.full_name?.trim();
    if (full) {
      const parts = full.split(/\s+/);
      const first = parts[0]?.[0] ?? '';
      const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase() || '?';
    }
    return (this.user()?.username?.[0] ?? '?').toUpperCase();
  });

  readonly memberSince = computed(() => {
    const raw = this.user()?.created_at;
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  });

  ngOnInit(): void {
    // One call → derive only NON-sensitive counts (never amounts).
    this.analytics.dashboard({}).subscribe({
      next: (summary) => {
        this.metrics.set([
          {
            id: 'entries',
            icon: '＄',
            label: 'Income entries',
            value: summary.totals.count,
            hint: 'logged so far',
            accent: '#059669',
          },
          {
            id: 'categories',
            icon: '⬡',
            label: 'Categories',
            value: summary.by_category.length,
            hint: 'in active use',
            accent: '#7c3aed',
          },
          {
            id: 'sources',
            icon: '⌖',
            label: 'Sources',
            value: summary.by_source.length,
            hint: 'being tracked',
            accent: '#0284c7',
          },
          {
            id: 'recurring',
            icon: '↻',
            label: 'Recurring streams',
            value: summary.recurring.recurring_count,
            hint: 'on repeat',
            accent: '#d97706',
          },
        ]);
        this.metricsLoading.set(false);
      },
      error: () => this.metricsLoading.set(false),
    });
  }
}
