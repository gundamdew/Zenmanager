/**
 * ScheduleScreen — imported calendar view (university + work).
 * Features:
 *  - Daily / Weekly view toggle (sticky header)
 *  - Vertical timeline (06:00–23:59) with absolutely-positioned event blocks
 *  - Source badges: "USOS" for lectures, role tag for work shifts
 *  - Conflict Indicator: Low Sleep Warning when a late work shift
 *    is immediately followed by an early-morning lecture next day
 */
import { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Coffee,
  Pencil,
  MapPin,
  Link,
  AlertTriangle,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { AppBottomNav } from './AppBottomNav';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: '#4F63D2', primarySoft: '#EEF0FD',
  accent: '#7CC8A4',  accentSoft: '#E8F7F0',
  bg: '#F5F4F0',      surface: '#FFFFFF',  surfaceAlt: '#F9F8F6',
  text: '#1A1A2E',    textSec: '#64748B',  textMuted: '#94A3B8',
  border: '#E2E8F0',  borderSoft: '#F1F5F9',
};

// ─── Category colour map ───────────────────────────────────────────────────────
const CAT = {
  lecture: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', chipBg: '#BFDBFE', dot: '#3B82F6' },
  work:    { bg: '#ECFDF5', border: '#10B981', text: '#065F46', chipBg: '#A7F3D0', dot: '#10B981' },
  exam:    { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', chipBg: '#FDE68A', dot: '#F59E0B' },
  break:   { bg: '#F8FAFC', border: '#94A3B8', text: '#475569', chipBg: '#E2E8F0', dot: '#94A3B8' },
  personal:{ bg: '#FDF4FF', border: '#A855F7', text: '#6B21A8', chipBg: '#E9D5FF', dot: '#A855F7' },
} as const;

type EventCat = keyof typeof CAT;

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalEvent {
  id: string;
  title: string;
  subtitle?: string;
  /** 0 = Monday … 6 = Sunday */
  day: number;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  category: EventCat;
  location?: string;
  source?: 'usos' | 'work-system' | 'manual';
  role?: string;
}

// ─── Timeline constants ───────────────────────────────────────────────────────
const TL_START = 6;           // 06:00
const TL_END   = 24;          // 24:00  (midnight)
const PX_HOUR  = 72;          // pixels per hour
const TL_HEIGHT = (TL_END - TL_START) * PX_HOUR; // 1296px

function timeToTop(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return ((h - TL_START) + m / 60) * PX_HOUR;
}
function timeToPx(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(mins * (PX_HOUR / 60), 34);
}
function fmtT(t: string) {
  const [h, m] = t.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${p}`;
}
function timeToMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// ─── Mock schedule (full week) ────────────────────────────────────────────────
const EVENTS: CalEvent[] = [
  // ── Monday ──
  { id:'m1', title:'Data Structures', subtitle:'Ch.9 — Binary Search Trees',
    day:0, startTime:'08:00', endTime:'09:30',
    category:'lecture', location:'Hall B3, Room 201', source:'usos' },
  { id:'m2', title:'Algorithms Study', subtitle:'Graph Theory — HW #4',
    day:0, startTime:'10:00', endTime:'11:30', category:'exam' },
  { id:'m3', title:'Lunch Break',
    day:0, startTime:'11:30', endTime:'12:15', category:'break' },
  { id:'m4', title:'Work Shift', subtitle:'Barista · Closing prep',
    day:0, startTime:'13:00', endTime:'17:00',
    category:'work', location:'The Daily Grind Café', source:'work-system', role:'Barista' },
  { id:'m5', title:'Calculus Study', subtitle:'Integrals & Series Ch.6-8',
    day:0, startTime:'17:30', endTime:'19:00', category:'exam' },
  // ⚠️ Late-night shift → conflict with Tue 07:30 lecture
  { id:'m6', title:'Evening Work Shift', subtitle:'Closing shift',
    day:0, startTime:'20:00', endTime:'23:30',
    category:'work', location:'The Daily Grind Café', source:'work-system', role:'Closing Barista' },

  // ── Tuesday ── (early morning → conflict)
  { id:'t1', title:'Software Engineering', subtitle:'Design Patterns — Lecture 7',
    day:1, startTime:'07:30', endTime:'09:00',
    category:'lecture', location:'Hall A2, Room 105', source:'usos' },
  { id:'t2', title:'Computer Networks', subtitle:'TCP/IP Protocol Stack',
    day:1, startTime:'09:15', endTime:'10:45',
    category:'lecture', location:'Lab C1', source:'usos' },
  { id:'t3', title:'Break', day:1, startTime:'11:00', endTime:'11:30', category:'break' },
  { id:'t4', title:'Study Session', subtitle:'SE Assignment #3',
    day:1, startTime:'13:00', endTime:'15:00', category:'exam' },

  // ── Wednesday ──
  { id:'w1', title:'Physics Lecture', subtitle:'Quantum Mechanics',
    day:2, startTime:'08:00', endTime:'10:00',
    category:'lecture', location:'Auditorium D', source:'usos' },
  { id:'w2', title:'Work Shift',
    day:2, startTime:'12:00', endTime:'16:00',
    category:'work', location:'The Daily Grind Café', source:'work-system', role:'Barista' },
  { id:'w3', title:'Database Systems', subtitle:'SQL Query Optimisation',
    day:2, startTime:'16:30', endTime:'18:00',
    category:'lecture', location:'Lab E2', source:'usos' },

  // ── Thursday ──
  { id:'th1', title:'Linear Algebra Seminar',
    day:3, startTime:'09:00', endTime:'11:00',
    category:'lecture', location:'Room F3', source:'usos' },
  { id:'th2', title:'Work Shift',
    day:3, startTime:'12:00', endTime:'16:00',
    category:'work', location:'The Daily Grind Café', source:'work-system', role:'Barista' },
  { id:'th3', title:'OS Concepts Revision', subtitle:'Process Scheduling',
    day:3, startTime:'17:00', endTime:'19:30', category:'exam' },

  // ── Friday (today) ──
  { id:'f1', title:'Operating Systems', subtitle:'Memory Management',
    day:4, startTime:'10:00', endTime:'12:00',
    category:'lecture', location:'Hall B1', source:'usos' },
  { id:'f2', title:'Lunch', day:4, startTime:'12:00', endTime:'13:00', category:'break' },
  { id:'f3', title:'Evening Work Shift', subtitle:'Weekend prep shift',
    day:4, startTime:'19:00', endTime:'23:00',
    category:'work', location:'The Daily Grind Café', source:'work-system', role:'Barista' },

  // ── Saturday ──
  { id:'sa1', title:'Database Makeup Lecture', subtitle:'Makeup class',
    day:5, startTime:'08:00', endTime:'09:30',
    category:'lecture', location:'Room C2', source:'usos' },
  { id:'sa2', title:'Self-Study Block', subtitle:'All subjects review',
    day:5, startTime:'10:00', endTime:'14:00', category:'exam' },

  // ── Sunday ──
  { id:'su1', title:'Rest & Recovery', subtitle:'Screen-free time 🌿',
    day:6, startTime:'10:00', endTime:'12:00', category:'break' },
];

const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS_FULL  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// ─── Conflict detection ────────────────────────────────────────────────────────
/** Returns true when day `d` ends after 21:00 AND day `d+1` starts before 08:00 */
function hasLowSleepConflict(dayIdx: number): boolean {
  const todayEvts  = EVENTS.filter(e => e.day === dayIdx);
  const tomorrowEvts = EVENTS.filter(e => e.day === dayIdx + 1);
  if (!todayEvts.length || !tomorrowEvts.length) return false;
  const lastEnd   = Math.max(...todayEvts.map(e => timeToMins(e.endTime)));
  const firstStart = Math.min(...tomorrowEvts.map(e => timeToMins(e.startTime)));
  return lastEnd >= 21 * 60 && firstStart <= 8 * 60;
}

// ─── Category icon ────────────────────────────────────────────────────────────
function CatIcon({ cat, size = 12 }: { cat: EventCat; size?: number }) {
  if (cat === 'lecture') return <GraduationCap size={size} />;
  if (cat === 'work')    return <Briefcase size={size} />;
  if (cat === 'exam')    return <Pencil size={size} />;
  return <Coffee size={size} />;
}

// ─── Event block (daily timeline) ────────────────────────────────────────────
function EventBlock({ ev, left, width }: { ev: CalEvent; left: number; width: number }) {
  const cfg    = CAT[ev.category];
  const top    = timeToTop(ev.startTime);
  const height = timeToPx(ev.startTime, ev.endTime);
  const short  = height < 52;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        background: cfg.bg,
        borderRadius: 12,
        borderLeft: `3.5px solid ${cfg.border}`,
        padding: short ? '4px 8px' : '8px 10px',
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom: short ? 0 : 3 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:3,
          background: cfg.chipBg, color: cfg.text,
          borderRadius: 20, padding:'2px 7px 2px 5px', fontSize:10, fontWeight:600,
        }}>
          <CatIcon cat={ev.category} size={10} />
          {CAT[ev.category] && ev.category === 'work' ? (ev.role ?? 'Work') : ev.category.charAt(0).toUpperCase() + ev.category.slice(1)}
        </div>
        {/* Source badge */}
        {ev.source === 'usos' && (
          <div style={{
            display:'flex', alignItems:'center', gap:2,
            background: '#EFF6FF', color:'#1E40AF',
            borderRadius: 20, padding:'2px 6px', fontSize:9, fontWeight:700,
          }}>
            <Link size={8} />
            USOS
          </div>
        )}
        {ev.source === 'work-system' && !short && (
          <div style={{
            background:'#ECFDF5', color:'#065F46',
            borderRadius: 20, padding:'2px 6px', fontSize:9, fontWeight:700,
          }}>
            Synced
          </div>
        )}
      </div>

      {/* Title */}
      {!short && (
        <p style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:'-0.2px',
          lineHeight:1.3, marginBottom:2, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' as any }}>
          {ev.title}
        </p>
      )}

      {/* Time + location */}
      {!short && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:10, color: T.textMuted, fontWeight:500 }}>
            {fmtT(ev.startTime)} – {fmtT(ev.endTime)}
          </span>
          {ev.location && (
            <span style={{ display:'flex', alignItems:'center', gap:2, fontSize:10, color:T.textMuted }}>
              <MapPin size={9} />{ev.location.split(',')[0]}
            </span>
          )}
        </div>
      )}

      {/* Short card: just show title */}
      {short && (
        <p style={{ fontSize:11, fontWeight:600, color:T.text, overflow:'hidden',
          whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
          {ev.title}
        </p>
      )}
    </div>
  );
}

// ─── Low Sleep Warning banner ─────────────────────────────────────────────────
function LowSleepWarning({ endTime, nextDayStart }: { endTime: string; nextDayStart: string }) {
  const gap = timeToMins(nextDayStart) + (24 * 60) - timeToMins(endTime);
  const hrs  = Math.floor(gap / 60);
  const mins = gap % 60;

  return (
    <div style={{
      margin:'4px 0 6px',
      background:'#FFFBEB',
      border:'1.5px solid #F59E0B',
      borderRadius:14,
      padding:'11px 14px',
      display:'flex',
      alignItems:'flex-start',
      gap:10,
    }}>
      <div style={{
        width:32, height:32, borderRadius:10, background:'#FDE68A',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <Moon size={16} color="#92400E" />
      </div>
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:'#92400E', marginBottom:3 }}>
          ⚠️ Low Sleep Warning
        </p>
        <p style={{ fontSize:12, color:'#B45309', lineHeight:1.5 }}>
          Shift ends at <strong>{fmtT(endTime)}</strong>. Next lecture: <strong>{fmtT(nextDayStart)}</strong> tomorrow.{' '}
          Only <strong>~{hrs}h {mins > 0 ? `${mins}m` : ''}</strong> recovery window — below the recommended 7h minimum.
        </p>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:4,
          background:'#FDE68A', color:'#92400E',
          borderRadius:20, padding:'4px 10px', marginTop:6,
          fontSize:11, fontWeight:600, cursor:'pointer',
        }}>
          <AlertTriangle size={10} />
          Suggest rescheduling
        </div>
      </div>
    </div>
  );
}

// ─── Daily View ────────────────────────────────────────────────────────────────
function DailyView({ dayIdx, onDayChange }: { dayIdx: number; onDayChange: (d: number) => void }) {
  const events = EVENTS.filter(e => e.day === dayIdx);
  const conflict = hasLowSleepConflict(dayIdx);
  const lastWorkEnd = conflict
    ? events.filter(e => e.category === 'work').sort((a,b) => b.endTime.localeCompare(a.endTime))[0]?.endTime
    : null;
  const nextDayFirstStart = conflict
    ? Math.min(...EVENTS.filter(e => e.day === dayIdx + 1).map(e => timeToMins(e.startTime)))
    : null;
  const nextDayFirstStartStr = nextDayFirstStart !== null
    ? `${String(Math.floor(nextDayFirstStart / 60)).padStart(2,'0')}:${String(nextDayFirstStart % 60).padStart(2,'0')}`
    : null;

  // Time markers
  const hours = Array.from({ length: TL_END - TL_START }, (_, i) => TL_START + i);

  return (
    <div style={{ flex:1, overflowY:'auto' }} className="zs-scroll">
      {/* Day navigator */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 20px 12px' }}>
        <button
          onClick={() => onDayChange(Math.max(0, dayIdx - 1))}
          disabled={dayIdx === 0}
          style={{ width:32, height:32, borderRadius:10, border:`1.5px solid ${T.border}`,
            background: T.surface, cursor: dayIdx === 0 ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            opacity: dayIdx === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} color={T.textSec} />
        </button>
        <div style={{ flex:1, textAlign:'center' }}>
          <p style={{ fontSize:15, fontWeight:700, color:T.text, letterSpacing:'-0.3px' }}>
            {DAYS_FULL[dayIdx]}
          </p>
          <p style={{ fontSize:11, color:T.textMuted }}>
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <button
          onClick={() => onDayChange(Math.min(6, dayIdx + 1))}
          disabled={dayIdx === 6}
          style={{ width:32, height:32, borderRadius:10, border:`1.5px solid ${T.border}`,
            background: T.surface, cursor: dayIdx === 6 ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            opacity: dayIdx === 6 ? 0.4 : 1 }}
        >
          <ChevronRight size={16} color={T.textSec} />
        </button>
      </div>

      {/* Conflict banner — before timeline if applicable */}
      {conflict && lastWorkEnd && nextDayFirstStartStr && (
        <div style={{ padding:'0 16px 12px' }}>
          <LowSleepWarning endTime={lastWorkEnd} nextDayStart={nextDayFirstStartStr} />
        </div>
      )}

      {/* Timeline */}
      <div style={{ position:'relative', height: TL_HEIGHT + 32,
        paddingBottom:16, paddingLeft:0, paddingRight:0 }}>
        {/* Hour grid */}
        {hours.map(h => (
          <div key={h} style={{
            position:'absolute',
            top:(h - TL_START) * PX_HOUR,
            left:0, right:0,
            height: PX_HOUR,
            display:'flex',
            alignItems:'flex-start',
          }}>
            {/* Time label */}
            <div style={{
              width: 50,
              paddingLeft: 16,
              paddingTop: 2,
              fontSize: 11,
              fontWeight: 500,
              color: T.textMuted,
              whiteSpace:'nowrap',
              flexShrink:0,
            }}>
              {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}
            </div>
            {/* Dashed grid line */}
            <div style={{
              flex:1,
              height:1,
              marginTop:8,
              background: h % 2 === 0 ? T.border : T.borderSoft,
              borderStyle: h % 2 === 0 ? 'solid' : 'dashed',
              borderWidth: h % 2 === 0 ? '1px 0 0' : '0',
              borderColor: T.border,
            }} />
          </div>
        ))}

        {/* Event blocks (positioned absolutely within events area) */}
        <div style={{ position:'absolute', top:0, left:50, right:12, height:'100%' }}>
          {events.map(ev => (
            <EventBlock
              key={ev.id}
              ev={ev}
              left={2}
              width={'calc(100% - 4px)' as any}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Overview ──────────────────────────────────────────────────────────
function WeeklyView({ onSelectDay }: { onSelectDay: (d: number) => void }) {
  // Today = Friday = index 4
  const todayIdx = 4;

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'4px 16px 16px' }} className="zs-scroll">
      {DAYS_FULL.map((dayName, di) => {
        const dayEvts = EVENTS.filter(e => e.day === di);
        const isToday = di === todayIdx;
        const conflict = hasLowSleepConflict(di);

        return (
          <button
            key={di}
            onClick={() => onSelectDay(di)}
            style={{
              width:'100%',
              background: isToday ? T.primarySoft : T.surface,
              border: isToday ? `1.5px solid ${T.primary}` : `1.5px solid ${T.border}`,
              borderRadius:18,
              padding:'14px 16px',
              marginBottom:10,
              cursor:'pointer',
              textAlign:'left',
              boxShadow: isToday ? '0 4px 20px rgba(79,99,210,0.12)' : '0 2px 10px rgba(0,0,0,0.04)',
              outline:'none',
            }}
          >
            {/* Day header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <p style={{ fontSize:15, fontWeight:700, color: isToday ? T.primary : T.text,
                  letterSpacing:'-0.3px' }}>{dayName}</p>
                {isToday && (
                  <div style={{ background:T.primary, color:'#fff', borderRadius:20,
                    padding:'2px 9px', fontSize:10, fontWeight:700 }}>
                    Today
                  </div>
                )}
                {conflict && (
                  <div style={{ display:'flex', alignItems:'center', gap:3, background:'#FEF3C7',
                    color:'#92400E', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:600 }}>
                    <AlertTriangle size={9} /> Sleep risk
                  </div>
                )}
              </div>
              <span style={{ fontSize:12, color:T.textMuted }}>
                {dayEvts.length} events
              </span>
            </div>

            {/* Category dots + mini event list */}
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {dayEvts.length === 0 ? (
                <p style={{ fontSize:12, color:T.textMuted }}>No events · Rest day 🌿</p>
              ) : (
                dayEvts.slice(0, 3).map(ev => (
                  <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                      width:8, height:8, borderRadius:'50%', background:CAT[ev.category].dot, flexShrink:0,
                    }} />
                    <span style={{ fontSize:12, color:T.textSec, flex:1,
                      overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                      {ev.title}
                    </span>
                    <span style={{ fontSize:11, color:T.textMuted, whiteSpace:'nowrap' }}>
                      {ev.startTime}
                    </span>
                  </div>
                ))
              )}
              {dayEvts.length > 3 && (
                <p style={{ fontSize:11, color:T.primary, fontWeight:500, marginTop:2 }}>
                  +{dayEvts.length - 3} more events →
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ScheduleScreen() {
  // Default to current day (Friday = 4)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState(4); // Friday = today

  const handleSelectDay = (d: number) => {
    setSelectedDay(d);
    setViewMode('daily');
  };

  return (
    <PhoneFrame>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:T.bg }}>

        {/* ── Sticky Header ── */}
        <div style={{
          padding:'10px 20px 12px',
          background: T.surface,
          borderBottom:`1px solid ${T.border}`,
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          flexShrink:0,
          zIndex:10,
          boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:'-0.4px' }}>
              Schedule
            </h2>
            <p style={{ fontSize:11, color:T.textMuted }}>
              Week of Apr 27 – May 3
            </p>
          </div>

          {/* Daily / Weekly toggle */}
          <div style={{
            display:'flex',
            background: T.bg,
            borderRadius:12,
            padding:3,
            border:`1px solid ${T.border}`,
          }}>
            {(['daily', 'weekly'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding:'6px 14px',
                  borderRadius:10,
                  border:'none',
                  background: viewMode === mode ? T.surface : 'transparent',
                  color: viewMode === mode ? T.primary : T.textMuted,
                  fontWeight: viewMode === mode ? 600 : 400,
                  fontSize:12,
                  cursor:'pointer',
                  transition:'all 0.2s ease',
                  boxShadow: viewMode === mode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  fontFamily:"'DM Sans', sans-serif",
                  outline:'none',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Day chip strip (daily view only) ── */}
        {viewMode === 'daily' && (
          <div style={{
            display:'flex',
            gap:6,
            padding:'10px 16px',
            background: T.surface,
            borderBottom:`1px solid ${T.borderSoft}`,
            overflowX:'auto',
            flexShrink:0,
          }}
          className="zs-scroll"
          >
            {DAYS_SHORT.map((d, i) => {
              const isActive = i === selectedDay;
              const isToday  = i === 4;
              const hasConflict = hasLowSleepConflict(i);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                    padding:'6px 10px', borderRadius:12, border:'none',
                    background: isActive ? T.primary : (isToday ? T.primarySoft : T.bg),
                    color: isActive ? '#fff' : (isToday ? T.primary : T.textSec),
                    cursor:'pointer', flexShrink:0,
                    position:'relative', outline:'none',
                    fontFamily:"'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize:11, fontWeight:600 }}>{d}</span>
                  {isToday && !isActive && (
                    <div style={{ width:4, height:4, borderRadius:'50%', background:T.primary }} />
                  )}
                  {isActive && (
                    <div style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.6)' }} />
                  )}
                  {hasConflict && (
                    <div style={{
                      position:'absolute', top:-3, right:-3,
                      width:8, height:8, borderRadius:'50%',
                      background:'#F59E0B', border:`2px solid ${T.surface}`,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── View content ── */}
        {viewMode === 'daily'
          ? <DailyView dayIdx={selectedDay} onDayChange={setSelectedDay} />
          : <WeeklyView onSelectDay={handleSelectDay} />
        }

        <AppBottomNav />
      </div>
    </PhoneFrame>
  );
}
