import { useState, useEffect, CSSProperties } from 'react';
import { Wifi } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  statusBarBg?: string;
  statusTextColor?: string;
}

export function PhoneFrame({
  children,
  statusBarBg = 'transparent',
  statusTextColor = '#1A1A2E',
}: PhoneFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = now.getMinutes().toString().padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const desktopBg: CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4F63D2 80%, #7C3AED 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const frameStyle: CSSProperties = {
    width: 390,
    height: 844,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    boxShadow:
      '0 0 0 14px #1C1C1E, 0 60px 130px rgba(0,0,0,0.7), 0 20px 40px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    background: '#F5F4F0',
    flexShrink: 0,
  };

  return (
    <div style={desktopBg}>
      <div style={frameStyle}>
        {/* ── Status Bar ── */}
        <div
          style={{
            height: 54,
            background: statusBarBg,
            paddingLeft: 24,
            paddingRight: 20,
            paddingTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 126,
              height: 36,
              background: '#000',
              borderRadius: 22,
              zIndex: 10,
            }}
          />
          {/* Time */}
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.3px',
              color: statusTextColor,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {time}
          </span>
          {/* System icons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
              <rect x="0" y="8" width="3" height="5" rx="1" fill={statusTextColor} />
              <rect x="4.5" y="5.5" width="3" height="7.5" rx="1" fill={statusTextColor} />
              <rect x="9" y="2.5" width="3" height="10.5" rx="1" fill={statusTextColor} />
              <rect x="13.5" y="0" width="3" height="13" rx="1" fill={statusTextColor} />
            </svg>
            <Wifi size={15} color={statusTextColor} strokeWidth={2.5} />
            {/* Battery */}
            <div
              style={{
                width: 27,
                height: 13,
                border: `1.5px solid ${statusTextColor}`,
                borderRadius: 3.5,
                padding: '1.5px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 2.5,
                  height: 6,
                  background: statusTextColor,
                  borderRadius: '0 1.5px 1.5px 0',
                }}
              />
              <div
                style={{
                  width: '78%',
                  height: '100%',
                  background: statusTextColor,
                  borderRadius: 1.5,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Screen Content ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
