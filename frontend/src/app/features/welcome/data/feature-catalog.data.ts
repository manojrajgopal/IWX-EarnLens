import { FeatureNode } from '../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Feature catalogue — the leaves of the "what can it do" branch.
   Each node is feature-focused (never about hardware) and links
   straight into the product so discovery becomes navigation.
   ──────────────────────────────────────────────────────────── */

export const FEATURE_CATALOG: FeatureNode[] = [
  {
    id: 'unified-analytics',
    icon: '◴',
    title: 'Unified Analytics',
    tagline: 'One lens for every number',
    description:
      'A single, switchable visual surface that reshapes itself into trends, splits and comparisons — no spreadsheet gymnastics required.',
    benefit: 'See exactly where your money grows, slows or surprises you.',
    route: '/app/analytics',
    cta: 'Explore analytics',
    accent: '#4f46e5',
  },
  {
    id: 'income-model',
    icon: '＄',
    title: 'Flexible Income Model',
    tagline: 'Every kind of earning, one home',
    description:
      'Salary, freelance, dividends, royalties, gifts — capture each with custom fields, tags, attachments and recurrence in seconds.',
    benefit: 'Nothing slips through the cracks, no matter how you earn.',
    route: '/app/income/new',
    cta: 'Record income',
    accent: '#059669',
  },
  {
    id: 'organization',
    icon: '⬡',
    title: 'Smart Organization',
    tagline: 'Structure that thinks ahead',
    description:
      'Categories, sources and tags work together so every entry lands exactly where it belongs and stays effortless to find.',
    benefit: 'Find any payment in a heartbeat — months or years later.',
    route: '/app/categories',
    cta: 'Organize streams',
    accent: '#d97706',
  },
  {
    id: 'reports',
    icon: '▤',
    title: 'Exportable Reports',
    tagline: 'Tax season, disarmed',
    description:
      'Generate detailed summaries and download clean CSVs ready for filing, sharing or archiving — built for the moments that matter.',
    benefit: 'Walk into tax time calm, prepared and in control.',
    route: '/app/reports',
    cta: 'Build a report',
    accent: '#0284c7',
  },
  {
    id: 'recurring',
    icon: '↻',
    title: 'Recurring Intelligence',
    tagline: 'Know your stable baseline',
    description:
      'Separate recurring income from one-time windfalls so you always understand the floor beneath your finances.',
    benefit: 'Plan with confidence on what truly repeats.',
    route: '/app/income',
    cta: 'View streams',
    accent: '#7c3aed',
  },
  {
    id: 'activity',
    icon: '✶',
    title: 'Living Activity Trail',
    tagline: 'Your history, transparent',
    description:
      'A continuous, reviewable trail of every action you take — edits, additions and changes — so you always trust your data.',
    benefit: 'Total clarity on what changed and when.',
    route: '/app/activity',
    cta: 'See activity',
    accent: '#e11d48',
  },
];
