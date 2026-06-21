/* ============================================================
   Header navigation models
   Recursive structure — a node can nest children to any depth.
   ============================================================ */

/** A single navigable node. May hold its own page (path) and/or
 *  children that open as a nested flyout dropdown. */
export interface NavNode {
  label: string;
  icon?: string;
  path?: string;
  description?: string;
  badge?: string;
  children?: NavNode[];
}

/** A top-level header button that opens a dropdown panel. */
export interface NavGroup {
  title: string;
  icon?: string;
  nodes: NavNode[];
}

/** A flattened entry used by the global search index. */
export interface SearchEntry {
  label: string;
  path: string;
  group: string;
  icon: string;
  keywords: string;
}
