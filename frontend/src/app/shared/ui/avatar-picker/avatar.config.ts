/** Predefined avatars users can pick from on their profile. */

export interface AvatarOption {
  id: string;
  url: string;
  label: string;
}

/**
 * DiceBear Adventurer-Neutral style avatars — friendly, gender-neutral
 * illustrations that render as SVG from a CDN (no local assets needed).
 */
const SEEDS = [
  'Willow', 'Jasper', 'Luna', 'Felix', 'Sage', 'Nova',
  'Milo', 'Ivy', 'Orion', 'Hazel', 'River', 'Sky',
  'Ember', 'Rowan', 'Wren', 'Oakley', 'Aspen', 'Cedar',
  'Rain', 'Storm', 'Blaze', 'Coral', 'Fern', 'Pearl',
] as const;

const STYLE = 'adventurer-neutral';
const BASE = `https://api.dicebear.com/9.x/${STYLE}/svg`;

export const AVATAR_OPTIONS: AvatarOption[] = SEEDS.map((seed) => ({
  id: seed.toLowerCase(),
  url: `${BASE}?seed=${seed}`,
  label: seed,
}));
