import { JourneyStep } from '../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Journey — the "how to use it" branch, told as a cinematic,
   four-beat story from first entry to confident mastery.
   ──────────────────────────────────────────────────────────── */

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    index: 1,
    icon: '＋',
    title: 'Capture an earning',
    description:
      'Add your first income in seconds. Pick a type, drop in the amount, and let EarnLens hold the detail for you.',
    route: '/app/income/new',
    cta: 'Add income',
  },
  {
    index: 2,
    icon: '⬡',
    title: 'Give it structure',
    description:
      'Sort entries into categories, attach a source, and tag them. A little structure now pays off forever.',
    route: '/app/categories',
    cta: 'Organize',
  },
  {
    index: 3,
    icon: '◴',
    title: 'Watch patterns emerge',
    description:
      'Open analytics and reshape one graph into trends, splits and comparisons. Your story tells itself.',
    route: '/app/analytics',
    cta: 'View analytics',
  },
  {
    index: 4,
    icon: '▤',
    title: 'Export with confidence',
    description:
      'Turn months of entries into clean reports and CSVs — ready for tax season, an accountant, or your own records.',
    route: '/app/reports',
    cta: 'Build a report',
  },
];
