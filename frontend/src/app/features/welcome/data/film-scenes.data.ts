import { FilmScene } from '../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Film scenes — the storyboard of the self-contained intro
   "short movie". Each scene is a cinematic beat that animates
   into view when the user presses play.
   ──────────────────────────────────────────────────────────── */

export const FILM_SCENES: FilmScene[] = [
  {
    index: 0,
    icon: '✦',
    title: 'Meet EarnLens',
    caption: 'A single, calm home for everything you earn.',
    accent: '#4f46e5',
  },
  {
    index: 1,
    icon: '＄',
    title: 'Capture any income',
    caption: 'Salary, freelance, dividends, gifts — in seconds.',
    accent: '#059669',
  },
  {
    index: 2,
    icon: '⬡',
    title: 'Organize effortlessly',
    caption: 'Categories, sources and tags keep order for you.',
    accent: '#d97706',
  },
  {
    index: 3,
    icon: '◴',
    title: 'See the patterns',
    caption: 'One graph reshapes into every story your money tells.',
    accent: '#0284c7',
  },
  {
    index: 4,
    icon: '▤',
    title: 'Export with calm',
    caption: 'Reports and CSVs ready the moment you need them.',
    accent: '#7c3aed',
  },
  {
    index: 5,
    icon: '➚',
    title: 'Grow with confidence',
    caption: 'Watch your baseline rise — and feel the momentum.',
    accent: '#e11d48',
  },
];
