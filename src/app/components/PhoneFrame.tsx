import { CSSProperties } from 'react';
import { Aurora } from './Aurora';

interface PhoneFrameProps {
  children: React.ReactNode;
  /** Accepted for backwards compatibility; no longer renders fake status-bar chrome. */
  statusBarBg?: string;
  statusTextColor?: string;
}

/**
 * Responsive app shell. Replaces the previous fixed 390×844 iPhone mock:
 * - On phones: fills the viewport using 100dvh + safe-area insets.
 * - On larger viewports: a centered, full-height card capped at 480px wide.
 * No simulated status bar, Dynamic Island, or device bezel — the surrounding
 * OS chrome owns those.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const outer: CSSProperties = {
    width: '100%',
    height: '100dvh',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    background: '#E9EFEA',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    overflow: 'hidden',
  };

  const shell: CSSProperties = {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
    paddingTop: 'env(safe-area-inset-top)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={outer}>
      <div style={shell}>
        {/* Ambient colour field — gives the glass layers something to refract */}
        <Aurora />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
