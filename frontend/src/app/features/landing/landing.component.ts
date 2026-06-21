import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  readonly year = new Date().getFullYear();
  readonly features = [
    {
      icon: '◴',
      title: 'Unified analytics',
      text: 'One switchable graph for trends, splits and comparisons across every income stream.',
    },
    {
      icon: '＄',
      title: 'Flexible income model',
      text: 'Salary, freelance, dividends, gifts — with custom fields, tags and attachments.',
    },
    {
      icon: '⬡',
      title: 'Smart organization',
      text: 'Categories, sources and tags keep every payment exactly where it belongs.',
    },
    {
      icon: '▤',
      title: 'Exportable reports',
      text: 'Generate detailed summaries and download CSVs ready for tax season.',
    },
    {
      icon: '↻',
      title: 'Recurring tracking',
      text: 'Separate recurring from one-time income to understand your stable baseline.',
    },
    {
      icon: '☾',
      title: 'Light & dark',
      text: 'A calm, premium workspace that adapts to your environment and preferences.',
    },
  ];
}
