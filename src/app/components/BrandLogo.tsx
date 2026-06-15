/**
 * BrandLogo — the ZenManager mark, rebuilt from the imported Figma logo
 * (src/imports/Logo-1) as a clean, scalable component.
 *
 * The glyph is a stacked "zen coil"; the rounded tile uses the logo's own
 * green gradient (#9BFF8E → #5D9955) with the soft #C4C4C4 glyph stroke.
 * `wordmark` optionally renders the "ZenManager" text lockup beside it.
 */
import svgPaths from '../../imports/Logo-1/svg-pw47lqn4o9';
import { T } from '../theme/glass';

/** Brand colours sampled from the imported logo. */
export const LOGO_GRADIENT = 'linear-gradient(180deg, #9BFF8E 0%, #5D9955 100%)';
export const LOGO_GRADIENT_SOLID_FROM = '#9BFF8E';
export const LOGO_GRADIENT_SOLID_TO = '#5D9955';

export function BrandLogo({
  size = 40,
  rounded,
  wordmark = false,
  title = 'ZenManager',
  titleColor,
}: {
  size?: number;
  rounded?: number;
  wordmark?: boolean;
  title?: string;
  titleColor?: string;
}) {
  const radius = rounded ?? Math.round(size * 0.28);
  // Glyph occupies ~62% of the tile, centred (matches the Figma proportions).
  const glyph = size * 0.62;

  const tile = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: LOGO_GRADIENT,
        boxShadow: '0 4px 14px rgba(93,153,85,0.30), inset 0 1px 0 rgba(255,255,255,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={glyph}
        height={glyph * (39 / 44)}
        viewBox="0 0 44 39"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <g>
          {[svgPaths.pa58cc80, svgPaths.pa003400, svgPaths.p38b0ad70, svgPaths.p9c1d900].map(
            (d, i) => (
              <path
                key={i}
                d={d}
                stroke="rgba(255,255,255,0.92)"
                strokeLinejoin="round"
                strokeWidth={4}
              />
            ),
          )}
        </g>
      </svg>
    </div>
  );

  if (!wordmark) return tile;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.28) }}>
      {tile}
      <span
        style={{
          fontSize: Math.round(size * 0.5),
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: titleColor ?? T.text,
          lineHeight: 1,
        }}
      >
        {title}
      </span>
    </div>
  );
}
