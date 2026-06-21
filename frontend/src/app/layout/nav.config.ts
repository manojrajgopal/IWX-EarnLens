/* ── Navigation configuration for the header mega-dropdown ── */

export interface NavLeaf {
  label: string;
  path: string;
  icon: string;
  description?: string;
}

export interface NavDropdownItem {
  label: string;
  icon: string;
  path?: string;           // direct route (shows "Open" action if children exist)
  children?: NavLeaf[];    // sub-items
}

export interface NavGroup {
  title: string;
  items: NavDropdownItem[];
}

/** Flat legacy shape for the mobile drawer */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/* ───────── Header dropdown groups ───────── */

export const HEADER_NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: '◈',
        path: '/app/dashboard',
        children: [
          { label: 'Summary', path: '/app/dashboard', icon: '◈', description: 'At-a-glance income overview' },
        ],
      },
      {
        label: 'Analytics',
        icon: '◴',
        path: '/app/analytics',
        children: [
          { label: 'Charts & Trends', path: '/app/analytics', icon: '◴', description: 'Slice income by any dimension' },
          { label: 'Reports', path: '/app/reports', icon: '▤', description: 'Generate summaries & export data' },
        ],
      },
    ],
  },
  {
    title: 'Income',
    items: [
      {
        label: 'Manage',
        icon: '＄',
        path: '/app/income',
        children: [
          { label: 'All Income', path: '/app/income', icon: '＄', description: 'Browse & filter all entries' },
          { label: 'Add New', path: '/app/income/new', icon: '＋', description: 'Record a new income entry' },
        ],
      },
      {
        label: 'Organize',
        icon: '⬡',
        children: [
          { label: 'Categories', path: '/app/categories', icon: '⬡', description: 'Group income into buckets' },
          { label: 'Sources', path: '/app/sources', icon: '⌖', description: 'Track where income comes from' },
          { label: 'Tags', path: '/app/tags', icon: '#', description: 'Flexible labels for entries' },
        ],
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'Personal',
        icon: '☺',
        children: [
          { label: 'Profile', path: '/app/profile', icon: '☺', description: 'Your info & password' },
          { label: 'Settings', path: '/app/settings', icon: '⚙', description: 'Preferences & defaults' },
          { label: 'Activity', path: '/app/activity', icon: '↻', description: 'Recent account actions' },
        ],
      },
    ],
  },
  {
    title: 'Company',
    items: [
      {
        label: 'Info',
        icon: '◆',
        children: [
          { label: 'About', path: '/app/about', icon: '◆', description: 'Our mission & values' },
          { label: 'Contact', path: '/app/contact', icon: '✉', description: 'Get in touch with us' },
        ],
      },
    ],
  },
];

/* ───────── Flat list for mobile drawer ───────── */

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/app/dashboard', icon: '◈' },
      { label: 'Analytics', path: '/app/analytics', icon: '◴' },
      { label: 'Reports', path: '/app/reports', icon: '▤' },
    ],
  },
  {
    title: 'Income',
    items: [
      { label: 'All Income', path: '/app/income', icon: '＄' },
      { label: 'Add Income', path: '/app/income/new', icon: '＋' },
      { label: 'Categories', path: '/app/categories', icon: '⬡' },
      { label: 'Sources', path: '/app/sources', icon: '⌖' },
      { label: 'Tags', path: '/app/tags', icon: '#' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Activity', path: '/app/activity', icon: '↻' },
      { label: 'Profile', path: '/app/profile', icon: '☺' },
      { label: 'Settings', path: '/app/settings', icon: '⚙' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', path: '/app/about', icon: '◆' },
      { label: 'Contact', path: '/app/contact', icon: '✉' },
    ],
  },
];

