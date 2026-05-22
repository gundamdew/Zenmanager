/**
 * ProfileScreen — user hub + integrations + algorithm settings.
 * Features:
 *  - Gradient avatar with initials, name, university/major, stats strip
 *  - Integrations: connected (USOS + Work) + Google Calendar + Notion connect flows
 *  - Algorithm Preferences: toggles + slider
 *  - Account settings list
 */
import { useState } from 'react';
import {
  GraduationCap, Briefcase, Calendar, Plus, ChevronRight,
  Zap, Coffee, Clock, CalendarDays, Bell, LogOut,
  Shield, RefreshCw, Sparkles, BookOpen, Wifi, CheckCircle2,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { AppBottomNav } from './AppBottomNav';
import { IntegrationConnectFlow, ConnectService } from './IntegrationConnectFlow';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: '#4F63D2', primarySoft: '#EEF0FD',
  accent: '#7CC8A4',  accentSoft: '#E8F7F0',
  bg: '#F5F4F0',      surface: '#FFFFFF', surfaceAlt: '#F9F8F6',
  text: '#1A1A2E',    textSec: '#64748B', textMuted: '#94A3B8',
  border: '#E2E8F0',  borderSoft: '#F1F5F9',
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch" aria-checked={value}
      style={{
        width:52, height:30, borderRadius:15,
        background: value ? T.primary : T.border,
        cursor:'pointer', position:'relative',
        transition:'background 0.3s ease',
        border:'none', flexShrink:0, outline:'none',
      }}
    >
      <div style={{
        position:'absolute', top:3,
        left: value ? 25 : 3,
        width:24, height:24, borderRadius:12,
        background:'#fff',
        boxShadow:'0 2px 6px rgba(0,0,0,0.22)',
        transition:'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ paddingLeft:2, marginBottom:10 }}>
      <p style={{ fontSize:13, fontWeight:700, color:T.text, letterSpacing:'-0.2px' }}>{label}</p>
      {sub && <p style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>{sub}</p>}
    </div>
  );
}

// ─── Integration card ─────────────────────────────────────────────────────────
interface IntegrationProps {
  icon: React.ReactNode;
  name: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  syncedItems?: string;
  onPress?: () => void;
}
function IntegrationCard({ icon, name, status, lastSync, syncedItems, onPress }: IntegrationProps) {
  const connected = status === 'connected';
  return (
    <div style={{
      background: T.surface, borderRadius:18, padding:'14px 16px',
      display:'flex', alignItems:'center',
      boxShadow:'0 2px 10px rgba(0,0,0,0.05)', marginBottom:10,
      border: connected ? `1.5px solid ${T.border}` : `1.5px dashed ${T.border}`,
    }}>
      <div style={{
        width:44, height:44, borderRadius:14,
        background: connected ? T.primarySoft : T.bg,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginRight:12, flexShrink:0,
      }}>
        {icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:600, color:T.text, letterSpacing:'-0.2px',
          marginBottom:3, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
          {name}
        </p>
        {connected ? (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:1 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:T.accent }} />
              <span style={{ fontSize:11, color:'#065F46', fontWeight:600 }}>
                Connected & Syncing
              </span>
            </div>
            {lastSync && (
              <p style={{ fontSize:10, color:T.textMuted }}>
                Last sync: {lastSync}{syncedItems ? `  ·  ${syncedItems}` : ''}
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize:11, color:T.textMuted }}>Not connected</p>
        )}
      </div>
      {connected ? (
        <div style={{ display:'flex', alignItems:'center', gap:2,
          background:'#ECFDF5', borderRadius:20, padding:'5px 10px' }}>
          <CheckCircle2 size={12} color="#10B981" />
          <span style={{ fontSize:10, fontWeight:600, color:'#065F46' }}>Active</span>
        </div>
      ) : (
        <button
          onClick={onPress}
          style={{
            display:'flex', alignItems:'center', gap:4,
            background: T.primary, color:'#fff',
            borderRadius:20, padding:'6px 12px',
            border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
            fontFamily:"'DM Sans', sans-serif", outline:'none',
          }}
        >
          <Plus size={11} /> Connect
        </button>
      )}
    </div>
  );
}

// ─── Pref toggle row ──────────────────────────────────────────────────────────
function PrefToggle({ icon, iconBg, label, sub, value, onChange }: {
  icon: React.ReactNode; iconBg: string;
  label: string; sub: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ background:T.surface, borderRadius:18, padding:'14px 16px',
      display:'flex', alignItems:'center', marginBottom:10,
      boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ width:42, height:42, borderRadius:13, background:iconBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginRight:12, flexShrink:0, transition:'background 0.3s' }}>
        {icon}
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:11, color:T.textSec }}>{sub}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ─── Pref slider row ──────────────────────────────────────────────────────────
function PrefSlider({ icon, iconBg, label, sub, min, max, step, value, onChange, fmt }: {
  icon: React.ReactNode; iconBg: string;
  label: string; sub: string;
  min: number; max: number; step: number;
  value: number; onChange: (v: number) => void;
  fmt: (v: number) => string;
}) {
  return (
    <div style={{ background:T.surface, borderRadius:18, padding:'14px 16px',
      marginBottom:10, boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', alignItems:'center', marginBottom:12 }}>
        <div style={{ width:42, height:42, borderRadius:13, background:iconBg,
          display:'flex', alignItems:'center', justifyContent:'center',
          marginRight:12, flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:1 }}>{label}</p>
          <p style={{ fontSize:11, color:T.textSec }}>{sub}</p>
        </div>
        <div style={{ background:T.primarySoft, color:T.primary,
          borderRadius:12, padding:'5px 12px', fontSize:13, fontWeight:700 }}>
          {fmt(value)}
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:'100%', accentColor:T.primary }} />
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
        <span style={{ fontSize:10, color:T.textMuted }}>{fmt(min)}</span>
        <span style={{ fontSize:10, color:T.textMuted }}>{fmt(max)}</span>
      </div>
    </div>
  );
}

// ─── Account settings row ─────────────────────────────────────────────────────
function SettingsRow({ icon, iconBg, label, sub, danger, badge }: {
  icon: React.ReactNode; iconBg: string;
  label: string; sub?: string; danger?: boolean; badge?: string;
}) {
  return (
    <div style={{ background:T.surface, borderRadius:16, padding:'12px 16px',
      display:'flex', alignItems:'center', marginBottom:8,
      cursor:'pointer', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
      <div style={{ width:36, height:36, borderRadius:11, background:iconBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginRight:12, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:13, fontWeight:600, color: danger ? '#EF4444' : T.text }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:T.textMuted }}>{sub}</p>}
      </div>
      {badge && (
        <div style={{ background:'#EFF6FF', color:T.primary, borderRadius:20,
          padding:'2px 8px', fontSize:10, fontWeight:600, marginRight:6 }}>{badge}</div>
      )}
      <ChevronRight size={16} color={danger ? '#EF4444' : T.textMuted} />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar() {
  return (
    <div style={{
      width:76, height:76, borderRadius:'50%',
      background:'linear-gradient(135deg, #4F63D2 0%, #7C3AED 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 8px 24px rgba(79,99,210,0.35)', flexShrink:0,
    }}>
      <span style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.5px',
        fontFamily:"'DM Sans', sans-serif" }}>AJ</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ProfileScreen() {
  // Algorithm prefs
  const [deepFocus,      setDeepFocus]      = useState(true);
  const [frequentBreaks, setFrequentBreaks] = useState(true);
  const [maxHours,       setMaxHours]       = useState(2);
  const [weekendShift,   setWeekendShift]   = useState(false);
  const [smartNotifs,    setSmartNotifs]    = useState(true);

  // Integration connect flow state
  const [connectTarget, setConnectTarget] = useState<ConnectService | null>(null);

  // Tracks which third-party services have been connected (with sync metadata)
  const [connectedExtras, setConnectedExtras] = useState<
    Record<string, { syncedItems: string; lastSync: string }>
  >({});

  // Called when the user completes a connect flow
  const handleConnected = (service: ConnectService, selectedIds: string[]) => {
    const labels: Record<ConnectService, (count: number) => string> = {
      'google-calendar': c => `${c} calendar${c !== 1 ? 's' : ''} synced`,
      'notion':          c => `${c} page${c !== 1 ? 's' : ''} linked`,
    };
    setConnectedExtras(prev => ({
      ...prev,
      [service]: {
        syncedItems: labels[service](selectedIds.length),
        lastSync:    'Just now',
      },
    }));
    setConnectTarget(null);
  };

  const gcalConnected    = Boolean(connectedExtras['google-calendar']);
  const notionConnected  = Boolean(connectedExtras['notion']);

  return (
    <PhoneFrame>
      {/* ── Outer container — position:relative so overlays can be absolute ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column',
        overflow:'hidden', background:T.bg, position:'relative' }}>

        {/* ── Sticky Header ── */}
        <div style={{
          padding:'10px 20px 12px', background:T.surface,
          borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:'-0.4px' }}>
            Profile
          </h2>
          <div style={{ background:T.primarySoft, color:T.primary,
            borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:600 }}>
            Free Plan
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 8px' }} className="zs-scroll">

          {/* ── User header card ── */}
          <div style={{
            background:`linear-gradient(145deg, ${T.primarySoft} 0%, ${T.surface} 70%)`,
            borderRadius:22, padding:'20px 18px',
            boxShadow:'0 4px 20px rgba(79,99,210,0.1)',
            marginBottom:16, border:`1.5px solid ${T.primarySoft}`,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
              <Avatar />
              <div>
                <h3 style={{ fontSize:20, fontWeight:800, color:T.text,
                  letterSpacing:'-0.5px', lineHeight:1.2, marginBottom:3 }}>
                  Alex Johnson
                </h3>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                  <GraduationCap size={13} color={T.primary} />
                  <p style={{ fontSize:12, color:T.textSec }}>Warsaw Univ. of Technology</p>
                </div>
                <p style={{ fontSize:11, color:T.textMuted }}>Computer Science · Year 3</p>
              </div>
            </div>
            {/* Stats strip */}
            <div style={{ display:'flex', gap:6 }}>
              {[
                { label:'Work / week', value:'18.5h', color:'#065F46', bg:'#ECFDF5' },
                { label:'Study / week', value:'18h',  color:T.primary,  bg:T.primarySoft },
                { label:'Avg sleep',   value:'5.8h', color:'#92400E', bg:'#FFFBEB' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ flex:1, background:bg, borderRadius:12,
                  padding:'8px 6px', textAlign:'center' }}>
                  <p style={{ fontSize:14, fontWeight:800, color, letterSpacing:'-0.4px' }}>
                    {value}
                  </p>
                  <p style={{ fontSize:9, color, opacity:0.75, fontWeight:600, marginTop:1 }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Integrations ── */}
          <div style={{ marginBottom:6 }}>
            <SectionHeader label="Integrations" sub="Your connected data sources" />

            {/* Always-connected */}
            <IntegrationCard
              icon={<GraduationCap size={20} color={T.primary} />}
              name="USOS Academic Portal"
              status="connected"
              lastSync="2 min ago"
              syncedItems="24 classes imported"
            />
            <IntegrationCard
              icon={<Briefcase size={20} color="#10B981" />}
              name="Work Schedule System"
              status="connected"
              lastSync="15 min ago"
              syncedItems="12 shifts synced"
            />

            {/* Google Calendar — togglable */}
            <IntegrationCard
              icon={
                <div style={{ width:20, height:20, borderRadius:5, overflow:'hidden',
                  display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, padding:1.5,
                  background: gcalConnected ? T.primarySoft : T.bg }}>
                  <div style={{ background: gcalConnected ? '#4285F4' : T.textMuted, borderRadius:1.5 }} />
                  <div style={{ background: gcalConnected ? '#EA4335' : T.textMuted, borderRadius:1.5 }} />
                  <div style={{ background: gcalConnected ? '#34A853' : T.textMuted, borderRadius:1.5 }} />
                  <div style={{ background: gcalConnected ? '#FBBC04' : T.textMuted, borderRadius:1.5 }} />
                </div>
              }
              name="Google Calendar"
              status={gcalConnected ? 'connected' : 'disconnected'}
              lastSync={connectedExtras['google-calendar']?.lastSync}
              syncedItems={connectedExtras['google-calendar']?.syncedItems}
              onPress={() => setConnectTarget('google-calendar')}
            />

            {/* Notion — togglable */}
            <IntegrationCard
              icon={
                <div style={{ width:20, height:20, borderRadius:4,
                  background: notionConnected ? '#000' : T.textMuted,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:12, fontWeight:900,
                    fontFamily:'Georgia, serif' }}>N</span>
                </div>
              }
              name="Notion Study Notes"
              status={notionConnected ? 'connected' : 'disconnected'}
              lastSync={connectedExtras['notion']?.lastSync}
              syncedItems={connectedExtras['notion']?.syncedItems}
              onPress={() => setConnectTarget('notion')}
            />

            {/* Add more prompt */}
            <button style={{
              width:'100%', background:'transparent',
              border:`1.5px dashed ${T.border}`,
              borderRadius:18, padding:'13px 16px',
              display:'flex', alignItems:'center', gap:10,
              cursor:'pointer', marginBottom:10, outline:'none',
              fontFamily:"'DM Sans', sans-serif",
            }}>
              <div style={{ width:36, height:36, borderRadius:12,
                background:T.bg, border:`1.5px solid ${T.border}`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Plus size={16} color={T.textMuted} />
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ fontSize:13, fontWeight:600, color:T.textSec }}>Add Integration</p>
                <p style={{ fontSize:11, color:T.textMuted }}>Connect Moodle, Outlook, and more</p>
              </div>
              <ChevronRight size={16} color={T.textMuted} style={{ marginLeft:'auto' }} />
            </button>
          </div>

          {/* ── Algorithm Preferences ── */}
          <div style={{ marginBottom:6 }}>
            <SectionHeader label="Algorithm Preferences" sub="Tune how ZenSync builds your plan" />

            <PrefToggle
              icon={<Zap size={18} color={deepFocus ? T.primary : T.textMuted} />}
              iconBg={deepFocus ? T.primarySoft : T.bg}
              label="Deep Focus Mode" sub="Block distractions during study slots"
              value={deepFocus} onChange={setDeepFocus}
            />
            <PrefToggle
              icon={<Coffee size={18} color={frequentBreaks ? T.accent : T.textMuted} />}
              iconBg={frequentBreaks ? T.accentSoft : T.bg}
              label="Require Frequent Breaks" sub="Insert recovery time between blocks"
              value={frequentBreaks} onChange={setFrequentBreaks}
            />
            <PrefToggle
              icon={<Bell size={18} color={smartNotifs ? '#F59E0B' : T.textMuted} />}
              iconBg={smartNotifs ? '#FFFBEB' : T.bg}
              label="Smart Notifications" sub="Nudges before upcoming blocks"
              value={smartNotifs} onChange={setSmartNotifs}
            />
            <PrefToggle
              icon={<CalendarDays size={18} color={weekendShift ? T.primary : T.textMuted} />}
              iconBg={weekendShift ? T.primarySoft : T.bg}
              label="Allow Weekend Catch-up" sub="Move overflow tasks to Sat / Sun"
              value={weekendShift} onChange={setWeekendShift}
            />
            <PrefSlider
              icon={<Clock size={18} color={T.primary} />}
              iconBg={T.primarySoft}
              label="Max Focus Block" sub="Hours before a break is required"
              min={0.5} max={4} step={0.5} value={maxHours} onChange={setMaxHours}
              fmt={v => v === 1 ? '1h' : `${v}h`}
            />
            <div style={{ background:T.accentSoft, borderRadius:14, padding:'12px 14px',
              display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <Sparkles size={16} color={T.accent} />
              <p style={{ fontSize:12, color:'#2D6A4F', lineHeight:1.5 }}>
                Changes take effect on your next plan generation. Tap{' '}
                <strong>Re-optimize</strong> on the Dashboard to apply now.
              </p>
            </div>
          </div>

          {/* ── Account Settings ── */}
          <div style={{ marginBottom:6 }}>
            <SectionHeader label="Account" />
            <SettingsRow icon={<Bell size={16} color="#F59E0B" />} iconBg="#FFFBEB"
              label="Notification Settings" sub="Manage alerts and reminders" />
            <SettingsRow icon={<RefreshCw size={16} color={T.primary} />} iconBg={T.primarySoft}
              label="Sync Frequency" sub="Auto-sync every 15 minutes" badge="15 min" />
            <SettingsRow icon={<Shield size={16} color="#64748B" />} iconBg={T.bg}
              label="Privacy & Data" sub="Export or delete your data" />
            <SettingsRow icon={<Wifi size={16} color={T.accent} />} iconBg={T.accentSoft}
              label="About ZenSync" sub="v1.0.0 MVP — Warsaw 2026" />
            <div style={{ marginTop:4 }}>
              <SettingsRow icon={<LogOut size={16} color="#EF4444" />} iconBg="#FEF2F2"
                label="Sign Out" danger />
            </div>
          </div>

          <div style={{ height:8 }} />
        </div>

        <AppBottomNav />

        {/* ── Integration Connect Flows (slide in from right) ── */}
        {connectTarget && (
          <IntegrationConnectFlow
            key={connectTarget}
            service={connectTarget}
            onBack={() => setConnectTarget(null)}
            onConnected={handleConnected}
          />
        )}
      </div>
    </PhoneFrame>
  );
}
