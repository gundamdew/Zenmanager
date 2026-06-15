/**
 * Aurora — ambient colour-field backdrop rendered behind all glass surfaces.
 * Soft, slowly drifting blurred blobs in the brand greens (plus a cool tint)
 * give the Liquid Glass layers something real to refract and saturate.
 * Purely decorative: pointer-events none, sits at the bottom of the stack.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#F4F7F5',
      }}
    >
      {/* warm top-left green */}
      <div className="zs-aurora-blob" style={blob('-12%', '-8%', 360, 'rgba(46,204,113,0.55)', 'zs-drift-a')} />
      {/* emerald mid-right */}
      <div className="zs-aurora-blob" style={blob('55%', '8%', 320, 'rgba(16,185,129,0.45)', 'zs-drift-b')} />
      {/* cool teal lower-left for contrast */}
      <div className="zs-aurora-blob" style={blob('-10%', '58%', 380, 'rgba(45,212,191,0.40)', 'zs-drift-c')} />
      {/* soft sky tint bottom-right keeps it from going monochrome */}
      <div className="zs-aurora-blob" style={blob('48%', '62%', 340, 'rgba(125,211,252,0.35)', 'zs-drift-a')} />

      <style>{`
        @keyframes zs-drift-a {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(24px,30px) scale(1.08); }
        }
        @keyframes zs-drift-b {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-30px,22px) scale(1.1); }
        }
        @keyframes zs-drift-c {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(26px,-24px) scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          .zs-aurora-blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function blob(
  left: string,
  top: string,
  size: number,
  color: string,
  anim: string,
): React.CSSProperties {
  return {
    position: 'absolute',
    left,
    top,
    width: size,
    height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(255,255,255,0) 70%)`,
    filter: 'blur(40px)',
    animation: `${anim} 18s ease-in-out infinite`,
  };
}
