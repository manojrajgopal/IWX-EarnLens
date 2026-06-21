import { NavGroup, NavNode, SearchEntry } from '../models/nav.model';

/* ============================================================
   Header navigation tree
   Deeply nested — groups → nodes → children → children …
   Add new pages here; the header, mobile menu and search all
   read from this single source of truth.
   ============================================================ */

export const HEADER_NAV: NavGroup[] = [
  {
    title: 'Overview',
    icon: '◧',
    nodes: [
      {
        label: 'Dashboard',
        icon: '◈',
        path: '/app/dashboard',
        description: 'At-a-glance income overview',
        children: [
          { label: 'Summary', icon: '◈', path: '/app/dashboard', description: 'Totals, trends & recent activity' },
          {
            label: 'Insights',
            icon: '✦',
            description: 'Smart breakdowns',
            children: [
              { label: 'By Category', icon: '⬡', path: '/app/dashboard', description: 'Where income comes from' },
              { label: 'Top Sources', icon: '⌖', path: '/app/dashboard', description: 'Your biggest earners' },
              { label: 'Recurring vs One-time', icon: '↻', path: '/app/dashboard', description: 'Stable baseline view' },
            ],
          },
        ],
      },
      {
        label: 'Analytics',
        icon: '◴',
        path: '/app/analytics',
        description: 'Slice income any way you like',
        children: [
          { label: 'Charts & Trends', icon: '◴', path: '/app/analytics', description: 'Visualize over time' },
          {
            label: 'Distribution',
            icon: '◐',
            description: 'Compare segments',
            children: [
              { label: 'By Category', icon: '⬡', path: '/app/analytics', description: 'Category split' },
              { label: 'By Source', icon: '⌖', path: '/app/analytics', description: 'Source split' },
              { label: 'By Type', icon: '◇', path: '/app/analytics', description: 'Salary, freelance, etc.' },
            ],
          },
          {
            label: 'Reports',
            icon: '▤',
            path: '/app/reports',
            description: 'Summaries & exports',
            children: [
              { label: 'Open Reports', icon: '▤', path: '/app/reports', description: 'Generate a report' },
              { label: 'Monthly Summary', icon: '▦', path: '/app/reports', description: 'This month at a glance' },
              { label: 'Export CSV', icon: '▥', path: '/app/reports', description: 'Download for tax season' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Income',
    icon: '＄',
    nodes: [
      {
        label: 'Manage',
        icon: '＄',
        path: '/app/income',
        description: 'Browse & edit entries',
        children: [
          { label: 'All Income', icon: '＄', path: '/app/income', description: 'Browse & filter all entries' },
          { label: 'Add New', icon: '＋', path: '/app/income/new', description: 'Record a new income entry', badge: 'New' },
          {
            label: 'Filters',
            icon: '⚲',
            description: 'Quick views',
            children: [
              { label: 'Recurring', icon: '↻', path: '/app/income', description: 'Repeating income' },
              { label: 'One-time', icon: '◇', path: '/app/income', description: 'Single payments' },
              { label: 'Pending', icon: '◔', path: '/app/income', description: 'Awaiting payment' },
            ],
          },
        ],
      },
      {
        label: 'Organize',
        icon: '⬡',
        description: 'Structure your income',
        children: [
          {
            label: 'Categories',
            icon: '⬡',
            path: '/app/categories',
            description: 'Group income into buckets',
            children: [
              { label: 'All Categories', icon: '⬡', path: '/app/categories', description: 'Manage categories' },
              { label: 'Create Category', icon: '＋', path: '/app/categories', description: 'Add a new bucket' },
            ],
          },
          {
            label: 'Sources',
            icon: '⌖',
            path: '/app/sources',
            description: 'Track where income comes from',
            children: [
              { label: 'All Sources', icon: '⌖', path: '/app/sources', description: 'Manage sources' },
              { label: 'Create Source', icon: '＋', path: '/app/sources', description: 'Add a new source' },
            ],
          },
          {
            label: 'Tags',
            icon: '#',
            path: '/app/tags',
            description: 'Flexible labels for entries',
            children: [
              { label: 'All Tags', icon: '#', path: '/app/tags', description: 'Manage tags' },
              { label: 'Create Tag', icon: '＋', path: '/app/tags', description: 'Add a new tag' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Account',
    icon: '☺',
    nodes: [
      {
        label: 'Personal',
        icon: '☺',
        description: 'You & your preferences',
        children: [
          { label: 'Profile', icon: '☺', path: '/app/profile', description: 'Your info & password' },
          {
            label: 'Settings',
            icon: '⚙',
            path: '/app/settings',
            description: 'Preferences & defaults',
            children: [
              { label: 'Appearance', icon: '☾', path: '/app/settings', description: 'Theme & display' },
              { label: 'Defaults', icon: '◇', path: '/app/settings', description: 'Currency, grouping…' },
              { label: 'Data & Export', icon: '▥', path: '/app/settings', description: 'Download your data' },
            ],
          },
          { label: 'Activity', icon: '↻', path: '/app/activity', description: 'Recent account actions' },
        ],
      },
    ],
  },
  {
    title: 'Company',
    icon: '◆',
    nodes: [
      {
        label: 'Info',
        icon: '◆',
        description: 'About EarnLens',
        children: [
          {
            label: 'About',
            icon: '◆',
            path: '/app/about',
            description: 'Our mission & values',
            children: [
              { label: 'Mission', icon: '✦', path: '/app/about', description: 'Why we exist' },
              { label: 'Values', icon: '◈', path: '/app/about', description: 'What we stand for' },
            ],
          },
          {
            label: 'Contact',
            icon: '✉',
            path: '/app/contact',
            description: 'Get in touch with us',
            children: [
              { label: 'Send a Message', icon: '✉', path: '/app/contact', description: 'Reach support' },
              { label: 'FAQ', icon: '?', path: '/app/contact', description: 'Common questions' },
            ],
          },
        ],
      },
    ],
  },
];

/* ───────── Flatten the tree into a search index ───────── */

function flatten(nodes: NavNode[], group: string, out: SearchEntry[]): void {
  for (const node of nodes) {
    if (node.path) {
      out.push({
        label: node.label,
        path: node.path,
        group,
        icon: node.icon ?? '◦',
        keywords: `${node.label} ${node.description ?? ''} ${group}`.toLowerCase(),
      });
    }
    if (node.children?.length) {
      flatten(node.children, group, out);
    }
  }
}

export const SEARCH_INDEX: SearchEntry[] = (() => {
  const out: SearchEntry[] = [];
  for (const g of HEADER_NAV) {
    flatten(g.nodes, g.title, out);
  }
  // de-duplicate by label+path
  const seen = new Set<string>();
  return out.filter((e) => {
    const key = `${e.label}|${e.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();
