import { FaqEntry } from '../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   FAQ — the "good to know" branch. Feature-oriented answers
   that help a new user feel oriented and safe.
   ──────────────────────────────────────────────────────────── */

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'what-is',
    question: 'What exactly is EarnLens?',
    answer:
      'EarnLens is a focused workspace for tracking, organizing and understanding every kind of income you earn — all in one calm, private place.',
  },
  {
    id: 'who-for',
    question: 'Who is it for?',
    answer:
      'Freelancers, salaried professionals, investors and anyone with more than one way of earning. If money arrives from several directions, EarnLens brings it together.',
  },
  {
    id: 'how-start',
    question: 'How do I get started?',
    answer:
      'Add a single income entry. From there, categories, sources and analytics unlock naturally as your history grows.',
  },
  {
    id: 'data-safe',
    question: 'Is my information private?',
    answer:
      'Your data lives behind your account and is only ever shown to you. This welcome page intentionally keeps sensitive figures out of view.',
  },
  {
    id: 'export',
    question: 'Can I get my data out?',
    answer:
      'Always. Reports and CSV exports let you take clean, structured copies of everything whenever you need them.',
  },
];
