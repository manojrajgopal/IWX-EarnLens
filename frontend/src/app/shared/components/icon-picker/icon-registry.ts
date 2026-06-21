/**
 * Professional SVG icon registry — grouped, searchable, selectable.
 * All icons use a 24×24 viewBox with stroke-linecap="round" stroke-linejoin="round".
 * Path data sourced from the Lucide icon set (ISC license).
 */

export interface IconEntry {
  id: string;
  name: string;
  keywords: string[];
  path: string;
}

export interface IconGroup {
  id: string;
  label: string;
  tab: string;
  icons: IconEntry[];
}

// ────────────────────────────────────────────────────────────────────────────
// ICON GROUPS
// ────────────────────────────────────────────────────────────────────────────

const BUSINESS: IconEntry[] = [
  { id: 'briefcase', name: 'Briefcase', keywords: ['work', 'job', 'business', 'career'], path: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z' },
  { id: 'building', name: 'Building', keywords: ['office', 'company', 'corporate'], path: 'M6 22V2h12v20M6 12H2v10h4M18 12h4v10h-4M10 6h4M10 10h4M10 14h4M10 18h4' },
  { id: 'landmark', name: 'Landmark', keywords: ['bank', 'institution', 'finance'], path: 'M3 22h18M6 18v-4M10 18v-4M14 18v-4M18 18v-4M2 10l10-7 10 7' },
  { id: 'wallet', name: 'Wallet', keywords: ['money', 'payment', 'finance', 'cash'], path: 'M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4M20 12a2 2 0 0 1 0 4H4a2 2 0 0 1-2-2V6M20 12h.01' },
  { id: 'credit-card', name: 'Credit Card', keywords: ['payment', 'bank', 'card'], path: 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20' },
  { id: 'banknote', name: 'Banknote', keywords: ['money', 'cash', 'currency', 'dollar'], path: 'M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM12 12a2 2 0 1 0 0-0.001' },
  { id: 'coins', name: 'Coins', keywords: ['money', 'currency', 'finance', 'cash'], path: 'M8 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM14.5 14.5a5 5 0 1 0 0-0.001' },
  { id: 'piggy-bank', name: 'Piggy Bank', keywords: ['savings', 'money', 'deposit'], path: 'M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1 0 2-1 2-2.5 0 0 0-.5 0-1M2 9.5c1 0 2 1.5 2 3.5' },
  { id: 'receipt', name: 'Receipt', keywords: ['invoice', 'bill', 'transaction'], path: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM8 10h8M8 14h4' },
  { id: 'chart-line', name: 'Chart Line', keywords: ['analytics', 'graph', 'trend', 'growth'], path: 'M3 3v18h18M7 16l4-4 4 4 5-5' },
  { id: 'chart-bar', name: 'Chart Bar', keywords: ['analytics', 'statistics', 'graph'], path: 'M12 20V10M18 20V4M6 20v-4' },
  { id: 'trending-up', name: 'Trending Up', keywords: ['growth', 'increase', 'profit'], path: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6' },
  { id: 'percent', name: 'Percent', keywords: ['discount', 'rate', 'tax', 'interest'], path: 'M19 5L5 19M6.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z' },
  { id: 'calculator', name: 'Calculator', keywords: ['math', 'accounting', 'compute'], path: 'M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 10h0M12 10h0M16 10h0M8 14h0M12 14h0M16 14h0M8 18h0M12 18h0M16 18h0M8 6h8' },
  { id: 'handshake', name: 'Handshake', keywords: ['deal', 'partnership', 'agreement'], path: 'M11 17l-1-1M14 14l-4 4M2 9l5-5 4 2 6-4 5 5-4 6 2 4-5 5M9 11l3-3' },
  { id: 'badge-dollar', name: 'Dollar Badge', keywords: ['money', 'price', 'cost', 'revenue'], path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v2M12 16v2M9 10c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2' },
];

const TECHNOLOGY: IconEntry[] = [
  { id: 'laptop', name: 'Laptop', keywords: ['computer', 'device', 'tech'], path: 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8H4zM2 18h20' },
  { id: 'smartphone', name: 'Smartphone', keywords: ['phone', 'mobile', 'device'], path: 'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 18h0' },
  { id: 'monitor', name: 'Monitor', keywords: ['screen', 'display', 'desktop'], path: 'M3 4h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 21h8M12 18v3' },
  { id: 'cpu', name: 'CPU', keywords: ['processor', 'chip', 'hardware'], path: 'M6 6h12v12H6zM9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2M10 10h4v4h-4z' },
  { id: 'server', name: 'Server', keywords: ['hosting', 'database', 'cloud'], path: 'M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM6 6h0M6 16h0' },
  { id: 'cloud', name: 'Cloud', keywords: ['hosting', 'saas', 'storage', 'internet'], path: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' },
  { id: 'globe', name: 'Globe', keywords: ['web', 'internet', 'world', 'website'], path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  { id: 'wifi', name: 'WiFi', keywords: ['internet', 'wireless', 'network'], path: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h0' },
  { id: 'code', name: 'Code', keywords: ['programming', 'developer', 'software'], path: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  { id: 'terminal', name: 'Terminal', keywords: ['console', 'command', 'cli'], path: 'M4 17l6-6-6-6M12 19h8' },
  { id: 'database', name: 'Database', keywords: ['storage', 'data', 'records'], path: 'M12 2c4.97 0 9 1.34 9 3v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5c0-1.66 4.03-3 9-3zM3 5c0 1.66 4.03 3 9 3s9-1.34 9-3M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' },
  { id: 'git-branch', name: 'Git Branch', keywords: ['version', 'code', 'repository'], path: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9' },
  { id: 'shield', name: 'Shield', keywords: ['security', 'protection', 'safe'], path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
];

const COMMUNICATION: IconEntry[] = [
  { id: 'mail', name: 'Mail', keywords: ['email', 'message', 'inbox', 'letter'], path: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6' },
  { id: 'phone', name: 'Phone', keywords: ['call', 'contact', 'telephone'], path: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' },
  { id: 'message-circle', name: 'Chat', keywords: ['message', 'conversation', 'talk'], path: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { id: 'send', name: 'Send', keywords: ['message', 'dispatch', 'submit'], path: 'M22 2L11 13M22 2l-7 20-4-9-9-4z' },
  { id: 'bell', name: 'Bell', keywords: ['notification', 'alert', 'reminder'], path: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { id: 'megaphone', name: 'Megaphone', keywords: ['announce', 'marketing', 'broadcast'], path: 'M3 11l18-5v12L3 13v-2zM11.6 16.8a3 3 0 1 1-5.8-1.6' },
  { id: 'video', name: 'Video', keywords: ['camera', 'meeting', 'record'], path: 'M23 7l-7 5 7 5V7zM2 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z' },
  { id: 'radio', name: 'Radio', keywords: ['broadcast', 'podcast', 'audio'], path: 'M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14' },
];

const PEOPLE: IconEntry[] = [
  { id: 'user', name: 'User', keywords: ['person', 'profile', 'account'], path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { id: 'users', name: 'Users', keywords: ['people', 'team', 'group'], path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { id: 'user-check', name: 'User Check', keywords: ['verified', 'approved', 'confirm'], path: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17 11l2 2 4-4' },
  { id: 'contact', name: 'Contact', keywords: ['address', 'person', 'card'], path: 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 19c0-2.2 2.2-4 5-4s5 1.8 5 4' },
  { id: 'graduation-cap', name: 'Graduation', keywords: ['education', 'school', 'degree'], path: 'M22 10l-10-5-10 5 10 5zM6 12v5c0 0 3 3 6 3s6-3 6-3v-5' },
  { id: 'award', name: 'Award', keywords: ['achievement', 'trophy', 'prize'], path: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12' },
  { id: 'crown', name: 'Crown', keywords: ['premium', 'vip', 'king', 'queen'], path: 'M2 17l2-10 5 4 3-6 3 6 5-4 2 10z' },
  { id: 'heart', name: 'Heart', keywords: ['love', 'favorite', 'like', 'health'], path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
];

const MEDIA: IconEntry[] = [
  { id: 'camera', name: 'Camera', keywords: ['photo', 'picture', 'image'], path: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { id: 'image', name: 'Image', keywords: ['photo', 'picture', 'gallery'], path: 'M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21' },
  { id: 'music', name: 'Music', keywords: ['audio', 'song', 'sound'], path: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
  { id: 'film', name: 'Film', keywords: ['movie', 'video', 'cinema'], path: 'M2 2h20v20H2zM7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 7h5M17 17h5' },
  { id: 'mic', name: 'Microphone', keywords: ['audio', 'podcast', 'record', 'voice'], path: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8' },
  { id: 'headphones', name: 'Headphones', keywords: ['audio', 'music', 'listen'], path: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z' },
  { id: 'palette', name: 'Palette', keywords: ['art', 'design', 'creative', 'color'], path: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.4-.15-.75-.38-1.02-.22-.26-.37-.6-.37-.98 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.5-9-10-9zM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM9.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM14.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM17.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z' },
  { id: 'pen-tool', name: 'Pen Tool', keywords: ['design', 'draw', 'creative'], path: 'M12 19l7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0z' },
];

const SHOPPING: IconEntry[] = [
  { id: 'shopping-cart', name: 'Shopping Cart', keywords: ['buy', 'store', 'ecommerce'], path: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM21 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  { id: 'shopping-bag', name: 'Shopping Bag', keywords: ['buy', 'store', 'retail'], path: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0' },
  { id: 'store', name: 'Store', keywords: ['shop', 'retail', 'market'], path: 'M3 9l1-4h16l1 4M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 21V9M15 21v-6' },
  { id: 'tag', name: 'Tag', keywords: ['label', 'price', 'category'], path: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h0' },
  { id: 'gift', name: 'Gift', keywords: ['present', 'reward', 'bonus'], path: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' },
  { id: 'package', name: 'Package', keywords: ['box', 'delivery', 'shipping'], path: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' },
  { id: 'truck', name: 'Truck', keywords: ['delivery', 'shipping', 'logistics'], path: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { id: 'barcode', name: 'Barcode', keywords: ['scan', 'product', 'sku'], path: 'M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14M5 5v14M10 5v14M15 5v14M19 5v14' },
];

const NATURE: IconEntry[] = [
  { id: 'sun', name: 'Sun', keywords: ['weather', 'bright', 'day', 'light'], path: 'M12 12a4 4 0 1 0 0-0.001M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
  { id: 'moon', name: 'Moon', keywords: ['night', 'dark', 'sleep'], path: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
  { id: 'leaf', name: 'Leaf', keywords: ['nature', 'plant', 'eco', 'green'], path: 'M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12' },
  { id: 'tree', name: 'Tree', keywords: ['nature', 'forest', 'plant'], path: 'M12 22v-7M10 15H4l3-4H4l4-5H6l6-8 6 8h-2l4 5h-3l3 4h-6' },
  { id: 'flower', name: 'Flower', keywords: ['nature', 'garden', 'bloom'], path: 'M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9M7.5 12H9M12 16.5A4.5 4.5 0 1 1 16.5 12M12 16.5A4.5 4.5 0 1 0 7.5 12M12 16.5V15M16.5 12H15M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  { id: 'mountain', name: 'Mountain', keywords: ['outdoors', 'hiking', 'adventure'], path: 'M8 3l4 8 5-5 5 16H2z' },
  { id: 'zap', name: 'Lightning', keywords: ['energy', 'power', 'electric', 'fast'], path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'flame', name: 'Flame', keywords: ['fire', 'hot', 'energy'], path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7.5.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.47-2.46 1.5-3.5 1 1 2 1.5 2 3.5z' },
];

const TRAVEL: IconEntry[] = [
  { id: 'plane', name: 'Plane', keywords: ['flight', 'travel', 'airport', 'trip'], path: 'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z' },
  { id: 'car', name: 'Car', keywords: ['vehicle', 'drive', 'auto', 'transport'], path: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM5 17H3v-4l2-5h10l2 5v4h-2M5 17h10M7 8V5a1 1 0 0 1 1-1h4' },
  { id: 'home', name: 'Home', keywords: ['house', 'residence', 'property', 'real estate'], path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
  { id: 'map-pin', name: 'Map Pin', keywords: ['location', 'place', 'address', 'gps'], path: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { id: 'compass', name: 'Compass', keywords: ['navigation', 'direction', 'explore'], path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z' },
  { id: 'anchor', name: 'Anchor', keywords: ['marine', 'port', 'ship', 'nautical'], path: 'M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 8v14M5 12H2a10 10 0 0 0 20 0h-3' },
  { id: 'flag', name: 'Flag', keywords: ['country', 'mark', 'milestone'], path: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7' },
  { id: 'train', name: 'Train', keywords: ['railway', 'transport', 'transit'], path: 'M4 11V5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6M4 11h16M4 11v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5M9 22l-2-3M15 22l2-3M9 15h0M15 15h0' },
];

const TOOLS: IconEntry[] = [
  { id: 'wrench', name: 'Wrench', keywords: ['tool', 'settings', 'configure', 'repair'], path: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
  { id: 'settings', name: 'Settings', keywords: ['gear', 'configure', 'options', 'preferences'], path: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  { id: 'key', name: 'Key', keywords: ['password', 'access', 'lock', 'security'], path: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
  { id: 'lock', name: 'Lock', keywords: ['security', 'private', 'password'], path: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4' },
  { id: 'scissors', name: 'Scissors', keywords: ['cut', 'trim', 'edit'], path: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12' },
  { id: 'hammer', name: 'Hammer', keywords: ['build', 'tool', 'construct', 'work'], path: 'M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9M17.64 15L22 10.64M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5L14.5 4 9 2l1 7 4.88 4.88c.86.86 1.36 1.12 2.25.93l1.25-.25' },
  { id: 'filter', name: 'Filter', keywords: ['sort', 'funnel', 'refine'], path: 'M22 3H2l8 9.46V19l4 2v-8.54z' },
  { id: 'clipboard', name: 'Clipboard', keywords: ['copy', 'paste', 'task', 'list'], path: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z' },
  { id: 'bookmark', name: 'Bookmark', keywords: ['save', 'favorite', 'mark'], path: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
];

const HEALTH: IconEntry[] = [
  { id: 'activity', name: 'Activity', keywords: ['health', 'pulse', 'heartbeat', 'monitor'], path: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { id: 'stethoscope', name: 'Stethoscope', keywords: ['doctor', 'medical', 'health'], path: 'M6 18a4 4 0 0 0 8 0c0-3.5-4-3.5-4-7V4M8 4H6a2 2 0 0 1 0-4h2M14 4h2a2 2 0 0 0 0-4h-2M18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 14v4' },
  { id: 'pill', name: 'Pill', keywords: ['medicine', 'drug', 'pharmacy', 'health'], path: 'M10.5 1.5l-8 8a5.66 5.66 0 0 0 8 8l8-8a5.66 5.66 0 0 0-8-8zM6 14l8-8' },
  { id: 'dumbbell', name: 'Dumbbell', keywords: ['fitness', 'exercise', 'gym', 'workout'], path: 'M6.5 6.5a2.5 2.5 0 0 0-5 0v11a2.5 2.5 0 0 0 5 0M17.5 6.5v11a2.5 2.5 0 0 0 5 0v-11a2.5 2.5 0 0 0-5 0M6.5 12h11' },
  { id: 'eye', name: 'Eye', keywords: ['view', 'see', 'watch', 'visible'], path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { id: 'brain', name: 'Brain', keywords: ['mind', 'intelligence', 'think', 'knowledge'], path: 'M12 2a5 5 0 0 1 5 5v1a3 3 0 0 1 3 3 3 3 0 0 1-1 2.2A4 4 0 0 1 16 18h-1M12 2a5 5 0 0 0-5 5v1a3 3 0 0 0-3 3 3 3 0 0 0 1 2.2A4 4 0 0 0 8 18h1M12 2v20' },
  { id: 'thermometer', name: 'Thermometer', keywords: ['temperature', 'weather', 'health'], path: 'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z' },
];

const FOOD: IconEntry[] = [
  { id: 'coffee', name: 'Coffee', keywords: ['drink', 'cafe', 'beverage', 'cup'], path: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3' },
  { id: 'utensils', name: 'Utensils', keywords: ['food', 'restaurant', 'dining', 'eat'], path: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zM18 15v7' },
  { id: 'pizza', name: 'Pizza', keywords: ['food', 'fast food', 'restaurant'], path: 'M12 2L2 19.5h20zM9 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  { id: 'wine', name: 'Wine', keywords: ['drink', 'alcohol', 'glass', 'celebration'], path: 'M8 22h8M12 18v4M12 18a7 7 0 0 0 7-7c0-2-1-3-1-5H6c0 2-1 3-1 5a7 7 0 0 0 7 7z' },
  { id: 'apple', name: 'Apple', keywords: ['fruit', 'food', 'health', 'organic'], path: 'M12 2C9 2 6 5 6 9c0 5 3 11 6 11s6-6 6-11c0-4-3-7-6-7zM12 2c-1-1.5-3-2-5-2M10 6c1-1 3-1 4 0' },
  { id: 'cake', name: 'Cake', keywords: ['birthday', 'celebration', 'dessert', 'party'], path: 'M2 22h20v-5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3zM12 3v4M8 7h8a4 4 0 0 1 4 4v3H4v-3a4 4 0 0 1 4-4zM12 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
];

const MISC: IconEntry[] = [
  { id: 'star', name: 'Star', keywords: ['favorite', 'rating', 'important'], path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
  { id: 'lightning-bolt', name: 'Bolt', keywords: ['energy', 'power', 'quick', 'flash'], path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'target', name: 'Target', keywords: ['goal', 'focus', 'aim', 'objective'], path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { id: 'clock', name: 'Clock', keywords: ['time', 'schedule', 'hour', 'watch'], path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2' },
  { id: 'calendar', name: 'Calendar', keywords: ['date', 'schedule', 'event', 'plan'], path: 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 2v4M8 2v4M4 10h16' },
  { id: 'check-circle', name: 'Check Circle', keywords: ['done', 'success', 'complete', 'verified'], path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3' },
  { id: 'x-circle', name: 'X Circle', keywords: ['close', 'cancel', 'error', 'remove'], path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6' },
  { id: 'info', name: 'Info', keywords: ['information', 'help', 'about', 'details'], path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h0' },
  { id: 'alert-triangle', name: 'Warning', keywords: ['alert', 'danger', 'caution', 'error'], path: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h0' },
  { id: 'circle', name: 'Circle', keywords: ['dot', 'shape', 'empty', 'record'], path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z' },
  { id: 'square', name: 'Square', keywords: ['shape', 'box', 'container'], path: 'M3 3h18v18H3z' },
  { id: 'hexagon', name: 'Hexagon', keywords: ['shape', 'polygon', 'container'], path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { id: 'layers', name: 'Layers', keywords: ['stack', 'group', 'category', 'depth'], path: 'M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'grid', name: 'Grid', keywords: ['layout', 'table', 'matrix', 'tiles'], path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'sparkles', name: 'Sparkles', keywords: ['new', 'magic', 'ai', 'special'], path: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM5 3l.7 2.1L8 6l-2.3.9L5 9l-.7-2.1L2 6l2.3-.9zM18 15l.7 2.1L21 18l-2.3.9L18 21l-.7-2.1L15 18l2.3-.9z' },
  { id: 'rocket', name: 'Rocket', keywords: ['launch', 'startup', 'speed', 'project'], path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' },
  { id: 'infinity', name: 'Infinity', keywords: ['loop', 'unlimited', 'forever', 'eternal'], path: 'M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z' },
];

// ────────────────────────────────────────────────────────────────────────────
// EXPORTED GROUPS
// ────────────────────────────────────────────────────────────────────────────

export const ICON_GROUPS: IconGroup[] = [
  { id: 'business', label: 'Business & Finance', tab: 'Business', icons: BUSINESS },
  { id: 'technology', label: 'Technology', tab: 'Tech', icons: TECHNOLOGY },
  { id: 'communication', label: 'Communication', tab: 'Comms', icons: COMMUNICATION },
  { id: 'people', label: 'People & Social', tab: 'People', icons: PEOPLE },
  { id: 'media', label: 'Media & Creative', tab: 'Media', icons: MEDIA },
  { id: 'shopping', label: 'Shopping & Commerce', tab: 'Shopping', icons: SHOPPING },
  { id: 'nature', label: 'Nature & Energy', tab: 'Nature', icons: NATURE },
  { id: 'travel', label: 'Travel & Places', tab: 'Travel', icons: TRAVEL },
  { id: 'tools', label: 'Tools & Utility', tab: 'Tools', icons: TOOLS },
  { id: 'health', label: 'Health & Science', tab: 'Health', icons: HEALTH },
  { id: 'food', label: 'Food & Drink', tab: 'Food', icons: FOOD },
  { id: 'misc', label: 'Miscellaneous', tab: 'Misc', icons: MISC },
];

/** Flat lookup map: icon id → IconEntry */
export const ICON_MAP: Map<string, IconEntry> = new Map(
  ICON_GROUPS.flatMap((g) => g.icons.map((i) => [i.id, i]))
);

/** Total icon count across all groups. */
export const ICON_COUNT = ICON_GROUPS.reduce((t, g) => t + g.icons.length, 0);
