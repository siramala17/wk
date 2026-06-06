import React from 'react'
import { Link } from 'react-router-dom'
import { Moon, Smartphone, Brain, Dumbbell, Droplets, Scale, Zap, ChevronRight } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { getHealthLevel } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const STAT_CONFIG = [
  { key: 'sleep',    icon: Moon,       label: 'นอนหลับ',    unit: 'ชม.',           max: 9,  color: '#3b82f6', bg: '#eff6ff', getVal: a => a.sleepHours },
  { key: 'screen',   icon: Smartphone, label: 'หน้าจอ',     unit: 'ชม.',           max: 12, color: '#8b5cf6', bg: '#f5f3ff', getVal: a => a.screenHours },
  { key: 'stress',   icon: Brain,      label: 'ความเครียด', unit: '/10',            max: 10, color: '#f59e0b', bg: '#fffbeb', getVal: a => a.stressLevel },
  { key: 'exercise', icon: Dumbbell,   label: 'ออกกำลัง',  unit: 'วัน/สปด.',       max: 7,  color: '#10b981', bg: '#ecfdf5', getVal: a => a.exerciseDays },
  { key: 'water',    icon: Droplets,   label: 'ดื่มน้ำ',    unit: 'แก้ว',           max: 8,  color: '#06b6d4', bg: '#ecfeff', getVal: a => a.waterGlasses },
]

function StatCard({ icon: Icon, label, value, unit, max, color, bg }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm flex-shrink-0 w-[130px]"
      style={{ border: `1.5px solid ${color}25` }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-[11px] font-bold" style={{ color }}>{value} {unit}</span>
      </div>
      <p className="text-[11px] text-slate-500 mb-1.5 font-medium">{label}</p>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

const QUICK = [
  { to: '/assessment',      emoji: '📋', label: 'ประเมิน\nสุขภาพ',  from: '#2563eb', to2: '#1d4ed8' },
  { to: '/bmi',             emoji: '⚖️', label: 'คำนวณ\nBMI',      from: '#f59e0b', to2: '#d97706' },
  { to: '/nubcal',          emoji: '🔥', label: 'บันทึก\nแคลอรี่',  from: '#f97316', to2: '#ea580c' },
  { to: '/analytics',       emoji: '📊', label: 'กราฟ\nสุขภาพ',    from: '#06b6d4', to2: '#0284c7' },
  { to: '/recommendations', emoji: '🤖', label: 'แนะนำ\nAI',       from: '#10b981', to2: '#059669' },
  { to: '/knowledge',       emoji: '📚', label: 'ใบ\nความรู้',     from: '#3b82f6', to2: '#2563eb' },
]

const TIPS = [
  'ดื่มน้ำอุ่นหลังตื่นนอนช่วยกระตุ้นระบบเผาผลาญและเตรียมร่างกายให้พร้อมสำหรับวัน',
  'นอนหลับให้ครบ 8 ชั่วโมง ช่วยให้ความจำดีขึ้นและลดความเครียดได้จริง',
  'ออกกำลังกาย 30 นาทีต่อวัน ช่วยเพิ่ม endorphin ทำให้อารมณ์ดีขึ้น',
  'กินผักผลไม้หลากสีสัน = ได้สารอาหารครบถ้วนทุกประเภท',
]
const todayTip = TIPS[new Date().getDay() % TIPS.length]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-blue-100 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="font-bold text-blue-600">{payload[0].value} คะแนน</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { latestAssessment, history, bmiData, user } = useHealth()
  const score = latestAssessment?.overallScore ?? (history.length ? history[history.length - 1].score : null)
  const level = getHealthLevel(score)
  const hasData = score !== null

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4 animate-fade-in">

      {/* ── Hero ── */}
      <div className="relative rounded-3xl p-5 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1d4ed8 100%)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
        }}>

        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="absolute -bottom-8 -left-6 w-36 h-36 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />
        {/* Gold shimmer top-right */}
        <div className="absolute top-3 right-3 w-24 h-24 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent)' }} />

        {hasData ? (
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-blue-200 text-sm mb-0.5">สวัสดี, {user.firstName || user.name} 👋</p>
              <h1 className="text-2xl font-black mb-2 leading-tight">คะแนน<br/>สุขภาพวันนี้</h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold mb-2"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <span>{level.emoji}</span>
                <span>{level.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold text-blue-200">🔥 Streak {user.streak} วัน</span>
                <span className="text-xs font-bold text-yellow-300">⭐ {user.points} แต้ม</span>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <ScoreRing score={score} size={110} strokeWidth={9} color="#fbbf24" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{score}</span>
                <p className="text-[10px] text-blue-200 font-semibold">/ 100</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative text-center py-2">
            <p className="text-blue-200 text-sm mb-1">สวัสดี, {user.firstName || user.name} 👋</p>
            <h1 className="text-2xl font-black mb-1">ยังไม่มีข้อมูล</h1>
            <p className="text-blue-200 text-sm mb-4">เริ่มประเมินสุขภาพเพื่อดูคะแนนของคุณ</p>
          </div>
        )}

        <Link to="/assessment"
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#78350f',
            boxShadow: '0 4px 16px rgba(251,191,36,0.45)',
          }}>
          <Zap size={16} />
          {hasData ? 'ประเมินสุขภาพอีกครั้ง' : 'เริ่มประเมินเดี๋ยวนี้!'}
        </Link>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-0.5">เมนูด่วน</p>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK.map(({ to, emoji, label, from, to2 }) => (
            <Link key={to} to={to}
              className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2 shadow-sm transition-all active:scale-95 hover:shadow-md"
              style={{ border: '1.5px solid rgba(37,99,235,0.08)' }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: `linear-gradient(135deg, ${from}20, ${to2}20)` }}>
                {emoji}
              </div>
              <p className="text-[11px] font-bold text-slate-700 text-center leading-tight whitespace-pre-line">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stats Horizontal Scroll ── */}
      {latestAssessment && (
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ข้อมูลล่าสุด</p>
            {bmiData && (
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                BMI {bmiData.bmi} · {bmiData.category}
              </span>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {STAT_CONFIG.map(cfg => (
              <StatCard key={cfg.key}
                icon={cfg.icon} label={cfg.label}
                value={cfg.getVal(latestAssessment)}
                unit={cfg.unit} max={cfg.max}
                color={cfg.color} bg={cfg.bg} />
            ))}
          </div>
        </div>
      )}

      {/* ── Weekly Chart ── */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm"
          style={{ border: '1.5px solid rgba(37,99,235,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-slate-800 text-sm">แนวโน้มสุขภาพ 7 วัน</p>
              <p className="text-xs text-slate-400 mt-0.5">ติดตามความก้าวหน้าของคุณ</p>
            </div>
            <Link to="/analytics"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
              ดูเพิ่ม <ChevronRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5}
                fill="url(#scoreGrad)"
                dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#1d4ed8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Tip Banner ── */}
      <div className="rounded-2xl p-4 flex gap-3 items-start"
        style={{ background: 'linear-gradient(135deg, #fef9c3, #fef3c7)', border: '1.5px solid #fde68a' }}>
        <span className="text-2xl flex-shrink-0">💡</span>
        <div>
          <p className="text-sm font-bold text-amber-800">เคล็ดลับสุขภาพวันนี้</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{todayTip}</p>
        </div>
      </div>

    </div>
  )
}
