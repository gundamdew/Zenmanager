/**
 * StatsScreen — cognitive-load analytics & burnout monitoring.
 * Includes:
 *  - Key metric chips (total hrs, work%, break score)
 *  - Weekly Load Balance BarChart (Recharts)
 *  - Burnout Risk Gauge (Recharts PieChart semicircle)
 *  - Actionable insight cards
 */
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
  PieChart, Pie,
} from 'recharts';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  Clock, Zap, Coffee, ChevronLeft, ChevronRight,
  BookOpen, Briefcase, CheckCircle2,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { AppBottomNav } from './AppBottomNav';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: '#4F63D2', primarySoft: '#EEF0FD',
  accent: '#7CC8A4',  accentSoft: '#E8F7F0',
  bg: '#F5F4F0',      surface: '#FFFFFF', surfaceAlt: '#F9F8F6',
  text: '#1A1A2E',    textSec: '#64748B', textMuted: '#94A3B8',
  border: '#E2E8F0',  borderSoft: '#F1F5F9',
};
const CHART_COLORS = {
  study:  '#4F63D2',
  work:   '#10B981',
  breaks: '#94A3B8',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day:'Mon', study:3.5, work:6.5, breaks:0.5 },
  { day:'Tue', study:3.0, work:0,   breaks:1.0 },
  { day:'Wed', study:2.5, work:4.0, breaks:0.5 },
  { day:'Thu', study:3.0, work:4.0, breaks:1.0 },
  { day:'Fri', study:2.0, work:4.0, breaks:0.5 },
  { day:'Sat', study:4.0, work:0,   breaks:1.0 },
  { day:'Sun', study:0,   work:0,   breaks:2.0 },
];

const PREV_WEEKLY_DATA = [
  { day:'Mon', study:4.0, work:4.0, breaks:1.0 },
  { day:'Tue', study:3.5, work:0,   breaks:1.5 },
  { day:'Wed', study:3.0, work:4.0, breaks:1.0 },
  { day:'Thu', study:2.5, work:4.0, breaks:0.5 },
  { day:'Fri', study:3.5, work:4.0, breaks:1.0 },
  { day:'Sat', study:3.0, work:0,   breaks:1.5 },
  { day:'Sun', study:1.0, work:0,   breaks:2.0 },
];

const WEEK_LABELS = [
  'Apr 27 – May 3',
  'Apr 20 – Apr 26',
];

// ─── Computed stats ───────────────────────────────────────────────────────────
function computeStats(data: typeof WEEKLY_DATA) {
  const totalStudy  = data.reduce((s, d) => s + d.study,  0);
  const totalWork   = data.reduce((s, d) => s + d.work,   0);
  const totalBreaks = data.reduce((s, d) => s + d.breaks, 0);
  const totalHeavy  = totalStudy + totalWork;
  const burnout     = Math.min(100, Math.round((totalHeavy / 50) * 100));
  return { totalStudy, totalWork, totalBreaks, totalHeavy, burnout };
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border:`1px solid ${T.border}`,
      borderRadius:12, padding:'10px 14px',
      boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
    }}>
      <p style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:p.fill }} />
          <span style={{ fontSize:11, color:T.textSec, textTransform:'capitalize' }}>{p.dataKey}:</span>
          <span style={{ fontSize:11, fontWeight:600, color:T.text }}>{p.value}h</span>
        </div>
      ))}
    </div>
  );
}

// ─── Burnout gauge (semi-circle PieChart) ─────────────────────────────────────
function BurnoutGauge({ score }: { score: number }) {
  const level = score < 40 ? 'Low' : score < 65 ? 'Moderate' : score < 80 ? 'Elevated' : 'High';
  const color = score < 40 ? T.accent : score < 65 ? T.primary : score < 80 ? '#F97316' : '#EF4444';
  const softBg = score < 40 ? T.accentSoft : score < 65 ? T.primarySoft : score < 80 ? '#FFF7ED' : '#FEF2F2';

  const gaugeData = [
    { value: score,       name: 'risk'  },
    { value: 100 - score, name: 'empty' },
  ];

  return (
    <div style={{
      background: T.surface, borderRadius:22,
      padding:'18px 20px 12px',
      boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
      marginBottom:16,
    }}>
      {/* Title */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <p style={{ fontSize:14, fontWeight:700, color:T.text, letterSpacing:'-0.3px' }}>
          Burnout Risk Score
        </p>
        <div style={{
          background: softBg, color: color,
          borderRadius:20, padding:'4px 12px',
          fontSize:11, fontWeight:700,
        }}>
          {level}
        </div>
      </div>
      <p style={{ fontSize:12, color:T.textSec, marginBottom:8 }}>
        Based on your hours logged this week
      </p>

      {/* Semicircle gauge */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
        <PieChart width={220} height={120}>
          {/* Track */}
          <Pie
            data={[{ value: 100 }]}
            cx="50%" cy="100%"
            startAngle={180} endAngle={0}
            innerRadius={58} outerRadius={78}
            dataKey="value" strokeWidth={0}
          >
            <Cell key="track-bg" fill={T.borderSoft} />
          </Pie>
          {/* Score arc */}
          <Pie
            data={gaugeData}
            cx="50%" cy="100%"
            startAngle={180} endAngle={0}
            innerRadius={58} outerRadius={78}
            dataKey="value" strokeWidth={0}
            cornerRadius={6}
          >
            <Cell key="arc-risk"  fill={color} />
            <Cell key="arc-empty" fill="transparent" />
          </Pie>
        </PieChart>

        {/* Score label (centred over gauge) */}
        <div style={{
          position:'absolute', bottom:4,
          display:'flex', flexDirection:'column', alignItems:'center',
        }}>
          <p style={{ fontSize:28, fontWeight:800, color, letterSpacing:'-1px', lineHeight:1 }}>
            {score}
          </p>
          <p style={{ fontSize:10, color:T.textMuted, fontWeight:500 }}>out of 100</p>
        </div>
      </div>

      {/* Scale labels */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'0 20px', marginTop:4 }}>
        <span style={{ fontSize:10, color:T.accent, fontWeight:600 }}>Low</span>
        <span style={{ fontSize:10, color:T.primary, fontWeight:600 }}>Moderate</span>
        <span style={{ fontSize:10, color:'#EF4444', fontWeight:600 }}>High</span>
      </div>

      {/* CTA */}
      {score >= 65 && (
        <div style={{
          marginTop:12, background: softBg,
          borderRadius:12, padding:'10px 14px',
          display:'flex', alignItems:'flex-start', gap:8,
        }}>
          <AlertTriangle size={14} color={color} style={{ marginTop:1, flexShrink:0 }} />
          <p style={{ fontSize:12, color, lineHeight:1.5 }}>
            {score >= 80
              ? 'Critical load. Consider dropping a work shift or deferring a non-urgent assignment.'
              : 'You\'ve worked 18.5h + studied 18h this week. Consider taking Sunday completely off.'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Insight card ───────────────────���─────────────────────────────────────────
interface InsightProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
  accentBg: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}
function InsightCard({ icon, title, body, accent, accentBg, trend, trendLabel }: InsightProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor = trend === 'up' ? '#EF4444' : trend === 'down' ? T.accent : T.textMuted;

  return (
    <div style={{
      background: T.surface, borderRadius:18,
      padding:'14px 16px', marginBottom:10,
      boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
      display:'flex', alignItems:'flex-start', gap:12,
    }}>
      <div style={{
        width:38, height:38, borderRadius:12,
        background: accentBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0,
      }}>
        {icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
          <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{title}</p>
          {TrendIcon && trendLabel && (
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <TrendIcon size={12} color={trendColor} />
              <span style={{ fontSize:10, fontWeight:600, color:trendColor }}>{trendLabel}</span>
            </div>
          )}
        </div>
        <p style={{ fontSize:12, color:T.textSec, lineHeight:1.55 }}>{body}</p>
      </div>
    </div>
  );
}

// ─── Metric chip ──────────────────────────────────────────────────────────────
function MetricChip({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div style={{
      flex:1, background: T.surface, borderRadius:16,
      padding:'12px 10px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
    }}>
      <div style={{
        width:34, height:34, borderRadius:11,
        background: bg, display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {icon}
      </div>
      <p style={{ fontSize:16, fontWeight:800, color, letterSpacing:'-0.5px' }}>{value}</p>
      <p style={{ fontSize:10, color:T.textMuted, textAlign:'center', fontWeight:500 }}>{label}</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function StatsScreen() {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, 1 = last week
  const data = weekOffset === 0 ? WEEKLY_DATA : PREV_WEEKLY_DATA;
  const stats = computeStats(data);

  return (
    <PhoneFrame>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:T.bg }}>

        {/* ── Sticky Header ── */}
        <div style={{
          padding:'10px 20px 12px',
          background: T.surface,
          borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:'-0.4px' }}>
              Analytics
            </h2>
            <p style={{ fontSize:11, color:T.textMuted }}>Your cognitive load overview</p>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            background: T.primarySoft, borderRadius:20, padding:'5px 10px',
          }}>
            <Sparkles size={12} color={T.primary} />
            <span style={{ fontSize:11, fontWeight:600, color:T.primary }}>AI Insights</span>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 8px' }} className="zs-scroll">

          {/* ── Metric chips ── */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <MetricChip
              icon={<BookOpen size={16} color={T.primary} />}
              label="Study hrs"
              value={`${stats.totalStudy}h`}
              color={T.primary}
              bg={T.primarySoft}
            />
            <MetricChip
              icon={<Briefcase size={16} color="#10B981" />}
              label="Work hrs"
              value={`${stats.totalWork}h`}
              color="#065F46"
              bg="#ECFDF5"
            />
            <MetricChip
              icon={<Coffee size={16} color="#94A3B8" />}
              label="Break hrs"
              value={`${stats.totalBreaks}h`}
              color="#475569"
              bg="#F8FAFC"
            />
          </div>

          {/* ── Weekly Load Balance Chart ── */}
          <div style={{
            background: T.surface, borderRadius:22,
            padding:'16px 12px 10px',
            boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
            marginBottom:16,
          }}>
            {/* Chart header + week navigator */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              paddingLeft:8, paddingRight:4, marginBottom:12 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:T.text, letterSpacing:'-0.3px' }}>
                  Weekly Load Balance
                </p>
                <p style={{ fontSize:11, color:T.textMuted }}>{WEEK_LABELS[weekOffset]}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <button
                  onClick={() => setWeekOffset(Math.min(1, weekOffset + 1))}
                  disabled={weekOffset >= 1}
                  style={{ width:28, height:28, borderRadius:9, border:`1.5px solid ${T.border}`,
                    background: T.bg, cursor: weekOffset >= 1 ? 'not-allowed' : 'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    opacity: weekOffset >= 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={14} color={T.textSec} />
                </button>
                <button
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset <= 0}
                  style={{ width:28, height:28, borderRadius:9, border:`1.5px solid ${T.border}`,
                    background: T.bg, cursor: weekOffset <= 0 ? 'not-allowed' : 'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    opacity: weekOffset <= 0 ? 0.4 : 1 }}
                >
                  <ChevronRight size={14} color={T.textSec} />
                </button>
              </div>
            </div>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} barSize={8} barGap={2}
                margin={{ top:4, right:4, left:-24, bottom:0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={T.borderSoft}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize:10, fill:T.textMuted, fontFamily:'DM Sans, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize:9, fill:T.textMuted, fontFamily:'DM Sans, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}h`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(79,99,210,0.04)' }} />
                <Bar dataKey="study"  fill={CHART_COLORS.study}  radius={[4,4,0,0]} />
                <Bar dataKey="work"   fill={CHART_COLORS.work}   radius={[4,4,0,0]} />
                <Bar dataKey="breaks" fill={CHART_COLORS.breaks} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:6 }}>
              {Object.entries(CHART_COLORS).map(([key, col]) => (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:col }} />
                  <span style={{ fontSize:10, color:T.textSec, textTransform:'capitalize' }}>{key}</span>
                </div>
              ))}
            </div>

            {/* Weekly total strip */}
            <div style={{
              marginTop:12, background:T.bg, borderRadius:12, padding:'10px 14px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Clock size={13} color={T.textMuted} />
                <span style={{ fontSize:12, color:T.textSec }}>
                  Total this week
                </span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:T.text }}>
                {(stats.totalStudy + stats.totalWork + stats.totalBreaks).toFixed(1)}h logged
              </span>
            </div>
          </div>

          {/* ── Burnout Risk Gauge ── */}
          <BurnoutGauge score={stats.burnout} />

          {/* ── Insights ── */}
          <div style={{ marginBottom:4 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.text, letterSpacing:'-0.2px',
              marginBottom:10, paddingLeft:2 }}>
              AI Insights
            </p>

            <InsightCard
              icon={<Briefcase size={17} color="#10B981" />}
              title="Work hours approaching limit"
              body={`You've logged ${stats.totalWork}h of work this week. The recommended maximum for full-time students is 20h. You're ${(stats.totalWork / 20 * 100).toFixed(0)}% of the way there.`}
              accent="#10B981"
              accentBg="#ECFDF5"
              trend={stats.totalWork > 16 ? 'up' : 'neutral'}
              trendLabel={stats.totalWork > 16 ? `${(stats.totalWork - 16).toFixed(1)}h over` : 'On track'}
            />

            <InsightCard
              icon={<Coffee size={17} color="#94A3B8" />}
              title="Break compliance is low"
              body={`Only ${stats.totalBreaks}h of breaks recorded this week. Aim for at least 1h per active day. Studies show breaks improve recall by up to 20%.`}
              accent="#64748B"
              accentBg="#F8FAFC"
              trend="down"
              trendLabel="-2.5h vs ideal"
            />

            <InsightCard
              icon={<Zap size={17} color={T.accent} />}
              title="Best focus window"
              body="Based on your schedule, 09:45–11:00 AM on Tuesday and Thursday remain conflict-free. ZenSync has blocked these as deep focus slots."
              accent={T.accent}
              accentBg={T.accentSoft}
            />

            <InsightCard
              icon={<CheckCircle2 size={17} color={T.primary} />}
              title="Weekend recommendation"
              body={`You have ${stats.totalStudy < 20 ? 'room to' : 'already scheduled'} study on Saturday. Consider keeping Sunday screen-free to lower your burnout score below 65.`}
              accent={T.primary}
              accentBg={T.primarySoft}
            />
          </div>

          {/* Bottom padding */}
          <div style={{ height:8 }} />
        </div>

        <AppBottomNav />
      </div>
    </PhoneFrame>
  );
}