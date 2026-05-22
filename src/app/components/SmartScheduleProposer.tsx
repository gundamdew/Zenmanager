/**
 * SmartScheduleProposer — AI-generated optimal work shifts based on the
 * user's synced university schedule (USOS/Google Calendar).
 *
 * Sections:
 *  1. Sync header + AI insight summary
 *  2. Weekly vertical list of day cards mixing fixed study/exam blocks
 *     (muted, non-editable) and proposed work shifts (dashed accent,
 *     Accept / Edit / Reject quick actions).
 *  3. Per-day energy & rest indicators.
 *  4. Regenerate button + optimization filter chips.
 */
import { useMemo, useState } from 'react';
import {
  Calendar,
  Zap,
  Briefcase,
  Check,
  X,
  Clock,
  RefreshCw,
  Sparkles,
  GraduationCap,
  BookOpen,
  Moon,
  ChevronLeft,
  Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { PhoneFrame } from './PhoneFrame';
import { AppBottomNav } from './AppBottomNav';

// ─── Design tokens (shared language across ZenSync) ───────────────────────────
const T = {
  primary: '#4F63D2',
  primarySoft: '#EEF0FD',
  primaryDeep: '#3B4FBF',
  accent: '#7CC8A4',
  accentSoft: '#E8F7F0',
  bg: '#F5F4F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F9F8F6',
  text: '#1A1A2E',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  warn: '#F59E0B',
  warnSoft: '#FFFBEB',
  danger: '#EF4444',
};

const CATEGORY_COLORS = {
  lecture: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', dot: '#3B82F6' },
  exam:    { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
  work:    { bg: '#ECFDF5', border: '#10B981', text: '#065F46', dot: '#10B981' },
} as const;

const FONT = "'DM Sans', sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = 'pending' | 'accepted' | 'rejected';

interface Block {
  id: string;
  kind: 'lecture' | 'exam' | 'work';
  title: string;
  meta?: string;
  start: string;
  end: string;
  proposed?: boolean;
  status?: Status;
}

interface DayPlan {
  id: string;
  label: string;       // "Mon"
  date: string;        // "Nov 18"
  isHeavy?: boolean;   // exam day flag
  energy: number;      // 0–100 predicted energy after shift
  restHours: number;   // guaranteed rest hours after the day's last block
  blocks: Block[];
}

// ─── Mock plan (deterministic for demo) ───────────────────────────────────────
const INITIAL_WEEK: DayPlan[] = [
  {
    id: 'mon', label: 'Mon', date: 'Nov 18',
    energy: 78, restHours: 11,
    blocks: [
      { id: 'm1', kind: 'lecture', title: 'Algorithms', meta: 'Lecture · Room 204', start: '08:00', end: '09:30' },
      { id: 'm2', kind: 'lecture', title: 'Databases',  meta: 'Lab · Room 118',    start: '10:00', end: '12:00' },
      { id: 'm3', kind: 'work',    title: 'Barista shift', meta: 'Café Mela · 1.2 km',
        start: '15:00', end: '19:00', proposed: true, status: 'pending' },
    ],
  },
  {
    id: 'tue', label: 'Tue', date: 'Nov 19',
    isHeavy: true,
    energy: 42, restHours: 13,
    blocks: [
      { id: 't1', kind: 'exam',    title: 'Statistics — Midterm', meta: 'Hall A', start: '09:00', end: '11:00' },
      { id: 't2', kind: 'lecture', title: 'Operating Systems',    meta: 'Room 301', start: '13:00', end: '14:30' },
    ],
  },
  {
    id: 'wed', label: 'Wed', date: 'Nov 20',
    energy: 65, restHours: 10,
    blocks: [
      { id: 'w1', kind: 'lecture', title: 'Networking', meta: 'Lab · Room 220', start: '10:00', end: '13:00' },
      { id: 'w2', kind: 'work',    title: 'Remote support', meta: 'TechHelp · Home',
        start: '16:00', end: '20:00', proposed: true, status: 'pending' },
    ],
  },
  {
    id: 'thu', label: 'Thu', date: 'Nov 21',
    isHeavy: true,
    energy: 38, restHours: 14,
    blocks: [
      { id: 'th1', kind: 'exam', title: 'Algorithms — Quiz', meta: 'Room 204', start: '11:00', end: '12:30' },
      { id: 'th2', kind: 'lecture', title: 'Discrete Math', meta: 'Room 110', start: '14:00', end: '15:30' },
    ],
  },
  {
    id: 'fri', label: 'Fri', date: 'Nov 22',
    energy: 71, restHours: 12,
    blocks: [
      { id: 'f1', kind: 'lecture', title: 'Software Engineering', meta: 'Room 305', start: '09:00', end: '11:00' },
      { id: 'f2', kind: 'work',    title: 'Barista shift', meta: 'Café Mela · 1.2 km',
        start: '14:00', end: '18:00', proposed: true, status: 'pending' },
    ],
  },
  {
    id: 'sat', label: 'Sat', date: 'Nov 23',
    energy: 84, restHours: 12,
    blocks: [
      { id: 's1', kind: 'work', title: 'Barista shift', meta: 'Café Mela · Weekend rate',
        start: '10:00', end: '16:00', proposed: true, status: 'pending' },
    ],
  },
  {
    id: 'sun', label: 'Sun', date: 'Nov 24',
    energy: 92, restHours: 16,
    blocks: [],
  },
];

const FILTERS = [
  { id: 'sleep',  label: 'Prioritize Sleep',     Icon: Moon },
  { id: 'income', label: 'Maximize Income',      Icon: Briefcase },
  { id: 'longer', label: 'Fewer, longer shifts', Icon: Clock },
];

// ─── Utility components ───────────────────────────────────────────────────────
function EnergyBar({ value }: { value: number }) {
  const color = value >= 70 ? T.accent : value >= 50 ? T.warn : T.danger;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Zap size={12} color={color} strokeWidth={2.4} />
      <div style={{
        width: 56, height: 5, borderRadius: 999, background: T.borderSoft, overflow: 'hidden',
      }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.textSec, fontFamily: FONT }}>
        {value}%
      </span>
    </div>
  );
}

function RestBadge({ hours }: { hours: number }) {
  const ok = hours >= 11;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: ok ? T.accentSoft : T.warnSoft,
      color: ok ? '#1F7A53' : '#92400E',
      fontSize: 10.5, fontWeight: 600, fontFamily: FONT,
      border: `1px solid ${ok ? '#C6ECD8' : '#FDE68A'}`,
    }}>
      <Moon size={11} strokeWidth={2.4} />
      {hours}h rest
    </div>
  );
}

// ─── Block row ────────────────────────────────────────────────────────────────
interface BlockRowProps {
  block: Block;
  onAccept: () => void;
  onReject: () => void;
}

function BlockRow({ block, onAccept, onReject }: BlockRowProps) {
  const c = CATEGORY_COLORS[block.kind];
  const Icon = block.kind === 'work' ? Briefcase
            : block.kind === 'exam' ? BookOpen
            : GraduationCap;

  const isProposalPending = block.proposed && block.status === 'pending';
  const isAccepted        = block.proposed && block.status === 'accepted';
  const isRejected        = block.proposed && block.status === 'rejected';

  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'stretch',
      opacity: isRejected ? 0.45 : 1,
      transition: 'opacity 0.2s ease',
    }}>
      {/* Time rail */}
      <div style={{
        width: 44, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        paddingTop: 10,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.text, fontFamily: FONT }}>
          {block.start}
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, fontFamily: FONT }}>
          {block.end}
        </span>
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: isProposalPending ? T.surface : c.bg,
        borderRadius: 12,
        padding: '10px 12px',
        border: isProposalPending
          ? `1.5px dashed ${c.border}`
          : `1px solid ${c.border}`,
        position: 'relative',
        textDecoration: isRejected ? 'line-through' : 'none',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: isProposalPending ? c.bg : 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={13} color={c.text} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: c.text,
              fontFamily: FONT, letterSpacing: '-0.1px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {block.title}
            </div>
            {block.meta && (
              <div style={{
                fontSize: 10.5, color: T.textSec, fontFamily: FONT, marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {block.meta}
              </div>
            )}
          </div>

          {/* Status tag */}
          {block.proposed ? (
            isAccepted ? (
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: '#065F46',
                background: '#A7F3D0', padding: '3px 7px', borderRadius: 999,
                fontFamily: FONT, letterSpacing: '0.3px',
              }}>
                ACCEPTED
              </span>
            ) : isRejected ? (
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: '#991B1B',
                background: '#FECACA', padding: '3px 7px', borderRadius: 999,
                fontFamily: FONT, letterSpacing: '0.3px',
              }}>
                REJECTED
              </span>
            ) : (
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: T.primary,
                background: T.primarySoft, padding: '3px 7px', borderRadius: 999,
                fontFamily: FONT, letterSpacing: '0.3px',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <Sparkles size={9} strokeWidth={2.6} />
                AI
              </span>
            )
          ) : (
            <span style={{
              fontSize: 9.5, fontWeight: 600, color: T.textMuted,
              fontFamily: FONT, letterSpacing: '0.3px',
            }}>
              FIXED
            </span>
          )}
        </div>

        {/* Action row — only for pending proposals */}
        {isProposalPending && (
          <div style={{
            display: 'flex', gap: 6, marginTop: 10,
            paddingTop: 10, borderTop: `1px dashed ${T.border}`,
          }}>
            <button
              onClick={onAccept}
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '7px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: T.primary, color: '#fff', fontSize: 11.5, fontWeight: 600,
                fontFamily: FONT, outline: 'none',
              }}
            >
              <Check size={13} strokeWidth={2.6} /> Accept
            </button>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '7px 10px', borderRadius: 8,
                border: `1px solid ${T.border}`, cursor: 'pointer',
                background: T.surface, color: T.textSec, fontSize: 11.5, fontWeight: 500,
                fontFamily: FONT, outline: 'none',
              }}
            >
              <Pencil size={12} strokeWidth={2.2} /> Edit
            </button>
            <button
              onClick={onReject}
              aria-label="Reject proposal"
              style={{
                width: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '7px 0', borderRadius: 8,
                border: `1px solid ${T.border}`, cursor: 'pointer',
                background: T.surface, color: T.danger,
                outline: 'none',
              }}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function SmartScheduleProposer() {
  const navigate = useNavigate();
  const [week, setWeek] = useState<DayPlan[]>(INITIAL_WEEK);
  const [activeFilter, setActiveFilter] = useState<string>('sleep');
  const [regenerating, setRegenerating] = useState(false);

  const proposedCount = useMemo(
    () => week.reduce((n, d) => n + d.blocks.filter(b => b.proposed && b.status === 'pending').length, 0),
    [week],
  );
  const acceptedCount = useMemo(
    () => week.reduce((n, d) => n + d.blocks.filter(b => b.proposed && b.status === 'accepted').length, 0),
    [week],
  );

  const updateBlock = (dayId: string, blockId: string, status: Status) => {
    setWeek(prev => prev.map(d => d.id !== dayId ? d : {
      ...d,
      blocks: d.blocks.map(b => b.id !== blockId ? b : { ...b, status }),
    }));
  };

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setWeek(INITIAL_WEEK.map(d => ({ ...d, blocks: d.blocks.map(b => ({ ...b })) })));
      setRegenerating(false);
    }, 900);
  };

  return (
    <PhoneFrame statusBarBg={T.bg}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: T.bg, overflow: 'hidden', fontFamily: FONT,
      }}>
        {/* ── Top bar ── */}
        <div style={{
          padding: '12px 20px 8px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: T.bg,
        }}>
          <button
            onClick={() => navigate('/schedule')}
            aria-label="Back"
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: T.surface, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <ChevronLeft size={18} color={T.text} strokeWidth={2.2} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-0.3px' }}>
              Smart Work Schedule
            </div>
            <div style={{ fontSize: 11.5, color: T.textSec, marginTop: 1 }}>
              Week of Nov 18 — Nov 24
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px' }}>
          {/* ── Sync status + AI insight ── */}
          <div style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDeep} 100%)`,
            borderRadius: 18, padding: 16, color: '#fff',
            marginTop: 8, marginBottom: 16,
            boxShadow: '0 10px 30px -12px rgba(79,99,210,0.55)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* decorative glow */}
            <div style={{
              position: 'absolute', right: -30, top: -40, width: 140, height: 140,
              borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(4px)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar size={14} color="#fff" strokeWidth={2.4} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2px' }}>
                  USOS · Google Calendar synced
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.78, marginTop: 1 }}>
                  Updated 2 min ago · 14 events imported
                </div>
              </div>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: '#7CC8A4',
                boxShadow: '0 0 0 3px rgba(124,200,164,0.3)',
              }} />
            </div>

            <div style={{
              marginTop: 14, padding: 12,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 12,
              display: 'flex', gap: 10, alignItems: 'flex-start',
              position: 'relative',
            }}>
              <Sparkles size={16} color="#fff" strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>
                  Heavy exam week detected. Optimizing for rest.
                </div>
                <div style={{ fontSize: 11, opacity: 0.82, marginTop: 4, lineHeight: 1.4 }}>
                  Proposed {proposedCount + acceptedCount} shifts (~18h) avoiding Tue &amp; Thu exam days,
                  with min. 11h rest between study and work.
                </div>
              </div>
            </div>
          </div>

          {/* ── Weekly day cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {week.map(day => (
              <div key={day.id} style={{
                background: T.surface, borderRadius: 16,
                border: `1px solid ${T.borderSoft}`,
                padding: 14, boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
              }}>
                {/* Day header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.2px' }}>
                      {day.label}
                    </span>
                    <span style={{ fontSize: 11.5, color: T.textMuted, fontWeight: 500 }}>
                      {day.date}
                    </span>
                    {day.isHeavy && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, color: '#92400E',
                        background: '#FDE68A', padding: '2px 6px', borderRadius: 6,
                        letterSpacing: '0.3px', marginLeft: 2,
                      }}>
                        EXAM DAY
                      </span>
                    )}
                  </div>
                  <RestBadge hours={day.restHours} />
                </div>

                {/* Energy bar */}
                <div style={{ marginBottom: 12 }}>
                  <EnergyBar value={day.energy} />
                </div>

                {/* Blocks */}
                {day.blocks.length === 0 ? (
                  <div style={{
                    padding: '14px 12px',
                    border: `1px dashed ${T.border}`,
                    borderRadius: 12,
                    fontSize: 12, color: T.textMuted,
                    textAlign: 'center', fontWeight: 500,
                  }}>
                    Reserved as a recovery day · no shifts proposed
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {day.blocks.map(b => (
                      <BlockRow
                        key={b.id}
                        block={b}
                        onAccept={() => updateBlock(day.id, b.id, 'accepted')}
                        onReject={() => updateBlock(day.id, b.id, 'rejected')}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Controls ── */}
          <div style={{
            marginTop: 20, padding: 16,
            background: T.surface, borderRadius: 16,
            border: `1px solid ${T.borderSoft}`,
          }}>
            <button
              onClick={regenerate}
              disabled={regenerating}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: T.text, color: '#fff', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13.5, fontWeight: 600, fontFamily: FONT,
                outline: 'none',
                opacity: regenerating ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <RefreshCw
                size={15} strokeWidth={2.4}
                style={{
                  animation: regenerating ? 'zs-spin 0.9s linear infinite' : undefined,
                }}
              />
              {regenerating ? 'Regenerating…' : 'Regenerate Proposal'}
            </button>

            <div style={{
              fontSize: 10.5, fontWeight: 600, color: T.textMuted,
              letterSpacing: '0.6px', marginTop: 14, marginBottom: 8,
            }}>
              OPTIMIZE FOR
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FILTERS.map(({ id, label, Icon }) => {
                const active = activeFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '7px 11px', borderRadius: 999,
                      border: `1px solid ${active ? T.primary : T.border}`,
                      background: active ? T.primarySoft : T.surface,
                      color: active ? T.primary : T.textSec,
                      fontSize: 11.5, fontWeight: 600, fontFamily: FONT,
                      cursor: 'pointer', outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={12} strokeWidth={2.3} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* keyframes (scoped via style tag) */}
          <style>{`
            @keyframes zs-spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>

        <AppBottomNav />
      </div>
    </PhoneFrame>
  );
}
