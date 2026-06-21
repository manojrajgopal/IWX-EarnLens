/* ────────────────────────────────────────────────────────────
   Welcome experience — shared type contracts.
   Every branch (section) and leaf (card/tile) of the welcome
   tree speaks through these shapes, so the whole feature stays
   connected to one vocabulary.
   ──────────────────────────────────────────────────────────── */

/** A single product capability rendered as an animated showcase card. */
export interface FeatureNode {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  /** What problem this solves, framed for the user. */
  benefit: string;
  /** Deep-link into the app so the card doubles as navigation. */
  route: string;
  cta: string;
  /** Accent colour used for the icon halo + hover glow. */
  accent: string;
}

/** A navigable destination tile in the navigation hub. */
export interface NavTile {
  id: string;
  icon: string;
  label: string;
  description: string;
  route: string;
  accent: string;
}

/** A grouped cluster of navigation tiles (a branch of the nav tree). */
export interface NavCluster {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tiles: NavTile[];
}

/** A step in the "how to use" cinematic journey. */
export interface JourneyStep {
  index: number;
  icon: string;
  title: string;
  description: string;
  route: string;
  cta: string;
}

/** A motivational pillar — the "why" behind EarnLens. */
export interface ValuePillar {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** A frequently asked question for the knowledge section. */
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

/** A non-sensitive engagement metric about the signed-in user. */
export interface PulseMetric {
  id: string;
  icon: string;
  label: string;
  value: number;
  hint: string;
  accent: string;
}

/** A scene in the self-contained intro film. */
export interface FilmScene {
  index: number;
  icon: string;
  title: string;
  caption: string;
  accent: string;
}
