import { NavCluster } from '../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Navigation map — the full tree of "every button I can press".
   Clusters are branches; tiles are leaves. The navigation hub
   renders this so the welcome page becomes the one place that
   reaches everywhere in EarnLens.
   ──────────────────────────────────────────────────────────── */

export const NAVIGATION_MAP: NavCluster[] = [
  {
    id: 'overview',
    title: 'Overview',
    subtitle: 'See the whole picture',
    icon: '◈',
    tiles: [
      {
        id: 'dashboard',
        icon: '◈',
        label: 'Dashboard',
        description: 'Your income at a glance',
        route: '/app/dashboard',
        accent: '#4f46e5',
      },
      {
        id: 'analytics',
        icon: '◴',
        label: 'Analytics',
        description: 'Slice income by any dimension',
        route: '/app/analytics',
        accent: '#0284c7',
      },
      {
        id: 'reports',
        icon: '▤',
        label: 'Reports',
        description: 'Summaries & exports',
        route: '/app/reports',
        accent: '#059669',
      },
    ],
  },
  {
    id: 'income',
    title: 'Income',
    subtitle: 'Capture every earning',
    icon: '＄',
    tiles: [
      {
        id: 'all-income',
        icon: '＄',
        label: 'All Income',
        description: 'Browse & filter entries',
        route: '/app/income',
        accent: '#059669',
      },
      {
        id: 'add-income',
        icon: '＋',
        label: 'Add New',
        description: 'Record a new entry',
        route: '/app/income/new',
        accent: '#d97706',
      },
    ],
  },
  {
    id: 'organize',
    title: 'Organize',
    subtitle: 'Structure your streams',
    icon: '⬡',
    tiles: [
      {
        id: 'categories',
        icon: '⬡',
        label: 'Categories',
        description: 'Group income into buckets',
        route: '/app/categories',
        accent: '#7c3aed',
      },
      {
        id: 'sources',
        icon: '⌖',
        label: 'Sources',
        description: 'Track where income comes from',
        route: '/app/sources',
        accent: '#0284c7',
      },
      {
        id: 'tags',
        icon: '#',
        label: 'Tags',
        description: 'Flexible labels for entries',
        route: '/app/tags',
        accent: '#e11d48',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    subtitle: 'Make it yours',
    icon: '☺',
    tiles: [
      {
        id: 'profile',
        icon: '☺',
        label: 'Profile',
        description: 'Your info & password',
        route: '/app/profile',
        accent: '#4f46e5',
      },
      {
        id: 'settings',
        icon: '⚙',
        label: 'Settings',
        description: 'Preferences & defaults',
        route: '/app/settings',
        accent: '#525252',
      },
      {
        id: 'currency',
        icon: '€',
        label: 'Currency',
        description: 'Your money, your unit',
        route: '/app/currency',
        accent: '#059669',
      },
      {
        id: 'activity',
        icon: '↻',
        label: 'Activity',
        description: 'Recent account actions',
        route: '/app/activity',
        accent: '#d97706',
      },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    subtitle: 'Get to know us',
    icon: '◆',
    tiles: [
      {
        id: 'about',
        icon: '◆',
        label: 'About',
        description: 'Our mission & values',
        route: '/app/about',
        accent: '#7c3aed',
      },
      {
        id: 'contact',
        icon: '✉',
        label: 'Contact',
        description: 'Get in touch with us',
        route: '/app/contact',
        accent: '#0284c7',
      },
    ],
  },
];
