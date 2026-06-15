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
  CheckCircle,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { BrandLogo } from './BrandLogo';

// ─── Design Tokens (ZenManager – Liquid Glass) ──────────────────────────────────
const T = {
  primary: '#10B981',          // brand green (solid accent / active state)
  primarySoft: 'rgba(16,185,129,0.10)',
  primaryMid: 'rgba(16,185,129,0.25)',
  accent: '#2ECC71',
  accentSoft: 'rgba(46,204,113,0.10)',
  bg: '#FAFAFA',               // background base
  surface: 'rgba(255,255,255,0.6)', // liquid glass surface
  text: '#222222',             // text primary
  textSec: '#717171',          // text secondary
  textMuted: '#9A9A9A',
  border: 'rgba(255,255,255,0.4)',  // glass border
  borderSoft: 'rgba(0,0,0,0.06)',
};

// Brand gradient (accent) — primary CTAs & active states
const BRAND_GRADIENT = 'linear-gradient(135deg, #2ECC71 0%, #10B981 100%)';

// Liquid Glass container style (Card / Modal / floating containers)
const GLASS: CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: 24,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
};

// ─── Preferences Model ────────────────────────────────────────────────────────
export interface Preferences {
  studyPreference: 'morning' | 'afternoon' | 'evening';
  maxContinuousHours: number;
  requireFrequentBreaks: boolean;
  breakIntervalMins: number;
}

const DEFAULT_PREFS: Preferences = {
  studyPreference: 'morning',
  maxContinuousHours: 2,
  requireFrequentBreaks: true,
  breakIntervalMins: 30,
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
        ...GLASS,
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          ...GLASS,
          padding: '20px 20px 16px',
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
            ...GLASS,
            width: 56,
            height: 56,
            borderRadius: 16,
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
            height: 56,
            background: BRAND_GRADIENT,
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 700,
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
      <div style={{ marginBottom: 28 }}>
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

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            ...GLASS,
            width: 56,
            height: 56,
            borderRadius: 16,
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
            height: 56,
            background: BRAND_GRADIENT,
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 700,
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
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '0 24px 28px',
        background: `linear-gradient(168deg, rgba(46,204,113,0.12) 0%, ${T.bg} 50%)`,
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
        <div style={{ marginBottom: 16 }}>
          <BrandLogo size={76} />
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
              ...GLASS,
              borderRadius: 16,
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
          height: 56,
          background: BRAND_GRADIENT,
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(16,185,129,0.10)',
          fontSize: 16,
          fontWeight: 700,
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
    if (step === 2) {
      localStorage.setItem('zensync_prefs', JSON.stringify(prefs));
      navigate('/dashboard');
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const screens = [
    <RhythmStep key="rhythm" prefs={prefs} setPrefs={setPrefs} onNext={goNext} onBack={goBack} />,
    <RulesStep key="rules" prefs={prefs} setPrefs={setPrefs} onNext={goNext} onBack={goBack} />,
    <ReadyStep key="ready" prefs={prefs} onNext={goNext} onBack={goBack} />,
  ];

  return (
    <PhoneFrame>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Brand bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 24px 4px', flexShrink: 0 }}>
          <BrandLogo size={30} wordmark title="ZenManager" />
        </div>
        {screens[step]}
      </div>
    </PhoneFrame>
  );
}
