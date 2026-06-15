/**
 * AddTaskModal — bottom-sheet form for creating a new task.
 *
 * Form/State: Category/ToggleGroup
 *   Primary group (Study | Work | Personal) drives which sub-category
 *   chips are revealed below it via progressive disclosure.
 *
 * Form/State: DatePickerField
 *   Wraps native <input type="date"> inside a custom-styled trigger row
 *   (Calendar icon + ChevronDown) that satisfies the design spec.
 *
 * Color semantics: all category tints are 10 % opacity of the brand
 *   hue mapped through CSS rgba tokens — never hardcoded gradients.
 */
import { useState, useEffect } from 'react';
import {
  X, Clock, Calendar, ChevronDown,
  Briefcase, BookOpen, GraduationCap, Users,
  Heart, Pencil, Coffee, Sparkles,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type TaskCategory = 'exam' | 'lecture' | 'work' | 'meeting' | 'personal' | 'break';
type PrimaryGroup = 'study' | 'work' | 'personal';

export interface NewTask {
  title: string;
  date: string;
  startTime: string;
  duration: number;
  category: TaskCategory;
  location?: string;
  notes?: string;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: NewTask) => void;
}

// ─── Semantic Design Tokens ────────────────────────────────────────────────────
const T = {
  /* primary */
  primary:      '#10B981',
  primarySoft:  'rgba(16,185,129,0.10)',
  primaryText:  '#065F46',
  /* success / mint */
  work:         '#059669',
  workSoft:     '#ECFDF5',   /* rgba(5,150,105,0.1) */
  workText:     '#065F46',
  /* personal / purple */
  personal:     '#9333EA',
  personalSoft: '#F5F3FF',   /* rgba(147,51,234,0.1) */
  personalText: '#6B21A8',
  /* neutral */
  surface:      '#FFFFFF',
  bg:           '#F5F4F0',
  surfaceAlt:   '#F9F8F6',
  text:         '#111827',
  textSec:      '#6B7280',
  textMuted:    '#9CA3AF',
  border:       '#E5E7EB',
  borderSoft:   '#F1F5F9',
  /* semantic category */
  exam:         '#D97706',
  examSoft:     '#FFFBEB',
  examText:     '#92400E',
  lecture:      '#3B82F6',
  lectureSoft:  '#EFF6FF',
  lectureText:  '#1E40AF',
  meeting:      '#7C3AED',
  meetingSoft:  '#EDE9FE',
  meetingText:  '#4C1D95',
  break:        '#6B7280',
  breakSoft:    '#F9FAFB',
  breakText:    '#374151',
  /* error */
  error:        '#DC2626',
  errorSoft:    '#FEF2F2',
};

// ─── Primary Group Config ──────────────────────────────────────────────────────
const PRIMARY_CONFIG: Record<PrimaryGroup, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  text: string;
  defaultSub: TaskCategory;
  subs: TaskCategory[];
}> = {
  study: {
    label:      'Study',
    icon:       <BookOpen size={15} strokeWidth={2.2} />,
    color:      T.primary,
    bg:         T.primarySoft,
    text:       T.primaryText,
    defaultSub: 'lecture',
    subs:       ['lecture', 'exam'],
  },
  work: {
    label:      'Work',
    icon:       <Briefcase size={15} strokeWidth={2.2} />,
    color:      T.work,
    bg:         T.workSoft,
    text:       T.workText,
    defaultSub: 'work',
    subs:       ['work', 'meeting'],
  },
  personal: {
    label:      'Personal',
    icon:       <Heart size={15} strokeWidth={2.2} />,
    color:      T.personal,
    bg:         T.personalSoft,
    text:       T.personalText,
    defaultSub: 'personal',
    subs:       ['personal', 'break'],
  },
};

// ─── Sub-category Config ───────────────────────────────────────────────────────
const SUB_CONFIG: Record<TaskCategory, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  text: string;
  borderColor: string;
}> = {
  lecture:  { label:'Lecture',  icon:<GraduationCap size={13} />, color:T.lecture,  bg:T.lectureSoft,  text:T.lectureText,  borderColor:T.lecture  },
  exam:     { label:'Exam',     icon:<Pencil size={13} />,        color:T.exam,     bg:T.examSoft,     text:T.examText,     borderColor:T.exam     },
  work:     { label:'Work',     icon:<Briefcase size={13} />,     color:T.work,     bg:T.workSoft,     text:T.workText,     borderColor:T.work     },
  meeting:  { label:'Meeting',  icon:<Users size={13} />,         color:T.meeting,  bg:T.meetingSoft,  text:T.meetingText,  borderColor:T.meeting  },
  personal: { label:'Personal', icon:<Heart size={13} />,         color:T.personal, bg:T.personalSoft, text:T.personalText, borderColor:T.personal },
  break:    { label:'Break',    icon:<Coffee size={13} />,        color:T.break,    bg:T.breakSoft,    text:T.breakText,    borderColor:T.border   },
};

const DURATIONS = [
  { label: '15m', value: 15  },
  { label: '30m', value: 30  },
  { label: '1h',  value: 60  },
  { label: '1.5h',value: 90  },
  { label: '2h',  value: 120 },
  { label: '3h+', value: 180 },
];

// ─── Helper: format date for display ──────────────────────────────────────────
function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Sub-component: Primary Category ToggleGroup ──────────────────────────────
function PrimaryCategoryToggle({
  selected,
  onChange,
}: {
  selected: PrimaryGroup;
  onChange: (g: PrimaryGroup) => void;
}) {
  return (
    /* Layer: Category/ToggleGroup */
    <div
      style={{
        display: 'flex',
        gap: 0,
        background: T.bg,
        borderRadius: 16,
        padding: 4,
        marginBottom: 12,
        border: `1.5px solid ${T.border}`,
      }}
    >
      {(Object.entries(PRIMARY_CONFIG) as [PrimaryGroup, typeof PRIMARY_CONFIG[PrimaryGroup]][]).map(
        ([key, cfg]) => {
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 8px',
                borderRadius: 12,
                border: 'none',
                background: active ? cfg.color : 'transparent',
                color:      active ? '#FFFFFF' : T.textSec,
                cursor:     'pointer',
                fontSize:   13,
                fontWeight: active ? 700 : 500,
                letterSpacing: active ? '-0.15px' : 0,
                transition: 'all 0.22s cubic-bezier(0.34,1.1,0.64,1)',
                outline:    'none',
                /* minimum 44px touch target per WCAG */
                minHeight:  44,
                boxShadow:  active
                  ? `0 2px 10px ${cfg.color}44, 0 1px 3px ${cfg.color}33`
                  : 'none',
              }}
            >
              <span style={{ opacity: active ? 1 : 0.65, lineHeight: 0 }}>{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        }
      )}
    </div>
  );
}

// ─── Sub-component: Sub-category Chip Row ─────────────────────────────────────
function SubCategoryRow({
  subs,
  selected,
  onChange,
}: {
  subs: TaskCategory[];
  selected: TaskCategory;
  onChange: (c: TaskCategory) => void;
}) {
  return (
    /* Layer: Category/SubChips */
    <div
      style={{
        display: 'flex',
        gap: 8,
        marginBottom: 4,
        paddingBottom: 4,
      }}
    >
      {subs.map((key) => {
        const cfg = SUB_CONFIG[key];
        const active = selected === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        6,
              padding:    '7px 14px',
              borderRadius: 20,
              border:     active
                ? `1.5px solid ${cfg.borderColor}`
                : `1.5px solid ${T.border}`,
              background: active ? cfg.bg : T.surface,
              color:      active ? cfg.text : T.textSec,
              cursor:     'pointer',
              fontSize:   12,
              fontWeight: active ? 600 : 400,
              transition: 'all 0.18s ease',
              outline:    'none',
              flexShrink: 0,
            }}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-component: DatePickerField ───────────────────────────────────────────
function DatePickerField({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const display = value ? formatDisplayDate(value) : '';

  return (
    /* Layer: Input/DatePicker */
    <div
      style={{
        position:    'relative',
        flex:        1,
        background:  T.bg,
        borderRadius: 14,
        border:      `1.5px solid ${hasError ? T.error : T.border}`,
        padding:     '0 14px',
        height:      48,
        display:     'flex',
        alignItems:  'center',
        gap:         8,
        cursor:      'pointer',
        transition:  'border-color 0.2s ease',
      }}
    >
      {/* Left: displayed value or placeholder */}
      <span
        style={{
          flex:       1,
          fontSize:   13,
          fontWeight: 500,
          color:      display ? T.text : T.textMuted,
          fontFamily: "'DM Sans', sans-serif",
          pointerEvents: 'none',
          overflow:   'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {display || 'Select target deadline'}
      </span>

      {/* Right: chevron + calendar icon (trailing, flex-shrink: 0) */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        4,
          flexShrink: 0,
          pointerEvents: 'none',
        }}
      >
        <ChevronDown size={14} color={T.textMuted} strokeWidth={2} />
        <Calendar   size={16} color={T.primary}   strokeWidth={2} />
      </div>

      {/* Invisible native input overlay — captures all date picking */}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: 'absolute',
          inset:    0,
          opacity:  0,
          cursor:   'pointer',
          width:    '100%',
          height:   '100%',
        }}
      />
    </div>
  );
}

// ─── Sub-component: Time Input Field ──────────────────────────────────────────
function TimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    /* Layer: Input/TimePicker */
    <div
      style={{
        flex:        1,
        background:  T.bg,
        borderRadius: 14,
        border:      `1.5px solid ${T.border}`,
        padding:     '0 14px',
        height:      48,
        display:     'flex',
        alignItems:  'center',
        gap:         8,
      }}
    >
      <Clock size={16} color={T.textMuted} strokeWidth={2} style={{ flexShrink: 0 }} />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border:     'none',
          outline:    'none',
          background: 'transparent',
          fontSize:   13,
          fontWeight: 500,
          color:      T.text,
          fontFamily: "'DM Sans', sans-serif",
          flex:       1,
          minWidth:   0,
        }}
      />
    </div>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize:      11,
        fontWeight:    700,
        color:         T.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom:  10,
      }}
    >
      {children}
    </p>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AddTaskModal({ open, onClose, onSave }: AddTaskModalProps) {
  /* ── State ── */
  const [form, setForm] = useState<NewTask>({
    title:     '',
    date:      new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration:  60,
    category:  'lecture',
    location:  '',
    notes:     '',
  });

  /* primary group drives which sub-chips are shown */
  const [primaryGroup, setPrimaryGroup] = useState<PrimaryGroup>('study');

  /* progressive disclosure */
  const [showExtra,    setShowExtra]    = useState(false);

  /* validation */
  const [touchedTitle, setTouchedTitle] = useState(false);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [open]);

  if (!open) return null;

  /* When primary group changes, auto-select the default sub-category */
  const handlePrimaryChange = (g: PrimaryGroup) => {
    setPrimaryGroup(g);
    setForm(prev => ({ ...prev, category: PRIMARY_CONFIG[g].defaultSub }));
  };

  const handleSave = () => {
    setTouchedTitle(true);
    if (!form.title.trim()) return;
    onSave(form);
    /* reset */
    setForm({
      title: '', date: new Date().toISOString().split('T')[0],
      startTime: '09:00', duration: 60, category: 'lecture',
      location: '', notes: '',
    });
    setPrimaryGroup('study');
    setShowExtra(false);
    setTouchedTitle(false);
    onClose();
  };

  const activePrimary = PRIMARY_CONFIG[primaryGroup];
  const titleError    = touchedTitle && !form.title.trim();

  return (
    <>
      {/* Layer: Overlay/Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:       0,
          background: 'rgba(17,24,39,0.48)',
          backdropFilter: 'blur(4px)',
          zIndex:     40,
          opacity:    mounted ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Layer: Sheet/AddTask */}
      <div
        style={{
          position:    'fixed',
          bottom:       0,
          left:         0,
          right:        0,
          background:  'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderTop:   '1px solid rgba(255,255,255,0.6)',
          borderRadius: '28px 28px 0 0',
          zIndex:      50,
          transform:   mounted ? 'translateY(0)' : 'translateY(100%)',
          transition:  'transform 0.38s cubic-bezier(0.34,1.1,0.64,1)',
          maxHeight:   '90%',
          display:     'flex',
          flexDirection: 'column',
          overflow:    'hidden',
          boxShadow:   '0 -12px 40px rgba(31,38,55,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        {/* Drag Handle */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:14, paddingBottom:4, flexShrink:0 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:T.border }} />
        </div>

        {/* ── Header ── */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '8px 20px 14px',
            flexShrink:     0,
          }}
        >
          <div>
            <h3 style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:'-0.4px', marginBottom:1 }}>
              Add Task
            </h3>
            <p style={{ fontSize:12, color:T.textMuted }}>Fill in the details below</p>
          </div>

          <button
            onClick={onClose}
            style={{
              width:36, height:36, borderRadius:10,
              border:`1.5px solid ${T.border}`,
              background:T.surface, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:T.textSec, outline:'none',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Form Body ── */}
        <div style={{ overflowY:'auto', flex:1, padding:'0 20px' }} className="zs-scroll">

          {/* ── Task Title ── */}
          <div style={{ marginBottom:20 }}>
            <input
              type="text"
              placeholder="What do you need to do?"
              value={form.title}
              onChange={(e) => {
                setTouchedTitle(true);
                setForm({ ...form, title: e.target.value });
              }}
              autoFocus
              style={{
                width:       '100%',
                border:      'none',
                outline:     'none',
                fontSize:    20,
                fontWeight:  600,
                color:       T.text,
                background:  'transparent',
                letterSpacing: '-0.4px',
                fontFamily:  "'DM Sans', sans-serif",
                caretColor:  activePrimary.color,
              }}
            />
            {/* Validation underline */}
            <div
              style={{
                height:     2,
                background: titleError ? T.error : form.title ? activePrimary.color : T.border,
                borderRadius: 1,
                marginTop:  8,
                transition: 'background 0.25s ease',
              }}
            />
            {titleError && (
              <p style={{ fontSize:11, color:T.error, marginTop:5, fontWeight:500 }}>
                Task name is required
              </p>
            )}
          </div>

          {/* ── Section: Category ── */}
          <div style={{ marginBottom:20 }}>
            <SectionLabel>Category</SectionLabel>

            {/* Element A — Primary ToggleGroup (Study | Work | Personal) */}
            <PrimaryCategoryToggle
              selected={primaryGroup}
              onChange={handlePrimaryChange}
            />

            {/* Sub-category chips revealed by primary group */}
            <SubCategoryRow
              subs={activePrimary.subs}
              selected={form.category}
              onChange={(c) => setForm({ ...form, category: c })}
            />
          </div>

          {/* ── Section: Schedule (Date + Time) ── */}
          <div style={{ marginBottom:20 }}>
            <SectionLabel>Schedule</SectionLabel>

            {/* Element B — Date + Time row */}
            <div style={{ display:'flex', gap:10 }}>
              {/* Element B: DatePickerField (deadline picker with calendar icon) */}
              <DatePickerField
                value={form.date}
                onChange={(d) => setForm({ ...form, date: d })}
              />
              {/* Time picker */}
              <TimeField
                value={form.startTime}
                onChange={(t) => setForm({ ...form, startTime: t })}
              />
            </div>
          </div>

          {/* ── Section: Duration ── */}
          <div style={{ marginBottom:20 }}>
            <SectionLabel>Duration</SectionLabel>

            {/* Duration chip row — horizontal, space-between, no wrap */}
            <div style={{ display:'flex', gap:6 }}>
              {DURATIONS.map(({ label, value }) => {
                const active = form.duration === value;
                return (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, duration: value })}
                    style={{
                      flex:       1,
                      padding:    '9px 2px',
                      borderRadius: 12,
                      border:     active
                        ? `1.5px solid ${activePrimary.color}`
                        : `1.5px solid ${T.border}`,
                      background: active ? activePrimary.bg : T.surface,
                      color:      active ? activePrimary.color : T.textSec,
                      cursor:     'pointer',
                      fontSize:   12,
                      fontWeight: active ? 700 : 400,
                      transition: 'all 0.18s ease',
                      outline:    'none',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── AI optimize hint strip ── */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        10,
              background: T.bg,
              borderRadius: 14,
              padding:    '10px 14px',
              marginBottom: 20,
              border:     `1.5px solid ${T.borderSoft}`,
            }}
          >
            <Sparkles size={14} color={activePrimary.color} strokeWidth={2.2} style={{ flexShrink:0 }} />
            <p style={{ fontSize:12, color:T.textSec, lineHeight:1.4, flex:1 }}>
              ZenSync will automatically find the best slot for this task in your day.
            </p>
          </div>

          {/* ── Progressive Disclosure: Location + Notes ── */}
          <button
            onClick={() => setShowExtra((v) => !v)}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        6,
              background: 'transparent',
              border:     'none',
              cursor:     'pointer',
              color:      T.textMuted,
              fontSize:   13,
              marginBottom: showExtra ? 14 : 24,
              padding:    0,
              outline:    'none',
            }}
          >
            <ChevronDown
              size={15}
              style={{ transform: showExtra ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }}
            />
            {showExtra ? 'Less options' : 'Add location & notes'}
          </button>

          {showExtra && (
            <div style={{ marginBottom:24 }}>
              <input
                type="text"
                placeholder="📍 Location (optional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                style={{
                  width:      '100%',
                  background:  T.bg,
                  border:     `1.5px solid ${T.border}`,
                  borderRadius: 14,
                  padding:    '12px 14px',
                  fontSize:   14,
                  color:      T.text,
                  outline:    'none',
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 10,
                  boxSizing:  'border-box',
                }}
              />
              <textarea
                placeholder="📝 Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{
                  width:      '100%',
                  background:  T.bg,
                  border:     `1.5px solid ${T.border}`,
                  borderRadius: 14,
                  padding:    '12px 14px',
                  fontSize:   14,
                  color:      T.text,
                  outline:    'none',
                  fontFamily: "'DM Sans', sans-serif",
                  resize:     'none',
                  boxSizing:  'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Save CTA ── */}
        <div
          style={{
            padding:    '12px 20px 28px',
            flexShrink: 0,
            borderTop:  '1px solid rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.45)',
          }}
        >
          <button
            onClick={handleSave}
            style={{
              width:      '100%',
              background: form.title.trim() ? activePrimary.color : T.border,
              color:      form.title.trim() ? '#FFFFFF' : T.textMuted,
              border:     'none',
              borderRadius: 16,
              padding:    '16px',
              fontSize:   15,
              fontWeight: 600,
              cursor:     form.title.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.22s ease',
              boxShadow:  form.title.trim()
                ? `0 8px 24px ${activePrimary.color}55`
                : 'none',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap:        8,
              outline:    'none',
              /* min 48px touch target */
              minHeight:  48,
            }}
          >
            Save Task
          </button>
        </div>
      </div>
    </>
  );
}
