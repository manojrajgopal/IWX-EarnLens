import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="flex-1 flex flex-col">
      <!-- hero -->
      <section class="mb-10">
        <h1 class="font-serif text-4xl font-bold mb-2">About EarnLens</h1>
        <p class="text-secondary max-w-3xl">
          EarnLens is a premium personal income analytics platform built for freelancers,
          professionals and multi-stream earners who want clarity over every dollar they earn.
        </p>
      </section>

      <!-- mission -->
      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <div class="card card-pad">
          <h2 class="font-serif text-xl font-semibold mb-3">Our Mission</h2>
          <p class="text-secondary text-sm leading-relaxed">
            We believe everyone deserves a clear, honest view of their finances. EarnLens was
            designed to bring calm and focus to income tracking — no clutter, no noise, just the
            information you need to make confident decisions about your money.
          </p>
        </div>
        <div class="card card-pad">
          <h2 class="font-serif text-xl font-semibold mb-3">Our Approach</h2>
          <p class="text-secondary text-sm leading-relaxed">
            Built with an editorial, Zara-inspired aesthetic — monochrome surfaces, serif
            typography, and generous whitespace. Every pixel is intentional. We prioritize
            readability, speed, and a workspace that adapts to your environment.
          </p>
        </div>
      </div>

      <!-- values -->
      <div class="card card-pad flex-1">
        <h2 class="font-serif text-xl font-semibold mb-5">What We Stand For</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
          @for (v of values; track v.title) {
            <div>
              <span class="text-2xl block mb-2">{{ v.icon }}</span>
              <h3 class="font-semibold mb-1">{{ v.title }}</h3>
              <p class="text-sm text-secondary leading-relaxed">{{ v.text }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AboutComponent {
  readonly values = [
    {
      icon: '◈',
      title: 'Clarity',
      text: 'Strip away the noise. Show only what matters — your income, your trends, your progress.',
    },
    {
      icon: '⬡',
      title: 'Organization',
      text: 'Categories, sources, tags and smart filters keep every payment exactly where it belongs.',
    },
    {
      icon: '◴',
      title: 'Insight',
      text: 'Beautiful charts and analytics that turn raw numbers into actionable understanding.',
    },
    {
      icon: '☾',
      title: 'Adaptability',
      text: 'Light and dark themes, responsive layouts, and preferences that respect your workflow.',
    },
    {
      icon: '🔒',
      title: 'Privacy',
      text: 'Your financial data stays yours. Encrypted, secure, and never shared with third parties.',
    },
    {
      icon: '↻',
      title: 'Reliability',
      text: 'Built to be fast, stable and always available when you need to record or review income.',
    },
  ];
}
