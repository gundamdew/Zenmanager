import { useState } from 'react';
import {
  Sparkles, RotateCcw, MapPin, ChevronRight,
  Check, GraduationCap, Briefcase, Users,
  Pencil, Heart, Coffee, Zap, Bell, Pen, X, GripVertical,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { AddTaskModal, NewTask, TaskCategory } from './AddTaskModal';
import { AppBottomNav } from './AppBottomNav';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: '#4F63D2',   primarySoft: '#EEF0FD',
  accent: '#7CC8A4',    accentSoft: '#E8F7F0',
  bg: '#F5F4F0',        surface: '#FFFFFF',  surfaceAlt: '#F9F8F6',
  text: '#1A1A2E',      textSec: '#64748B',  textMuted: '#94A3B8',
  border: '#E2E8F0',    borderSoft: '#F1F5F9',
};

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY = {
  exam:     { label:'Exam Prep', bg:'#FFFBEB', border:'#F59E0B', text:'#92400E', chipBg:'#FDE68A', dot:'#F59E0B', icon:<Pencil size={13}/> },
  lecture:  { label:'Lecture',   bg:'#EFF6FF', border:'#3B82F6', text:'#1E40AF', chipBg:'#BFDBFE', dot:'#3B82F6', icon:<GraduationCap size={13}/> },
  work:     { label:'Work',      bg:'#ECFDF5', border:'#10B981', text:'#065F46', chipBg:'#A7F3D0', dot:'#10B981', icon:<Briefcase size={13}/> },
  meeting:  { label:'Meeting',   bg:'#EDE9FE', border:'#7C3AED', text:'#4C1D95', chipBg:'#DDD6FE', dot:'#7C3AED', icon:<Users size={13}/> },
  personal: { label:'Personal',  bg:'#FDF4FF', border:'#A855F7', text:'#6B21A8', chipBg:'#E9D5FF', dot:'#A855F7', icon:<Heart size={13}/> },
  break:    { label:'Break',     bg:'#F8FAFC', border:'#94A3B8', text:'#475569', chipBg:'#E2E8F0', dot:'#94A3B8', icon:<Coffee size={13}/> },
} as const;

// ─── Task Interface ───────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  subtitle?: string;
  startTime: string;
  duration: number;
  category: TaskCategory;
  location?: string;
  isAI: boolean;
  completed: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_TASKS: Task[] = [
  { id:'1',  title:'Morning Mindfulness', subtitle:'Start your day with intention', startTime:'06:30', duration:15,  category:'break',    isAI:true,  completed:true  },
  { id:'2',  title:'Commute to Campus',   subtitle:'Review flashcards on the bus',  startTime:'07:15', duration:40,  category:'personal', isAI:true,  completed:true  },
  { id:'3',  title:'Data Structures',     subtitle:'Ch. 9 — Binary Search Trees',   startTime:'08:00', duration:90,  category:'lecture',  isAI:false, completed:false, location:'Hall B3 · Room 201' },
  { id:'4',  title:'Hydration Break',     subtitle:'Walk & breathe',                startTime:'09:30', duration:15,  category:'break',    isAI:true,  completed:false },
  { id:'5',  title:'Algorithms HW #4',    subtitle:'Graphs — due 11:59 PM',         startTime:'09:45', duration:75,  category:'exam',     isAI:true,  completed:false },
  { id:'6',  title:'Lunch & Rest',        subtitle:'Step away from screens',        startTime:'11:00', duration:55,  category:'break',    isAI:true,  completed:false },
  { id:'7',  title:'Work Shift',          subtitle:'The Daily Grind Café',          startTime:'12:00', duration:240, category:'work',     isAI:false, completed:false, location:'34 Main St.' },
  { id:'8',  title:'Snack Break',         subtitle:'Re-fuel before study block',    startTime:'16:10', duration:15,  category:'break',    isAI:true,  completed:false },
  { id:'9',  title:'Calculus Final Prep', subtitle:'Ch. 6–8 · Integrals & Series',  startTime:'16:25', duration:95,  category:'exam',     isAI:true,  completed:false },
  { id:'10', title:'Wind Down',           subtitle:'Journal · Light stretch',       startTime:'18:00', duration:30,  category:'personal', isAI:true,  completed:false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function fmtDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text:'Good morning',   emoji:'☀️' };
  if (h < 17) return { text:'Good afternoon', emoji:'🌤' };
  if (h < 21) return { text:'Good evening',   emoji:'🌇' };
  return            { text:'Good night',      emoji:'🌙' };
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task, onToggle, onDelete, editMode, isLast,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  editMode: boolean;
  isLast: boolean;
}) {
  const cfg = CATEGORY[task.category];
  const [pressing, setPressing] = useState(false);
  const isCalendarOnly = task.category === 'personal' || task.category === 'break';

  return (
    <div style={{ display:'flex' }}>
      {/* Time column */}
      <div style={{ width:58, display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, paddingTop:18 }}>
        <span style={{ fontSize:11, fontWeight:600, color: task.completed ? T.textMuted : T.textSec, whiteSpace:'nowrap', letterSpacing:'-0.2px' }}>
          {fmtTime(task.startTime).split(' ')[0]}
        </span>
        <span style={{ fontSize:10, color:T.textMuted, marginTop:1 }}>
          {fmtTime(task.startTime).split(' ')[1]}
        </span>
      </div>

      {/* Dot + connector line */}
      <div style={{ width:24, display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, paddingTop:20 }}>
        <div style={{
          width:12, height:12, borderRadius:'50%',
          background: task.completed ? T.border : cfg.dot,
          border: `2px solid ${task.completed ? T.border : cfg.dot}`,
          boxShadow: task.completed ? 'none' : `0 0 0 4px ${cfg.bg}`,
          flexShrink:0, zIndex:1, transition:'all 0.3s ease',
        }} />
        {!isLast && <div style={{ flex:1, width:2, background:T.border, marginTop:4, minHeight:20, borderRadius:1 }} />}
      </div>

      {/* Card body */}
      <div style={{ flex:1, paddingLeft:10, paddingBottom:16 }}>
        <div
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          onMouseLeave={() => setPressing(false)}
          style={{
            background: task.completed ? T.surfaceAlt : cfg.bg,
            borderRadius:18,
            borderLeft: `4px solid ${task.completed ? T.border : cfg.border}`,
            padding:'14px 16px',
            opacity: task.completed ? 0.6 : 1,
            transform: pressing ? 'scale(0.985)' : 'scale(1)',
            transition:'transform 0.15s ease, opacity 0.3s ease',
            boxShadow: task.completed ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
            display:'flex',
            flexDirection:'column',
          }}
        >
          {/* Row 1: badges + action */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{
                display:'flex', alignItems:'center', gap:4,
                background: task.completed ? T.border : cfg.chipBg,
                color: task.completed ? T.textMuted : cfg.text,
                borderRadius:20, padding:'3px 8px 3px 6px', fontSize:11, fontWeight:600,
              }}>
                {cfg.icon} {cfg.label}
              </div>
              {task.isAI && !task.completed && (
                <div style={{ display:'flex', alignItems:'center', gap:3,
                  background:T.primarySoft, color:T.primary,
                  borderRadius:20, padding:'3px 7px', fontSize:10, fontWeight:600 }}>
                  <Sparkles size={10} /> AI
                </div>
              )}
            </div>

            {/* Right action: delete button in edit mode, checkbox for non-calendar tasks otherwise */}
            {editMode ? (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <GripVertical size={14} color={T.textMuted} />
                <button
                  onClick={() => onDelete(task.id)}
                  style={{
                    width:26, height:26, borderRadius:8,
                    border:'none',
                    background:'#FEE2E2',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, transition:'background 0.15s ease',
                  }}
                >
                  <X size={14} color="#EF4444" strokeWidth={2.5} />
                </button>
              </div>
            ) : !isCalendarOnly ? (
              <button
                onClick={() => onToggle(task.id)}
                style={{
                  width:26, height:26, borderRadius:8,
                  border: task.completed ? 'none' : `2px solid ${cfg.border}`,
                  background: task.completed ? cfg.dot : 'transparent',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', flexShrink:0,
                }}
              >
                {task.completed && <Check size={14} color="#fff" strokeWidth={3} />}
              </button>
            ) : null}
          </div>

          {/* Title */}
          <p style={{ fontSize:15, fontWeight:600, color: task.completed ? T.textMuted : T.text,
            letterSpacing:'-0.3px', textDecoration: task.completed ? 'line-through' : 'none',
            marginBottom: task.subtitle ? 3 : 0, lineHeight:1.3 }}>
            {task.title}
          </p>

          {/* Subtitle */}
          {task.subtitle && (
            <p style={{ fontSize:12, color: task.completed ? T.textMuted : T.textSec, lineHeight:1.4, marginBottom:6 }}>
              {task.subtitle}
            </p>
          )}

          {/* Meta */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
            <span style={{ fontSize:11, color:T.textMuted, fontWeight:500 }}>
              ⏱ {fmtDuration(task.duration)}
            </span>
            {task.location && (
              <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:T.textMuted, fontWeight:500 }}>
                <MapPin size={11} />{task.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sync Score Card ──────────────────────────────────────────────────────────
function SyncScoreCard({ tasks }: { tasks:Task[] }) {
  const total = tasks.length;
  const done  = tasks.filter(t => t.completed).length;
  const pct   = Math.round((done / total) * 100);
  const heavy = tasks.filter(t => !t.completed && (t.category === 'exam' || t.category === 'work')).length;
  const level = heavy >= 3 ? 'High' : heavy >= 1 ? 'Balanced' : 'Light';
  const col   = heavy >= 3 ? '#F59E0B' : heavy >= 1 ? T.primary : T.accent;
  const bg    = heavy >= 3 ? '#FFFBEB' : heavy >= 1 ? T.primarySoft : T.accentSoft;

  return (
    <div style={{ margin:'0 20px 20px', background:T.surface, borderRadius:22,
      padding:'18px 20px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <p style={{ fontSize:12, fontWeight:600, color:T.textMuted,
            textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>
            Today's Progress
          </p>
          <p style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:'-0.5px' }}>
            {done}<span style={{ fontSize:14, color:T.textMuted, fontWeight:500 }}>/{total} tasks</span>
          </p>
        </div>
        <div style={{ background:bg, borderRadius:14, padding:'8px 14px', textAlign:'center' }}>
          <p style={{ fontSize:10, fontWeight:600, color:col,
            textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Load</p>
          <p style={{ fontSize:15, fontWeight:700, color:col }}>{level}</p>
        </div>
      </div>
      <div style={{ height:8, background:T.borderSoft, borderRadius:9999, overflow:'hidden', marginBottom:8 }}>
        <div style={{
          height:'100%', width:`${pct}%`,
          background:`linear-gradient(90deg, ${T.primary}, ${T.accent})`,
          borderRadius:9999, transition:'width 0.6s cubic-bezier(0.34,1,0.64,1)',
        }} />
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, color:T.textMuted }}>{pct}% complete</span>
        <div style={{ display:'flex', alignItems:'center', gap:4,
          background:T.primarySoft, borderRadius:20, padding:'4px 10px' }}>
          <Sparkles size={11} color={T.primary} />
          <span style={{ fontSize:11, fontWeight:600, color:T.primary }}>Plan AI-Optimized</span>
        </div>
      </div>
    </div>
  );
}

// ─── Regen FAB ────────────────────────────────────────────────────────────────
function RegenFAB({ onRegen, regenerating }: { onRegen:()=>void; regenerating:boolean }) {
  return (
    <button
      onClick={onRegen}
      disabled={regenerating}
      style={{
        position:'absolute', bottom:108, right:20,
        height:48, borderRadius:24,
        background: regenerating ? T.border : T.text,
        color:'#fff', border:'none',
        cursor: regenerating ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', gap:8, padding:'0 18px',
        boxShadow:'0 8px 24px rgba(26,26,46,0.3)',
        fontSize:13, fontWeight:600, transition:'all 0.2s ease', zIndex:30,
      }}
    >
      <RotateCcw size={15} style={{ animation: regenerating ? 'spin 0.8s linear infinite' : 'none' }} />
      {regenerating ? 'Optimizing…' : 'Re-optimize'}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </button>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function DashboardScreen() {
  const [tasks,        setTasks]       = useState<Task[]>(INITIAL_TASKS);
  const [modalOpen,    setModalOpen]   = useState(false);
  const [regenerating, setRegenerate]  = useState(false);
  const [toast,        setToast]       = useState<string | null>(null);
  const [editMode,     setEditMode]    = useState(false);

  const greeting = getGreeting();
  const dateStr  = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed:!t.completed } : t));

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Block removed from your plan');
  };

  const handleAddTask = (nt: NewTask) => {
    const task: Task = {
      id: `c_${Date.now()}`, title:nt.title, startTime:nt.startTime,
      duration:nt.duration, category:nt.category,
      location:nt.location, subtitle:nt.notes || undefined,
      isAI:false, completed:false,
    };
    setTasks(prev => [...prev, task].sort((a,b) => a.startTime.localeCompare(b.startTime)));
    showToast('Task added to your plan ✓');
  };

  const handleRegen = () => {
    setRegenerate(true);
    setTimeout(() => {
      setTasks(prev => {
        const inc  = prev.filter(t => !t.completed && t.isAI);
        const rest = prev.filter(t =>  t.completed || !t.isAI);
        return [...rest, ...inc.sort(() => Math.random() - 0.5)]
          .sort((a,b) => a.startTime.localeCompare(b.startTime));
      });
      setRegenerate(false);
      showToast('Plan re-optimized for your load ✨');
    }, 1600);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <PhoneFrame>
      <div style={{ flex:1, display:'flex', flexDirection:'column',
        overflow:'hidden', position:'relative', background:T.bg }}>

        {/* ── Scrollable content ── */}
        <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }} className="zs-scroll">

          {/* Header */}
          <div style={{ padding:'8px 22px 20px',
            background:`linear-gradient(168deg, ${T.primarySoft} 0%, ${T.bg} 70%)` }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:4 }}>
              <div>
                <p style={{ fontSize:13, color:T.textMuted, fontWeight:500, marginBottom:2, letterSpacing:'0.01em' }}>
                  {dateStr}
                </p>
                <h1 style={{ fontSize:24, fontWeight:700, color:T.text, letterSpacing:'-0.6px', lineHeight:1.2 }}>
                  {greeting.text}, Alex {greeting.emoji}
                </h1>
              </div>
              <button style={{
                width:40, height:40, borderRadius:13,
                background:T.surface, border:`1.5px solid ${T.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', position:'relative', flexShrink:0, marginTop:2,
              }}>
                <Bell size={18} color={T.textSec} />
                <div style={{
                  position:'absolute', top:8, right:9,
                  width:7, height:7, borderRadius:'50%',
                  background:'#F59E0B', border:`2px solid ${T.surface}`,
                }} />
              </button>
            </div>

            {/* Tip strip */}
            <div style={{
              marginTop:12, background:T.surface, borderRadius:14, padding:'10px 14px',
              display:'flex', alignItems:'center', gap:10,
              boxShadow:'0 2px 10px rgba(0,0,0,0.04)',
            }}>
              <Zap size={16} color={T.accent} />
              <p style={{ fontSize:13, color:T.textSec, flex:1 }}>
                Your focus window starts at <strong style={{ color:T.text }}>9:45 AM</strong> — protect it.
              </p>
              <ChevronRight size={14} color={T.textMuted} />
            </div>
          </div>

          {/* Sync Score */}
          <SyncScoreCard tasks={tasks} />

          {/* Timeline header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 22px', marginBottom:16 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:T.text, letterSpacing:'-0.3px' }}>
              Today's Schedule
            </h2>

            {/* Edit toggle button */}
            <button
              onClick={() => setEditMode(e => !e)}
              style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'6px 14px', borderRadius:20,
                background: editMode ? T.primary : T.surface,
                border: `1.5px solid ${editMode ? T.primary : T.border}`,
                color: editMode ? '#fff' : T.textSec,
                cursor:'pointer', fontSize:12, fontWeight:600,
                transition:'all 0.2s ease', outline:'none',
                boxShadow: editMode ? '0 2px 8px rgba(79,99,210,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <Pen size={12} color={editMode ? '#fff' : T.textSec} />
              {editMode ? 'Done' : 'Edit'}
            </button>
          </div>

          {/* Edit mode banner */}
          {editMode && (
            <div style={{
              margin:'0 20px 12px',
              background:'#FEF3C7', border:'1px solid #F59E0B',
              borderRadius:12, padding:'9px 14px',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <GripVertical size={13} color="#92400E" />
              <p style={{ fontSize:12, color:'#92400E', fontWeight:500 }}>
                Drag to reorder · Tap <X size={11} style={{ display:'inline', verticalAlign:'middle' }} color="#EF4444" /> to remove a block
              </p>
            </div>
          )}

          {/* Timeline */}
          <div style={{ padding:'0 14px 0 12px' }}>
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                editMode={editMode}
                isLast={i === tasks.length - 1}
              />
            ))}
          </div>
          <div style={{ height:80 }} />
        </div>

        {/* Regen FAB */}
        <RegenFAB onRegen={handleRegen} regenerating={regenerating} />

        {/* Shared bottom nav */}
        <AppBottomNav onAdd={() => setModalOpen(true)} />

        {/* Add Task Modal */}
        {modalOpen && (
          <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddTask} />
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position:'absolute', top:64, left:'50%',
            transform:'translateX(-50%)',
            background:T.text, color:'#fff', borderRadius:20,
            padding:'10px 18px', fontSize:13, fontWeight:500,
            whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,0.25)',
            zIndex:100, animation:'fadeSlideIn 0.25s ease',
          }}>
            {toast}
          </div>
        )}
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity:0; transform:translateX(-50%) translateY(-8px); }
            to   { opacity:1; transform:translateX(-50%) translateY(0); }
          }
        `}</style>
      </div>
    </PhoneFrame>
  );
}
