/**
 * ScheduleScreen — imported calendar view (university + work).
 * Features:
 *  - Daily / Weekly / Monthly view toggle (sticky header)
 *  - Week/month navigation arrows in header
 *  - Vertical timeline (06:00–23:59) with absolutely-positioned event blocks
 *  - Source badges: "USOS" for lectures, role tag for work shifts
 *  - Conflict Indicator: Low Sleep Warning when a late work shift
 *    is immediately followed by an early-morning lecture next day
 */
import { useState, CSSProperties } from 'react';
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

// ─── Design Tokens (ZenManager – Liquid Glass) ──────────────────────────────────
const T = {
  primary: '#10B981', primarySoft: 'rgba(16,185,129,0.10)',
  accent: '#2ECC71',  accentSoft: 'rgba(46,204,113,0.10)',
  bg: '#FAFAFA',      surface: 'rgba(255,255,255,0.6)',  surfaceAlt: 'rgba(255,255,255,0.45)',
  text: '#222222',    textSec: '#717171',  textMuted: '#9A9A9A',
  border: 'rgba(255,255,255,0.4)',  borderSoft: 'rgba(0,0,0,0.06)',
};

// Brand gradient (accent) — primary CTAs & active states
const BRAND_GRADIENT = 'linear-gradient(135deg, #2ECC71 0%, #10B981 100%)';

// Liquid Glass container style
const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: 24,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
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
const TL_START = 6;
const TL_END   = 24;
const PX_HOUR  = 72;
const TL_HEIGHT = (TL_END - TL_START) * PX_HOUR;

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
  { id:'m6', title:'Evening Work Shift', subtitle:'Closing shift',
    day:0, startTime:'20:00', endTime:'23:30',
    category:'work', location:'The Daily Grind Café', source:'work-system', role:'Closing Barista' },

  // ── Tuesday ──
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
const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Navigation helpers ────────────────────────────────────────────────────────
// Base week: Mon Apr 27 2026
const BASE_WEEK_START = new Date(2026, 3, 27);

function getWeekDates(offset: number): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(BASE_WEEK_START);
    d.setDate(d.getDate() + offset * 7 + i);
    return d.getDate();
  });
}

function getWeekLabel(offset: number): string {
  const start = new Date(BASE_WEEK_START);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} – ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
}

function getMonthLabel(offset: number): string {
  const d = new Date(2026, 4 + offset, 1); // base: May 2026
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Conflict detection ────────────────────────────────────────────────────────
function hasLowSleepConflict(dayIdx: number): boolean {
  const todayEvts    = EVENTS.filter(e => e.day === dayIdx);
  const tomorrowEvts = EVENTS.filter(e => e.day === dayIdx + 1);
  if (!todayEvts.length || !tomorrowEvts.length) return false;
  const lastEnd    = Math.max(...todayEvts.map(e => timeToMins(e.endTime)));
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
      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom: short ? 0 : 3 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:3,
          background: cfg.chipBg, color: cfg.text,
          borderRadius: 20, padding:'2px 7px 2px 5px', fontSize:10, fontWeight:600,
        }}>
          <CatIcon cat={ev.category} size={10} />
          {CAT[ev.category] && ev.category === 'work' ? (ev.role ?? 'Work') : ev.category.charAt(0).toUpperCase() + ev.category.slice(1)}
        </div>
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

      {!short && (
        <p style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:'-0.2px',
          lineHeight:1.3, marginBottom:2, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' as any }}>
          {ev.title}
        </p>
      )}

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
  const gap  = timeToMins(nextDayStart) + (24 * 60) - timeToMins(endTime);
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

      {conflict && lastWorkEnd && nextDayFirstStartStr && (
        <div style={{ padding:'0 16px 12px' }}>
          <LowSleepWarning endTime={lastWorkEnd} nextDayStart={nextDayFirstStartStr} />
        </div>
      )}

      {/* Timeline */}
      <div style={{ position:'relative', height: TL_HEIGHT + 32,
        paddingBottom:16, paddingLeft:0, paddingRight:0 }}>
        {hours.map(h => (
          <div key={h} style={{
            position:'absolute',
            top:(h - TL_START) * PX_HOUR,
            left:0, right:0,
            height: PX_HOUR,
            display:'flex',
            alignItems:'flex-start',
          }}>
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
              ...GLASS,
              width:'100%',
              background: isToday ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.6)',
              border: isToday ? `1.5px solid ${T.primary}` : '1px solid rgba(255,255,255,0.4)',
              borderRadius:16,
              padding:'14px 16px',
              marginBottom:10,
              cursor:'pointer',
              textAlign:'left',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              outline:'none',
            }}
          >
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

// ─── Monthly View ─────────────────────────────────────────────────────────────
function MonthlyView({ monthOffset, onSelectDay }: { monthOffset: number; onSelectDay: (d: number) => void }) {
  // Base: May 2026 (month index 4)
  const d = new Date(2026, 4 + monthOffset, 1);
  const year  = d.getFullYear();
  const month = d.getMonth();

  // Day-of-week for the 1st (0=Sun → convert to Mon-first: Mon=0, Sun=6)
  let startDow = d.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const totalDays = new Date(year, month + 1, 0).getDate();
  const cellCount = startDow + totalDays;
  const weeks     = Math.ceil(cellCount / 7);

  // Map a calendar date to a EVENTS day index (mock week: Mon Apr 27 = 0 … Sun May 3 = 6)
  function getDayEvents(dayNum: number): CalEvent[] {
    if (month === 3 && dayNum >= 27 && dayNum <= 30) return EVENTS.filter(e => e.day === dayNum - 27);
    if (month === 4 && dayNum >= 1  && dayNum <= 3)  return EVENTS.filter(e => e.day === dayNum + 3);
    return [];
  }

  const todayDate = 22; // May 22, 2026

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 16px' }} className="zs-scroll">
      {/* Day-of-week headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', marginBottom:6 }}>
        {['M','T','W','T','F','S','S'].map((label, i) => (
          <div key={i} style={{
            textAlign:'center', fontSize:11, fontWeight:600,
            color: i >= 5 ? T.primary : T.textMuted,
            padding:'4px 0',
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {Array.from({ length: weeks }, (_, weekIdx) => (
        <div key={weekIdx} style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'3px', marginBottom:3 }}>
          {Array.from({ length: 7 }, (_, colIdx) => {
            const dayNum  = weekIdx * 7 + colIdx - startDow + 1;
            const isValid = dayNum >= 1 && dayNum <= totalDays;
            const isToday = monthOffset === 0 && month === 4 && dayNum === todayDate;
            const dayEvts = isValid ? getDayEvents(dayNum) : [];
            const isWeekend = colIdx >= 5;

            return (
              <div
                key={colIdx}
                onClick={() => {
                  if (!isValid) return;
                  // Drill into matching day in weekly mock if it exists
                  if (month === 3 && dayNum >= 27 && dayNum <= 30) onSelectDay(dayNum - 27);
                  else if (month === 4 && dayNum >= 1 && dayNum <= 3) onSelectDay(dayNum + 3);
                }}
                style={{
                  minHeight:52,
                  padding:'5px 4px 4px',
                  borderRadius:10,
                  background: isToday ? T.primarySoft : 'transparent',
                  border: isToday ? `1.5px solid ${T.primary}` : '1.5px solid transparent',
                  cursor: isValid && dayEvts.length > 0 ? 'pointer' : 'default',
                  transition:'background 0.15s ease',
                }}
              >
                {isValid && (
                  <>
                    <div style={{
                      fontSize:13,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? T.primary : isWeekend ? T.textSec : T.text,
                      textAlign:'center',
                      marginBottom:4,
                      lineHeight:1,
                    }}>
                      {dayNum}
                    </div>
                    {/* Event dots */}
                    <div style={{ display:'flex', justifyContent:'center', gap:2, flexWrap:'wrap' }}>
                      {dayEvts.slice(0, 3).map((ev, idx) => (
                        <div key={idx} style={{
                          width:5, height:5, borderRadius:'50%',
                          background: CAT[ev.category].dot,
                        }} />
                      ))}
                      {dayEvts.length > 3 && (
                        <div style={{ width:5, height:5, borderRadius:'50%', background:T.textMuted }} />
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div style={{
        ...GLASS, marginTop:16, borderRadius:16, padding:'12px 16px',
        display:'flex', flexWrap:'wrap', gap:'10px 20px',
      }}>
        {Object.entries(CAT).map(([key, cfg]) => (
          <div key={key} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot }} />
            <span style={{ fontSize:11, color:T.textSec, fontWeight:500, textTransform:'capitalize' }}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ScheduleScreen() {
  const [viewMode,     setViewMode]     = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDay,  setSelectedDay]  = useState(4);
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [monthOffset,  setMonthOffset]  = useState(0);

  const handleSelectDay = (d: number) => {
    setSelectedDay(d);
    setViewMode('daily');
  };

  // Navigation handlers — week for daily/weekly, month for monthly
  const goBack = () => {
    if (viewMode === 'monthly') setMonthOffset(o => o - 1);
    else setWeekOffset(o => o - 1);
  };
  const goForward = () => {
    if (viewMode === 'monthly') setMonthOffset(o => o + 1);
    else setWeekOffset(o => o + 1);
  };

  const periodLabel = viewMode === 'monthly'
    ? getMonthLabel(monthOffset)
    : `Week of ${getWeekLabel(weekOffset)}`;

  const weekDates = getWeekDates(weekOffset);

  return (
    <PhoneFrame>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'transparent' }}>

        {/* ── Sticky Header ── */}
        <div style={{
          padding:'10px 16px 12px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom:'1px solid rgba(255,255,255,0.4)',
          flexShrink:0,
          zIndex:10,
          boxShadow:'0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>

            {/* Title + period navigation */}
            <div>
              <h2 style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:'-0.4px', marginBottom:4 }}>
                Schedule
              </h2>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <button
                  onClick={goBack}
                  style={{
                    width:22, height:22, borderRadius:6,
                    border:`1px solid ${T.border}`, background:T.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', outline:'none',
                  }}
                >
                  <ChevronLeft size={13} color={T.textSec} />
                </button>
                <p style={{ fontSize:11, color:T.textMuted, minWidth:110, textAlign:'center' }}>
                  {periodLabel}
                </p>
                <button
                  onClick={goForward}
                  style={{
                    width:22, height:22, borderRadius:6,
                    border:`1px solid ${T.border}`, background:T.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', outline:'none',
                  }}
                >
                  <ChevronRight size={13} color={T.textSec} />
                </button>
              </div>
            </div>

            {/* Daily / Weekly / Monthly toggle */}
            <div style={{
              display:'flex',
              background: T.bg,
              borderRadius:12,
              padding:3,
              border:`1px solid ${T.border}`,
            }}>
              {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding:'6px 10px',
                    borderRadius:10,
                    border:'none',
                    background: viewMode === mode ? T.surface : 'transparent',
                    color: viewMode === mode ? T.primary : T.textMuted,
                    fontWeight: viewMode === mode ? 600 : 400,
                    fontSize:11,
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
        </div>

        {/* ── Day chip strip (daily view only) ── */}
        {viewMode === 'daily' && (
          <div
            style={{
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
              const isActive    = i === selectedDay;
              const isToday     = i === 4;
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
                  {/* Numerical date replaces task count */}
                  <span style={{
                    fontSize:12,
                    fontWeight: isToday ? 700 : 500,
                    color: isActive ? 'rgba(255,255,255,0.9)' : (isToday ? T.primary : T.textMuted),
                    lineHeight:1,
                  }}>
                    {weekDates[i]}
                  </span>
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
        {viewMode === 'daily' && (
          <DailyView dayIdx={selectedDay} onDayChange={setSelectedDay} />
        )}
        {viewMode === 'weekly' && (
          <WeeklyView onSelectDay={handleSelectDay} />
        )}
        {viewMode === 'monthly' && (
          <MonthlyView monthOffset={monthOffset} onSelectDay={handleSelectDay} />
        )}

        <AppBottomNav />
      </div>
    </PhoneFrame>
  );
}
