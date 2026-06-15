/**
 * AppBottomNav — shared navigation bar used across all main screens.
 * The centre "+" FAB opens a two-option action sheet above the bar:
 *   • Add Manually  → triggers the onAdd callback (opens the Add Task modal)
 *   • Zen-Proposer  → navigates to /smart
 * The backdrop uses position:absolute with a large negative top offset so that
 * PhoneFrame's overflow:hidden clips it to the phone boundaries (never bleeds
 * onto the desktop background).
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home, CalendarDays, Plus, BarChart2, User,
  Pen, Sparkles, ChevronRight,
} from 'lucide-react';
import { AddTaskModal, NewTask } from './AddTaskModal';
import { T, BRAND_GRADIENT } from '../theme/glass';

interface AppBottomNavProps {
  /** Optional callback for "Add Manually". Falls back to navigating to /dashboard. */
  onAdd?: () => void;
}

export function AppBottomNav({ onAdd }: AppBottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [localModalOpen, setLocalModalOpen] = useState(false);

  const navItems = [
    { id: 'home',     Icon: Home,        label: 'Home',     path: '/dashboard' },
    { id: 'schedule', Icon: CalendarDays, label: 'Schedule', path: '/schedule'  },
    { id: 'add',      Icon: null,         label: '',         path: null         },
    { id: 'stats',    Icon: BarChart2,    label: 'Stats',    path: '/stats'     },
    { id: 'profile',  Icon: User,         label: 'Profile',  path: '/profile'   },
  ];

  const closeMenu = () => setMenuOpen(false);

  const handleAddManually = () => {
    closeMenu();
    if (onAdd) {
      onAdd();
    } else {
      setLocalModalOpen(true);
    }
  };

  const handleZenProposer = () => {
    closeMenu();
    navigate('/smart');
  };

  return (
    /*
     * position:relative creates the containing block for all absolutely-
     * positioned children (backdrop + action card). zIndex:46 puts this
     * entire layer above all screen content (RegenFAB at 30, sticky
     * headers at 10, etc.) but ancestor overflow:hidden clips the
     * backdrop so it never bleeds outside the PhoneFrame.
     */
    <div style={{ position: 'relative', zIndex: 46, flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      {/*
       * top:-2000px extends way above this wrapper; PhoneFrame's
       * overflow:hidden clips it to the phone content area.
       * left/right overshoot ensures full-width coverage despite any
       * wrapper horizontal constraints.
       */}
      <div
        onClick={closeMenu}
        style={{
          position: 'absolute',
          top: -2000,
          bottom: 0,
          left: -200,
          right: -200,
          background: 'rgba(26,26,46,0.52)',
          zIndex: 1,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* ── Action card ─────────────────────────────────────────────────────── */}
      {/*
       * bottom:100% floats the card flush above the nav bar.
       * Springy cubic-bezier gives it a tactile "pop" on open.
       */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 14,
          right: 14,
          marginBottom: 16,
          zIndex: 3,
          transform: menuOpen
            ? 'translateY(0) scale(1)'
            : 'translateY(22px) scale(0.93)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition:
            'transform 0.3s cubic-bezier(0.34,1.5,0.64,1), opacity 0.18s ease',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Pill handle above card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{
            width: 36, height: 4, borderRadius: 9999,
            background: 'rgba(255,255,255,0.35)',
          }} />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderRadius: 26,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow:
            '0 16px 40px rgba(31,38,55,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}>

          {/* Section label */}
          <div style={{ padding: '18px 22px 10px' }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Add to your plan
            </p>
          </div>

          {/* ── Option: Add Manually ── */}
          <ActionRow
            onClick={handleAddManually}
            icon={
              <div style={{
                width: 46, height: 46, borderRadius: 15,
                background: T.surfaceAlt,
                border: `1.5px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Pen size={19} color={T.textSec} strokeWidth={2} />
              </div>
            }
            title="Add Manually"
            subtitle="Create a task or time block"
            titleColor={T.text}
            bg="transparent"
            bgHover={T.bg}
          />

          {/* Divider */}
          <div style={{ height: 1, background: T.borderSoft, margin: '0 22px' }} />

          {/* ── Option: Zen-Proposer ── */}
          <ActionRow
            onClick={handleZenProposer}
            icon={
              <div style={{
                width: 46, height: 46, borderRadius: 15,
                background: BRAND_GRADIENT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 18px rgba(16,185,129,0.10)`,
              }}>
                <Sparkles size={20} color="#fff" strokeWidth={2} />
              </div>
            }
            title="Zen-Proposer"
            subtitle="Let AI optimise your full day"
            titleColor={T.primary}
            bg={T.primarySoft}
            bgHover="#E4E8FB"
            badge="AI"
          />

          <div style={{ height: 10 }} />
        </div>
      </div>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 72,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.55)',
          boxShadow: '0 -8px 24px rgba(31,38,55,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 4,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {navItems.map((item) => {

          /* ── Centre FAB ── */
          if (item.id === 'add') {
            return (
              <div key="add" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  style={{
                    width: 54, height: 54,
                    borderRadius: 18,
                    background: menuOpen
                      ? T.text
                      : BRAND_GRADIENT,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: menuOpen
                      ? '0 8px 24px rgba(34,34,34,0.25)'
                      : '0 8px 22px rgba(16,185,129,0.10)',
                    transform: 'translateY(-10px)',
                    transition: 'background 0.22s ease, box-shadow 0.22s ease',
                    outline: 'none',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Rotating icon: + becomes × at 45° */}
                  <div style={{
                    transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Plus size={24} color="#fff" strokeWidth={2.5} />
                  </div>
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
              onClick={() => {
                if (item.path) navigate(item.path);
                closeMenu();
              }}
              style={{
                flex: 1,
                minHeight: 'var(--zs-touch-min, 48px)',
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

      <style>{`
        @keyframes zs-row-press {
          from { background: var(--bg-hover); }
          to   { background: var(--bg-hover); }
        }
      `}</style>

      {/* Modal for non-dashboard screens — uses position:fixed so DOM nesting doesn't matter */}
      <AddTaskModal
        open={localModalOpen}
        onClose={() => setLocalModalOpen(false)}
        onSave={(_task: NewTask) => setLocalModalOpen(false)}
      />
    </div>
  );
}

// ─── ActionRow ────────────────────────────────────────────────────────────────
function ActionRow({
  onClick, icon, title, subtitle, titleColor, bg, bgHover, badge,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleColor: string;
  bg: string;
  bgHover: string;
  badge?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
      style={{
        width: '100%',
        minHeight: 72,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 22px',
        background: hover ? bgHover : bg,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        outline: 'none',
        transition: 'background 0.15s ease',
      }}
    >
      {/* Icon */}
      {icon}

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <p style={{
            fontSize: 16, fontWeight: 700, color: titleColor,
            letterSpacing: '-0.35px', lineHeight: 1,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {title}
          </p>
          {badge && (
            <span style={{
              background: T.primary, color: '#fff',
              borderRadius: 20, padding: '2px 8px',
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.04em',
              lineHeight: 1.6,
            }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{
          fontSize: 12, color: T.textMuted, lineHeight: 1.4,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {subtitle}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight size={16} color={T.textMuted} style={{ flexShrink: 0 }} />
    </button>
  );
}
