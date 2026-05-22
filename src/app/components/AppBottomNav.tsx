/**
 * AppBottomNav — shared navigation bar used across all main screens.
 * Uses react-router's useNavigate + useLocation for active-state detection.
 */
import { useNavigate, useLocation } from 'react-router';
import { Home, CalendarDays, Plus, BarChart2, User } from 'lucide-react';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: '#4F63D2',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
};

interface AppBottomNavProps {
  /** Optional callback for the centre + FAB. Falls back to navigating to /dashboard. */
  onAdd?: () => void;
}

export function AppBottomNav({ onAdd }: AppBottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { id: 'home',     Icon: Home,        label: 'Home',     path: '/dashboard' },
    { id: 'schedule', Icon: CalendarDays, label: 'Schedule', path: '/schedule'  },
    { id: 'add',      Icon: null,         label: '',         path: null         },
    { id: 'stats',    Icon: BarChart2,    label: 'Stats',    path: '/stats'     },
    { id: 'profile',  Icon: User,         label: 'Profile',  path: '/profile'   },
  ];

  return (
    <>
      {/* ── Nav bar ── */}
      <div
        style={{
          height: 72,
          background: T.surface,
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 4,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {navItems.map((item) => {
          /* ── Centre FAB ── */
          if (item.id === 'add') {
            return (
              <div
                key="add"
                style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
              >
                <button
                  onClick={() => (onAdd ? onAdd() : navigate('/dashboard'))}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    background: T.primary,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(79,99,210,0.45)',
                    transform: 'translateY(-10px)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    outline: 'none',
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      'translateY(-8px) scale(0.94)';
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      'translateY(-10px) scale(1)';
                  }}
                >
                  <Plus size={24} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          /* ── Regular tab ── */
          const isActive = pathname === item.path;
          const { Icon } = item;

          return (
            <button
              key={item.id}
              onClick={() => item.path && navigate(item.path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
                color: isActive ? T.primary : T.textMuted,
                transition: 'color 0.2s ease',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                position: 'relative',
                paddingTop: 4,
              }}
            >
              {Icon && <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: isActive ? '-0.1px' : 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: T.primary,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── iOS home indicator ── */}
      <div
        style={{
          height: 28,
          background: T.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderTop: `1px solid ${T.borderSoft}`,
        }}
      >
        <div
          style={{
            width: 134,
            height: 5,
            background: T.text,
            borderRadius: 9999,
            opacity: 0.15,
          }}
        />
      </div>
    </>
  );
}
