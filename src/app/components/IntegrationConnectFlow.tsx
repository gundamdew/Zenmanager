/**
 * IntegrationConnectFlow — full-screen slide-in overlay that simulates
 * the OAuth / connection process for Google Calendar and Notion.
 *
 * Steps:
 *   1. intro      — branded overview + permission list + CTA
 *   2. authorizing — animated loading (auto-advances after ~2 s)
 *   3. selecting   — user picks which calendars / Notion pages to sync
 *   4. success     — animated confirmation + import summary
 */
import { useState, useEffect } from 'react';
import {
  ArrowLeft, ShieldCheck, XCircle, CheckCircle2, Check,
  ChevronRight, Sparkles, Calendar, BookOpen, RefreshCw,
  Clock, Globe, Lock, FileText, Star,
} from 'lucide-react';

import { T as THEME, BRAND_GRADIENT, glass } from '../theme/glass';

// ─── Design Tokens (ZenManager – Liquid Glass) ──────────────────────────────────
const T = THEME;

export type ConnectService = 'google-calendar' | 'notion';
type Step = 'intro' | 'authorizing' | 'selecting' | 'success';

export interface IntegrationConnectFlowProps {
  service: ConnectService;
  onBack: () => void;
  onConnected: (service: ConnectService, items: string[]) => void;
}

// ─── Service metadata ─────────────────────────────────────────────────────────
const SERVICE_META = {
  'google-calendar': {
    name:       'Google Calendar',
    shortName:  'Google',
    tagline:    'Import your class timetable and personal events directly into ZenSync.',
    authLabel:  'Continue with Google',
    authNote:   `You'll be redirected to Google to authorise access. ZenSync never stores your Google password.`,
    brand:      '#4285F4',
    brandSoft:  '#EBF3FE',
    accountInfo:'alex.johnson@gmail.com',
    accountSub: 'Google Account',
    permsAllow: [
      'View events in calendars you select',
      'Read event titles, times & locations',
      'See your primary email address',
    ],
    permsDeny: [
      'Create, edit or delete events',
      'Access other Google products',
      'Share your data with third parties',
    ],
    selectTitle:    'Choose calendars to import',
    selectSubtitle: 'Selecting a calendar will pull all future events into ZenSync.',
    items: [
      { id:'cal_personal',    label:'Personal',           sub:'alex.johnson@gmail.com', icon:'🗓' },
      { id:'cal_university',  label:'University Events',  sub:'Shared by WUT',           icon:'🎓' },
      { id:'cal_reminders',   label:'Reminders',          sub:'Google Reminders',         icon:'🔔' },
      { id:'cal_holidays',    label:'Holidays in Poland', sub:'via Google',               icon:'🇵🇱' },
    ],
    defaultSelected: ['cal_personal', 'cal_university'],
    successTitle:   'Google Calendar Connected!',
    successBody:    'Your selected calendars are syncing. New events appear in ZenSync within minutes.',
    successBadge:   '2 calendars',
    importedEvents: [
      { time:'Mon 08:00', title:'Data Structures', color:'#3B82F6' },
      { time:'Tue 07:30', title:'Software Engineering', color:'#3B82F6' },
      { time:'Wed 08:00', title:'Physics Lecture', color:'#3B82F6' },
    ],
  },
  notion: {
    name:       'Notion',
    shortName:  'Notion',
    tagline:    'Sync your study notes and project pages so ZenSync can reference them in your plan.',
    authLabel:  'Authorise Notion',
    authNote:   `You'll be redirected to Notion to select which pages to share. ZenSync only reads the pages you choose.`,
    brand:      '#000000',
    brandSoft:  '#F3F3F3',
    accountInfo:'Alex Johnson\'s Workspace',
    accountSub: 'notion.so',
    permsAllow: [
      'Read pages and databases you share',
      'View page titles, content & metadata',
      'Access last-edited timestamps',
    ],
    permsDeny: [
      'Edit or delete any pages',
      'Access pages you don\'t share',
      'Modify your workspace settings',
    ],
    selectTitle:    'Select pages to sync',
    selectSubtitle: 'ZenSync will reference these notes when building your study plan.',
    items: [
      { id:'pg_ds',      label:'CS3001 — Data Structures',  sub:'Last edited 2 days ago',  icon:'📚' },
      { id:'pg_algo',    label:'Algorithms Study Guide',    sub:'Last edited yesterday',    icon:'📝' },
      { id:'pg_goals',   label:'Semester Goals',            sub:'Last edited 1 week ago',   icon:'🎯' },
      { id:'pg_project', label:'Team Alpha — Group Project', sub:'Shared workspace',         icon:'🗂' },
      { id:'pg_journal', label:'Personal Journal',          sub:'Private',                  icon:'📖' },
    ],
    defaultSelected: ['pg_ds', 'pg_algo', 'pg_goals'],
    successTitle:   'Notion Connected!',
    successBody:    'Your selected pages are now linked. ZenSync will surface relevant notes when planning study blocks.',
    successBadge:   '3 pages',
    importedEvents: [
      { time:'Study block', title:'CS3001 notes ready', color:'#A855F7' },
      { time:'Study block', title:'Algo guide attached', color:'#A855F7' },
      { time:'Plan',        title:'Goals synced',        color:'#A855F7' },
    ],
  },
} as const;

// ─── Brand logos (CSS-rendered) ───────────────────────────────────────────────
function GCalLogo({ size = 48 }: { size?: number }) {
  const s = size * 0.42;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: '#fff', boxShadow: '0 4px 16px rgba(66,133,244,0.25)',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: Math.round(size * 0.05), padding: Math.round(size * 0.1),
      overflow: 'hidden',
    }}>
      <div style={{ background: '#4285F4', borderRadius: size * 0.06 }} />
      <div style={{ background: '#EA4335', borderRadius: size * 0.06 }} />
      <div style={{ background: '#34A853', borderRadius: size * 0.06 }} />
      <div style={{ background: '#FBBC04', borderRadius: size * 0.06 }} />
    </div>
  );
}

function NotionLogo({ size = 48 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: size * 0.62, height: size * 0.62,
        background: '#000', borderRadius: size * 0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          color: '#fff', fontSize: size * 0.4,
          fontWeight: 900, fontFamily: 'Georgia, serif', letterSpacing: '-0.05em',
        }}>N</span>
      </div>
    </div>
  );
}

function ServiceLogo({ service, size = 48 }: { service: ConnectService; size?: number }) {
  return service === 'google-calendar'
    ? <GCalLogo size={size} />
    : <NotionLogo size={size} />;
}

// ─── Permission row ───────────────────────────────────────────────────────────
function PermRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 7,
        background: allowed ? T.accentSoft : '#FEF2F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {allowed
          ? <Check size={12} color={T.accent} strokeWidth={2.5} />
          : <XCircle size={12} color="#EF4444" strokeWidth={2} />
        }
      </div>
      <span style={{ fontSize: 12, color: allowed ? T.textSec : T.textMuted, lineHeight: 1.4 }}>
        {label}
      </span>
    </div>
  );
}

// ─── Selectable item row ──────────────────────────────────────────────────────
function SelectItem({
  item, selected, onToggle, brandColor,
}: {
  item: { id: string; label: string; sub: string; icon: string };
  selected: boolean;
  onToggle: (id: string) => void;
  brandColor: string;
}) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        background: selected ? `${brandColor}0D` : T.surface,
        border: selected ? `1.5px solid ${brandColor}55` : `1.5px solid ${T.border}`,
        borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
        marginBottom: 8, outline: 'none', textAlign: 'left',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {item.label}
        </p>
        <p style={{ fontSize: 11, color: T.textMuted }}>{item.sub}</p>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
        background: selected ? brandColor : 'transparent',
        border: selected ? 'none' : `2px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {selected && <Check size={13} color="#fff" strokeWidth={2.5} />}
      </div>
    </button>
  );
}

// ─── Pulsing loading dot ──────────────────────────────────────────────────────
function LoadingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: color,
          animation: `zsBounceDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes zsBounceDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Step 1: Intro ────────────────────────────────────────────────────────────
function IntroStep({
  service, meta, onNext,
}: {
  service: ConnectService;
  meta: (typeof SERVICE_META)[ConnectService];
  onNext: () => void;
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      className="zs-scroll">
      {/* Hero */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 24px 20px', gap: 14,
        background: meta.brandSoft,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <ServiceLogo service={service} size={64} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.5px',
            marginBottom: 6 }}>
            Connect {meta.name}
          </h2>
          <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, maxWidth: 280 }}>
            {meta.tagline}
          </p>
        </div>
      </div>

      <div style={{ padding: '18px 20px', flex: 1 }}>
        {/* Permissions */}
        <div style={{
          ...glass(18), padding: '16px 16px 8px', marginBottom: 14,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            What ZenSync will access
          </p>
          {meta.permsAllow.map(p => <PermRow key={p} label={p} allowed={true} />)}

          <div style={{ height: 1, background: T.borderSoft, margin: '10px 0' }} />

          <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            What ZenSync won't access
          </p>
          {meta.permsDeny.map(p => <PermRow key={p} label={p} allowed={false} />)}
        </div>

        {/* Security note */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: T.accentSoft, borderRadius: 14, padding: '12px 14px',
          marginBottom: 20,
        }}>
          <ShieldCheck size={16} color={T.accent} style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2D6A4F', marginBottom: 2 }}>
              End-to-end secure
            </p>
            <p style={{ fontSize: 11, color: '#2D6A4F', lineHeight: 1.5, opacity: 0.85 }}>
              {meta.authNote}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 16, border: 'none',
            background: meta.brand,
            color: service === 'notion' ? '#fff' : '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 6px 20px ${meta.brand}40`,
            transition: 'opacity 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseUp={e => (e.currentTarget.style.opacity = '1')}
        >
          <ServiceLogo service={service} size={20} />
          {meta.authLabel}
        </button>

        <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 12,
          lineHeight: 1.5 }}>
          By connecting, you agree to ZenSync's{' '}
          <span style={{ color: T.primary, textDecoration: 'underline' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: T.primary, textDecoration: 'underline' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Authorizing ──────────────────────────────────────────────────────
function AuthorizingStep({
  service, meta,
}: {
  service: ConnectService;
  meta: (typeof SERVICE_META)[ConnectService];
}) {
  const stages = [
    'Opening secure connection…',
    `Verifying with ${meta.shortName}…`,
    'Checking permissions…',
    'Almost done…',
  ];
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStageIdx(s => Math.min(s + 1, stages.length - 1)), 550);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
      {/* Spinning logo */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        {/* Outer ring */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          border: `3px solid ${meta.brand}22`,
          borderTopColor: meta.brand,
          animation: 'zsSpinRing 1.1s linear infinite',
          position: 'absolute', top: -8, left: -8,
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: meta.brandSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ServiceLogo service={service} size={48} />
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text,
        letterSpacing: '-0.4px', marginBottom: 8, textAlign: 'center' }}>
        Connecting to {meta.name}
      </h3>

      {/* Stage label */}
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 20,
        height: 20, textAlign: 'center', transition: 'opacity 0.3s' }}>
        {stages[stageIdx]}
      </p>

      <LoadingDots color={meta.brand} />

      {/* Security strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginTop: 32, background: T.accentSoft,
        borderRadius: 20, padding: '8px 14px',
      }}>
        <Lock size={12} color={T.accent} />
        <span style={{ fontSize: 11, color: '#2D6A4F', fontWeight: 500 }}>
          256-bit encrypted OAuth 2.0
        </span>
      </div>

      <style>{`
        @keyframes zsSpinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Step 3: Selecting ────────────────────────────────────────────────────────
function SelectingStep({
  service, meta, onNext,
}: {
  service: ConnectService;
  meta: (typeof SERVICE_META)[ConnectService];
  onNext: (selectedIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(meta.defaultSelected as string[])
  );

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Account strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        margin: '12px 16px 0',
        background: T.surface, borderRadius: 14, padding: '10px 14px',
        border: `1px solid ${T.border}`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: meta.brandSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ServiceLogo service={service} size={22} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{meta.accountInfo}</p>
          <p style={{ fontSize: 11, color: T.textMuted }}>{meta.accountSub}</p>
        </div>
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
          background: T.accentSoft, borderRadius: 20, padding: '3px 9px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#2D6A4F' }}>Authorised</span>
        </div>
      </div>

      {/* Section info */}
      <div style={{ padding: '12px 18px 6px' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>
          {meta.selectTitle}
        </p>
        <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>
          {meta.selectSubtitle}
        </p>
      </div>

      {/* Item list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 8px' }} className="zs-scroll">
        {(meta.items as readonly { id: string; label: string; sub: string; icon: string }[]).map(item => (
          <SelectItem
            key={item.id}
            item={item}
            selected={selected.has(item.id)}
            onToggle={toggle}
            brandColor={meta.brand}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '8px 16px 12px', flexShrink: 0 }}>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>
            {selected.size} {selected.size === 1 ? 'item' : 'items'} selected
          </span>
        </div>
        <button
          disabled={selected.size === 0}
          onClick={() => onNext(Array.from(selected))}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 16, border: 'none',
            background: selected.size === 0 ? T.border : meta.brand,
            color: '#fff', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 700, cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: selected.size === 0 ? 'none' : `0 6px 20px ${meta.brand}40`,
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={15} />
          Sync {selected.size > 0 ? selected.size : ''} {service === 'google-calendar' ? 'Calendar' : 'Page'}{selected.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────
function SuccessStep({
  service, meta, selectedCount, onDone,
}: {
  service: ConnectService;
  meta: (typeof SERVICE_META)[ConnectService];
  selectedCount: number;
  onDone: () => void;
}) {
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimIn(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '32px 24px 20px' }}>

      {/* Animated checkmark */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: T.accentSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        transform: animIn ? 'scale(1)' : 'scale(0.4)',
        opacity: animIn ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <CheckCircle2 size={44} color={T.accent} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.5px',
        textAlign: 'center', marginBottom: 8,
        transform: animIn ? 'translateY(0)' : 'translateY(12px)',
        opacity: animIn ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s',
      }}>
        {meta.successTitle}
      </h2>

      <p style={{
        fontSize: 13, color: T.textSec, lineHeight: 1.6, textAlign: 'center',
        marginBottom: 20, maxWidth: 280,
        opacity: animIn ? 1 : 0,
        transition: 'opacity 0.4s ease 0.2s',
      }}>
        {meta.successBody}
      </p>

      {/* Import summary chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: meta.brandSoft, borderRadius: 20, padding: '7px 16px',
        marginBottom: 20,
        opacity: animIn ? 1 : 0,
        transition: 'opacity 0.4s ease 0.25s',
      }}>
        <ServiceLogo service={service} size={18} />
        <span style={{ fontSize: 13, fontWeight: 700, color: meta.brand !== '#000000' ? meta.brand : T.text }}>
          {selectedCount} {service === 'google-calendar' ? 'calendar' : 'page'}{selectedCount !== 1 ? 's' : ''} syncing
        </span>
      </div>

      {/* Preview card */}
      <div style={{
        ...glass(18),
        width: '100%', padding: '14px 16px',
        marginBottom: 20,
        opacity: animIn ? 1 : 0,
        transition: 'opacity 0.4s ease 0.3s',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
          What's been imported
        </p>
        {meta.importedEvents.map((ev, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 8 : 0,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: ev.color, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{ev.title}</p>
              <p style={{ fontSize: 10, color: T.textMuted }}>{ev.time}</p>
            </div>
            <Check size={13} color={T.accent} strokeWidth={2.5} />
          </div>
        ))}
        {selectedCount > 3 && (
          <p style={{ fontSize: 11, color: T.primary, marginTop: 8, fontWeight: 500 }}>
            + {selectedCount * 4 - 3} more events imported
          </p>
        )}
      </div>

      {/* ZenSync tip */}
      <div style={{
        width: '100%',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: T.primarySoft, borderRadius: 14, padding: '12px 14px',
        marginBottom: 'auto',
        opacity: animIn ? 1 : 0,
        transition: 'opacity 0.4s ease 0.35s',
      }}>
        <Sparkles size={14} color={T.primary} style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: T.primary, lineHeight: 1.5 }}>
          <strong>Tip:</strong> Head to the Schedule tab to see your imported events. Tap{' '}
          <strong>Re-optimize</strong> on the Dashboard to rebuild your plan with this new data.
        </p>
      </div>

      {/* Done CTA */}
      <button
        onClick={onDone}
        style={{
          width: '100%', marginTop: 16, padding: '14px 0',
          borderRadius: 16, border: 'none',
          background: BRAND_GRADIENT, color: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(16,185,129,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          opacity: animIn ? 1 : 0,
          transition: 'opacity 0.4s ease 0.4s',
        }}
      >
        <CheckCircle2 size={16} />
        Done
      </button>
    </div>
  );
}

// ─── Root: the full-screen overlay shell ──────────────────────────────────────
export function IntegrationConnectFlow({
  service, onBack, onConnected,
}: IntegrationConnectFlowProps) {
  const meta = SERVICE_META[service];
  const [step, setStep]           = useState<Step>('intro');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visible, setVisible]     = useState(false);

  // Slide in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Auto-advance from authorizing → selecting
  useEffect(() => {
    if (step !== 'authorizing') return;
    const id = setTimeout(() => setStep('selecting'), 2400);
    return () => clearTimeout(id);
  }, [step]);

  const stepTitles: Record<Step, string> = {
    intro:       meta.name,
    authorizing: 'Authorising…',
    selecting:   service === 'google-calendar' ? 'Select Calendars' : 'Select Pages',
    success:     'All Done!',
  };

  const handleSelectDone = (ids: string[]) => {
    setSelectedIds(ids);
    setStep('success');
  };

  const handleDone = () => {
    onConnected(service, selectedIds);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        background: 'transparent',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        height: 54,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', flexShrink: 0,
      }}>
        {/* Back / close */}
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 12,
            border: `1.5px solid ${T.border}`, background: T.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, outline: 'none',
          }}
        >
          <ArrowLeft size={17} color={T.textSec} />
        </button>

        {/* Step progress dots */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5 }}>
          {(['intro', 'authorizing', 'selecting', 'success'] as Step[]).map((s, i) => {
            const stepOrder: Record<Step, number> = { intro:0, authorizing:1, selecting:2, success:3 };
            const current = stepOrder[step];
            const isCurrent = s === step;
            const isPast = stepOrder[s] < current;
            return (
              <div key={s} style={{
                height: 4,
                width: isCurrent ? 20 : 8,
                borderRadius: 9999,
                background: isCurrent ? T.primary : isPast ? T.accent : T.border,
                transition: 'all 0.3s ease',
              }} />
            );
          })}
        </div>

        <div style={{ width: 36, flexShrink: 0 }} />
      </div>

      {/* ── Sub-header for non-intro steps ── */}
      {step !== 'intro' && step !== 'authorizing' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px 8px',
          background: T.surface,
          borderBottom: `1px solid ${T.borderSoft}`,
        }}>
          <ServiceLogo service={service} size={28} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{stepTitles[step]}</p>
            <p style={{ fontSize: 11, color: T.textMuted }}>{meta.name}</p>
          </div>
        </div>
      )}

      {/* ── Step content ── */}
      {step === 'intro' && (
        <IntroStep service={service} meta={meta} onNext={() => setStep('authorizing')} />
      )}
      {step === 'authorizing' && (
        <AuthorizingStep service={service} meta={meta} />
      )}
      {step === 'selecting' && (
        <SelectingStep service={service} meta={meta} onNext={handleSelectDone} />
      )}
      {step === 'success' && (
        <SuccessStep
          service={service}
          meta={meta}
          selectedCount={selectedIds.length}
          onDone={handleDone}
        />
      )}
    </div>
  );
}