import { useState, useEffect } from 'react';
import { X, Clock, Calendar, ChevronDown, Briefcase, BookOpen, GraduationCap, Users, Heart, Pencil } from 'lucide-react';

export type TaskCategory = 'exam' | 'lecture' | 'work' | 'meeting' | 'personal' | 'break';

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

const T = {
  primary: '#4F63D2',
  primarySoft: '#EEF0FD',
  surface: '#FFFFFF',
  bg: '#F5F4F0',
  text: '#1A1A2E',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
};

const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; icon: React.ReactNode; bg: string; activeBg: string; activeText: string; border: string }
> = {
  exam: {
    label: 'Exam',
    icon: <Pencil size={15} />,
    bg: T.borderSoft,
    activeBg: '#FFFBEB',
    activeText: '#92400E',
    border: '#F59E0B',
  },
  lecture: {
    label: 'Lecture',
    icon: <GraduationCap size={15} />,
    bg: T.borderSoft,
    activeBg: '#EFF6FF',
    activeText: '#1E40AF',
    border: '#3B82F6',
  },
  work: {
    label: 'Work',
    icon: <Briefcase size={15} />,
    bg: T.borderSoft,
    activeBg: '#ECFDF5',
    activeText: '#065F46',
    border: '#10B981',
  },
  meeting: {
    label: 'Meeting',
    icon: <Users size={15} />,
    bg: T.borderSoft,
    activeBg: '#EDE9FE',
    activeText: '#4C1D95',
    border: '#7C3AED',
  },
  personal: {
    label: 'Personal',
    icon: <Heart size={15} />,
    bg: T.borderSoft,
    activeBg: '#FDF4FF',
    activeText: '#6B21A8',
    border: '#A855F7',
  },
  break: {
    label: 'Break',
    icon: <Clock size={15} />,
    bg: T.borderSoft,
    activeBg: '#F8FAFC',
    activeText: '#475569',
    border: '#94A3B8',
  },
};

const DURATIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h+', value: 180 },
];

export function AddTaskModal({ open, onClose, onSave }: AddTaskModalProps) {
  const [form, setForm] = useState<NewTask>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 60,
    category: 'lecture',
    location: '',
    notes: '',
  });
  const [showExtra, setShowExtra] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      // Slight delay for slide-up animation
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [open]);

  if (!open) return null;

  const cat = CATEGORY_CONFIG[form.category];

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      duration: 60,
      category: 'lecture',
      location: '',
      notes: '',
    });
    setShowExtra(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(26,26,46,0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: T.surface,
          borderRadius: '28px 28px 0 0',
          zIndex: 50,
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.34,1.1,0.64,1)',
          maxHeight: '88%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drag Handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 14,
            paddingBottom: 4,
            flexShrink: 0,
          }}
        >
          <div
            style={{ width: 36, height: 4, borderRadius: 2, background: T.border }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 22px 16px',
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: T.text,
              letterSpacing: '-0.4px',
            }}
          >
            Add Task
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: `1.5px solid ${T.border}`,
              background: T.surface,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.textSec,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0 22px',
          }}
          className="zs-scroll"
        >
          {/* Task Title */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="What do you need to do?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 20,
                fontWeight: 600,
                color: T.text,
                background: 'transparent',
                letterSpacing: '-0.4px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <div
              style={{
                height: 2,
                background: form.title ? T.primary : T.border,
                borderRadius: 1,
                marginTop: 8,
                transition: 'background 0.3s',
              }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Category
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, (typeof CATEGORY_CONFIG)[TaskCategory]][]).map(
                ([key, cfg]) => {
                  const active = form.category === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setForm({ ...form, category: key })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: active ? `1.5px solid ${cfg.border}` : `1.5px solid ${T.border}`,
                        background: active ? cfg.activeBg : T.surface,
                        color: active ? cfg.activeText : T.textSec,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                flex: 1,
                background: T.bg,
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Calendar size={16} color={T.textMuted} />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  fontWeight: 500,
                  color: T.text,
                  fontFamily: "'DM Sans', sans-serif",
                  flex: 1,
                  minWidth: 0,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                background: T.bg,
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Clock size={16} color={T.textMuted} />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  fontWeight: 500,
                  color: T.text,
                  fontFamily: "'DM Sans', sans-serif",
                  flex: 1,
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Duration
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {DURATIONS.map(({ label, value }) => {
                const active = form.duration === value;
                return (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, duration: value })}
                    style={{
                      flex: 1,
                      padding: '9px 2px',
                      borderRadius: 12,
                      border: active ? `1.5px solid ${T.primary}` : `1.5px solid ${T.border}`,
                      background: active ? T.primarySoft : T.surface,
                      color: active ? T.primary : T.textSec,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progressive Disclosure: Extra fields */}
          <button
            onClick={() => setShowExtra((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: T.textMuted,
              fontSize: 13,
              marginBottom: showExtra ? 16 : 24,
              padding: 0,
            }}
          >
            <ChevronDown
              size={15}
              style={{
                transform: showExtra ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            />
            {showExtra ? 'Less options' : 'Add location & notes'}
          </button>

          {showExtra && (
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                placeholder="📍 Location (optional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                style={{
                  width: '100%',
                  background: T.bg,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 14,
                  padding: '12px 14px',
                  fontSize: 14,
                  color: T.text,
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
              />
              <textarea
                placeholder="📝 Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  background: T.bg,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 14,
                  padding: '12px 14px',
                  fontSize: 14,
                  color: T.text,
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div
          style={{
            padding: '12px 22px 28px',
            flexShrink: 0,
            borderTop: `1px solid ${T.border}`,
            background: T.surface,
          }}
        >
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            style={{
              width: '100%',
              background: form.title.trim() ? T.primary : T.border,
              color: form.title.trim() ? '#fff' : T.textMuted,
              border: 'none',
              borderRadius: 16,
              padding: '16px',
              fontSize: 15,
              fontWeight: 600,
              cursor: form.title.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: form.title.trim()
                ? '0 8px 24px rgba(79,99,210,0.35)'
                : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            Save Task
          </button>
        </div>
      </div>
    </>
  );
}
