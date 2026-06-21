export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
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
];
