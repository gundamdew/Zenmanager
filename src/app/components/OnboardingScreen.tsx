import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import {
  Sun,
  CloudSun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Coffee,
  Calendar,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: '#4F63D2',
  primarySoft: '#EEF0FD',
  primaryMid: '#C7CDF7',
  accent: '#7CC8A4',
  accentSoft: '#E8F7F0',
  bg: '#F5F4F0',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
};

// ─── Preferences Model ────────────────────────────────────────────────────────
export interface Preferences {
  studyPreference: 'morning' | 'afternoon' | 'evening';
  maxContinuousHours: number;
  requireFrequentBreaks: boolean;
  breakIntervalMins: number;
  allowWeekendShifting: boolean;
  focusMode: boolean;
}

const DEFAULT_PREFS: Preferences = {
  studyPreference: 'morning',
  maxContinuousHours: 2,
  requireFrequentBreaks: true,
  breakIntervalMins: 30,
  allowWeekendShifting: false,
  focusMode: true,
};

// ─── Shared Sub-Components ────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        background: value ? T.primary : T.border,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.3s ease',
        border: 'none',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: value ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
          transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
    </button>
  );
}

function RowCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 18,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 7,
            height: 7,
            borderRadius: 9999,
            background: i === current ? T.primary : T.border,
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── ZenSync Logo SVG ─────────────────────────────────────────────────────────
function ZenSyncLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="16" fill={T.primary} />
      {/* Two interlocking arcs — "sync" metaphor */}
      <path
        d="M14 28 C14 20.268 20.268 14 28 14"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M28 14 C35.732 14 42 20.268 42 28"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M42 28 C42 35.732 35.732 42 28 42"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M28 42 C20.268 42 14 35.732 14 28"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="28" cy="28" r="5" fill="white" />
      {/* Arrow tip top */}
      <path d="M25 12 L28 14 L31 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Arrow tip bottom */}
      <path d="M25 44 L28 42 L31 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(168deg, ${T.primarySoft} 0%, ${T.bg} 55%)`,
        padding: '0 28px 32px',
        overflow: 'hidden',
      }}
    >
      {/* Top illustration area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          paddingTop: 20,
        }}
      >
        {/* Floating card mockups */}
        <div style={{ position: 'relative', width: 280, height: 200 }}>
          {/* Background card 1 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 30,
              width: 200,
              background: '#fff',
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow: '0 8px 24px rgba(79,99,210,0.12)',
              transform: 'rotate(-6deg)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 90, height: 8, background: '#FDE68A', borderRadius: 4 }} />
            </div>
            <div style={{ width: '100%', height: 6, background: T.borderSoft, borderRadius: 4, marginBottom: 5 }} />
            <div style={{ width: '70%', height: 6, background: T.borderSoft, borderRadius: 4 }} />
          </div>
          {/* Background card 2 */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 10,
              width: 195,
              background: '#fff',
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow: '0 8px 24px rgba(79,99,210,0.12)',
              transform: 'rotate(5deg)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              <div style={{ width: 80, height: 8, background: '#A7F3D0', borderRadius: 4 }} />
            </div>
            <div style={{ width: '100%', height: 6, background: T.borderSoft, borderRadius: 4, marginBottom: 5 }} />
            <div style={{ width: '60%', height: 6, background: T.borderSoft, borderRadius: 4 }} />
          </div>
          {/* Center logo card */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -30%)',
              background: '#fff',
              borderRadius: 24,
              padding: '20px',
              boxShadow: '0 16px 48px rgba(79,99,210,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              zIndex: 2,
            }}
          >
            <ZenSyncLogo size={52} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[T.accent, T.primary, '#F59E0B'].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: T.text,
              letterSpacing: '-0.8px',
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Less chaos,<br />
            <span style={{ color: T.primary }}>more flow.</span>
          </h1>
          <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.6, maxWidth: 290 }}>
            ZenSync learns your schedule and builds a calm, realistic daily plan — automatically.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: <Zap size={13} />, label: 'AI-Optimized' },
            { icon: <Coffee size={13} />, label: 'Break-Aware' },
            { icon: <Calendar size={13} />, label: 'Sync-Ready' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: '6px 12px',
                color: T.textSec,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {icon}
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        style={{
          width: '100%',
          background: T.primary,
          color: '#fff',
          border: 'none',
          borderRadius: 18,
          padding: '17px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(79,99,210,0.4)',
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '-0.2px',
        }}
      >
        Get Started
        <ArrowRight size={18} />
      </button>
      <p style={{ textAlign: 'center', fontSize: 12, color: T.textMuted, marginTop: 12 }}>
        Takes about 60 seconds
      </p>
    </div>
  );
}

// ─── Step 1: Your Rhythm ──────────────────────────────────────────────────────
function RhythmStep({
  prefs,
  setPrefs,
  onNext,
  onBack,
}: {
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const studyOptions: { value: Preferences['studyPreference']; label: string; icon: React.ReactNode; sub: string }[] = [
    { value: 'morning', label: 'Morning', icon: <Sun size={18} />, sub: '6AM – 12PM' },
    { value: 'afternoon', label: 'Afternoon', icon: <CloudSun size={18} />, sub: '12PM – 6PM' },
    { value: 'evening', label: 'Evening', icon: <Moon size={18} />, sub: '6PM – 11PM' },
  ];

  const hoursLabel = (v: number) =>
    v === 1 ? '1 hour' : v % 1 === 0.5 ? `${v}h` : `${v} hours`;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '0 24px 28px',
      }}
      className="zs-scroll"
    >
      {/* Header */}
      <div style={{ paddingTop: 8, paddingBottom: 28 }}>
        <StepDots total={3} current={0} />
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: T.text,
            letterSpacing: '-0.5px',
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          Set your rhythm
        </h2>
        <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>
          When do you have the most mental energy?
        </p>
      </div>

      {/* Study Preference */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: T.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}
        >
          Peak Study Time
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {studyOptions.map(({ value, label, icon, sub }) => {
            const active = prefs.studyPreference === value;
            return (
              <button
                key={value}
                onClick={() => setPrefs({ ...prefs, studyPreference: value })}
                style={{
                  flex: 1,
                  border: active ? `2px solid ${T.primary}` : `2px solid ${T.border}`,
                  borderRadius: 16,
                  padding: '14px 8px',
                  background: active ? T.primarySoft : T.surface,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: active ? T.primary : T.borderSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? '#fff' : T.textMuted,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {icon}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? T.primary : T.text,
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: 11, color: T.textMuted }}>{sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Continuous Hours */}
      <div
        style={{
          background: T.surface,
          borderRadius: 20,
          padding: '20px 20px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
              Max focus block
            </p>
            <p style={{ fontSize: 12, color: T.textSec }}>
              Before a break is needed
            </p>
          </div>
          <div
            style={{
              background: T.primarySoft,
              color: T.primary,
              borderRadius: 12,
              padding: '6px 14px',
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {hoursLabel(prefs.maxContinuousHours)}
          </div>
        </div>

        <div style={{ paddingTop: 18, paddingBottom: 4 }}>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={prefs.maxContinuousHours}
            onChange={(e) =>
              setPrefs({ ...prefs, maxContinuousHours: parseFloat(e.target.value) })
            }
            style={{
              width: '100%',
              accentColor: T.primary,
            }}
          />
        </div>

        {/* Tick marks */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: 2,
            paddingRight: 2,
          }}
        >
          {['30m', '1h', '1.5h', '2h', '2.5h', '3h', '3.5h', '4h'].map((l) => (
            <span key={l} style={{ fontSize: 10, color: T.textMuted }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Focus Level Context */}
      <div
        style={{
          background: T.accentSoft,
          borderRadius: 16,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Sparkles size={18} color={T.accent} style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#2D6A4F', lineHeight: 1.5 }}>
          {prefs.maxContinuousHours <= 1
            ? 'Short blocks keep your mind fresh — great for high-pressure periods.'
            : prefs.maxContinuousHours <= 2
            ? 'Balanced blocks with breaks — the scientifically optimal approach.'
            : 'Long focus blocks work for deep work, but may increase fatigue.'}
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            border: `1.5px solid ${T.border}`,
            background: T.surface,
            color: T.textSec,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            background: T.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Your Rules ───────────────────────────────────────────────────────
function RulesStep({
  prefs,
  setPrefs,
  onNext,
  onBack,
}: {
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const breakOptions = [15, 30, 45];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '0 24px 28px',
      }}
      className="zs-scroll"
    >
      {/* Header */}
      <div style={{ paddingTop: 8, paddingBottom: 28 }}>
        <StepDots total={3} current={1} />
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: T.text,
            letterSpacing: '-0.5px',
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          Define your rules
        </h2>
        <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>
          These boundaries keep you balanced — not burnt out.
        </p>
      </div>

      {/* Require Frequent Breaks */}
      <div style={{ marginBottom: 12 }}>
        <RowCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                background: prefs.requireFrequentBreaks ? T.accentSoft : T.borderSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.3s',
              }}
            >
              <Coffee size={20} color={prefs.requireFrequentBreaks ? T.accent : T.textMuted} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
                Frequent breaks
              </p>
              <p style={{ fontSize: 12, color: T.textSec }}>
                Insert recovery time between tasks
              </p>
            </div>
          </div>
          <Toggle
            value={prefs.requireFrequentBreaks}
            onChange={(v) => setPrefs({ ...prefs, requireFrequentBreaks: v })}
          />
        </RowCard>

        {/* Progressive Disclosure: break interval */}
        {prefs.requireFrequentBreaks && (
          <div
            style={{
              background: T.primarySoft,
              borderRadius: '0 0 18px 18px',
              padding: '14px 20px',
              marginTop: -8,
              paddingTop: 20,
              transition: 'all 0.3s ease',
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.primary,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Break every
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {breakOptions.map((min) => (
                <button
                  key={min}
                  onClick={() => setPrefs({ ...prefs, breakIntervalMins: min })}
                  style={{
                    flex: 1,
                    padding: '9px 4px',
                    borderRadius: 12,
                    border: 'none',
                    background:
                      prefs.breakIntervalMins === min ? T.primary : '#fff',
                    color:
                      prefs.breakIntervalMins === min ? '#fff' : T.textSec,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Allow Weekend Shifting */}
      <RowCard style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: prefs.allowWeekendShifting ? T.primarySoft : T.borderSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s',
            }}
          >
            <Calendar
              size={20}
              color={prefs.allowWeekendShifting ? T.primary : T.textMuted}
            />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
              Shift to weekends
            </p>
            <p style={{ fontSize: 12, color: T.textSec }}>
              Move overflow tasks to Sat/Sun
            </p>
          </div>
        </div>
        <Toggle
          value={prefs.allowWeekendShifting}
          onChange={(v) => setPrefs({ ...prefs, allowWeekendShifting: v })}
        />
      </RowCard>

      {/* Focus Mode */}
      <RowCard style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: prefs.focusMode ? T.primarySoft : T.borderSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s',
            }}
          >
            <Zap size={20} color={prefs.focusMode ? T.primary : T.textMuted} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
              Deep focus mode
            </p>
            <p style={{ fontSize: 12, color: T.textSec }}>
              Minimize distractions during study blocks
            </p>
          </div>
        </div>
        <Toggle
          value={prefs.focusMode}
          onChange={(v) => setPrefs({ ...prefs, focusMode: v })}
        />
      </RowCard>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            border: `1.5px solid ${T.border}`,
            background: T.surface,
            color: T.textSec,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            background: T.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: All Set ──────────────────────────────────────────────────────────
function ReadyStep({
  prefs,
  onNext,
  onBack,
}: {
  prefs: Preferences;
  onNext: () => void;
  onBack: () => void;
}) {
  const summary = [
    {
      label: 'Peak study time',
      value:
        prefs.studyPreference === 'morning'
          ? '☀️ Morning'
          : prefs.studyPreference === 'afternoon'
          ? '🌤 Afternoon'
          : '🌙 Evening',
    },
    {
      label: 'Max focus block',
      value: `⏱ ${prefs.maxContinuousHours}h`,
    },
    {
      label: 'Frequent breaks',
      value: prefs.requireFrequentBreaks
        ? `☕ Every ${prefs.breakIntervalMins} min`
        : '🔁 Minimal breaks',
    },
    {
      label: 'Weekend flexibility',
      value: prefs.allowWeekendShifting ? '📅 Allowed' : '🚫 Weekdays only',
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '0 24px 28px',
        background: `linear-gradient(168deg, ${T.primarySoft} 0%, ${T.bg} 50%)`,
      }}
      className="zs-scroll"
    >
      <div style={{ paddingTop: 8, paddingBottom: 20 }}>
        <StepDots total={3} current={2} />
      </div>

      {/* Hero */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingBottom: 28,
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 24,
            background: T.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 12px 32px rgba(79,99,210,0.35)',
          }}
        >
          <CheckCircle size={38} color="#fff" strokeWidth={2} />
        </div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: T.text,
            letterSpacing: '-0.5px',
            marginBottom: 8,
          }}
        >
          You're all set!
        </h2>
        <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 270 }}>
          Your personalized ZenSync plan is ready. Here's what we'll optimize for:
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {summary.map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: T.surface,
              borderRadius: 16,
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <span style={{ fontSize: 13, color: T.textSec }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        style={{
          width: '100%',
          background: T.primary,
          color: '#fff',
          border: 'none',
          borderRadius: 18,
          padding: '17px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(79,99,210,0.4)',
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        <Sparkles size={18} />
        Start My Day
      </button>
      <button
        onClick={onBack}
        style={{
          width: '100%',
          background: 'transparent',
          color: T.textSec,
          border: 'none',
          borderRadius: 16,
          padding: '12px',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        ← Adjust preferences
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  const goNext = () => {
    if (step === 3) {
      localStorage.setItem('zensync_prefs', JSON.stringify(prefs));
      navigate('/dashboard');
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const screens = [
    <WelcomeStep key="welcome" onNext={goNext} />,
    <RhythmStep key="rhythm" prefs={prefs} setPrefs={setPrefs} onNext={goNext} onBack={goBack} />,
    <RulesStep key="rules" prefs={prefs} setPrefs={setPrefs} onNext={goNext} onBack={goBack} />,
    <ReadyStep key="ready" prefs={prefs} onNext={goNext} onBack={goBack} />,
  ];

  return (
    <PhoneFrame>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {screens[step]}
      </div>
    </PhoneFrame>
  );
}
