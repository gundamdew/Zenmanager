/**
 * ZenManager — shared design system primitives (Liquid Glass).
 * Single source of truth for tokens, the brand gradient, and the glass recipe.
 * Real glass needs vivid content behind it: <Aurora /> (rendered in PhoneFrame)
 * paints a soft colour field so the backdrop-blur + saturation actually read.
 */
import { CSSProperties } from 'react';

export const T = {
  primary: '#10B981',          // brand green (solid accent / active state)
  primarySoft: 'rgba(16,185,129,0.10)',
  primaryMid: 'rgba(16,185,129,0.25)',
  accent: '#2ECC71',
  accentSoft: 'rgba(46,204,113,0.10)',
  bg: '#FAFAFA',               // background base
  surface: 'rgba(255,255,255,0.55)',
  surfaceAlt: 'rgba(255,255,255,0.40)',
  text: '#222222',             // text primary
  textSec: '#717171',          // text secondary
  textMuted: '#9A9A9A',
  border: 'rgba(255,255,255,0.5)',  // glass hairline
  borderSoft: 'rgba(0,0,0,0.06)',
};

/** Brand gradient (accent) — primary CTAs & active states. */
export const BRAND_GRADIENT = 'linear-gradient(135deg, #2ECC71 0%, #10B981 100%)';

/**
 * Real Liquid Glass recipe.
 *  - translucent fill so the aurora bleeds through
 *  - backdrop blur + saturation = the "frosted" refraction
 *  - hairline white border + inset top highlight = the specular edge
 *  - soft, low-opacity drop shadow (kept <10% per design rules)
 * @param radius  corner radius (24 for large containers, 16 for inner)
 * @param strong  slightly more opaque fill for primary surfaces
 */
export function glass(radius = 24, strong = false): CSSProperties {
  return {
    background: strong
      ? 'rgba(255,255,255,0.62)'
      : 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: radius,
    boxShadow:
      '0 8px 24px rgba(31,38,55,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
  };
}

/** Convenience constant for the common 24px glass card. */
export const GLASS: CSSProperties = glass(24);
