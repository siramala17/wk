import React from 'react'
import { Link } from 'react-router-dom'
import { Moon, Smartphone, Brain, Dumbbell, Droplets, ChevronRight, Scale, Zap, TrendingUp } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { getHealthLevel } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

function StatCard({ icon: Icon, label, value, unit, color, bgColor, max, current }) {
  const pct = Math.min(100, (current / max) * 100)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        <span className={`text-xs font-semibold ${color} bg-opacity-10 px-2 py-0.5 rounded-full ${bgColor}`}>
          {value} {unit}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, background: color.includes('blue') ? '#2563EB' : color.includes('yellow') ? '#F59E0B' : color.includes('emerald') ? '#10B981' : color.includes('purple') ? '#7C3AED' : '#06B6D4' }}
        />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-blue-100 rounded-xl px-3 py-2 shadow text-xs">
        <p className="text-slate-500">{label}</p>
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

  const stats = latestAssessment ? [
    { icon: Moon, label: 'การนอนหลับ', value: latestAssessment.sleepHours, unit: 'ชม.', color: 'text-blue-600', bgColor: 'bg-blue-100', max: 9, current: latestAssessment.sleepHours },
    { icon: Smartphone, label: 'เวลาหน้าจอ', value: latestAssessment.screenHours, unit: 'ชม.', color: 'text-purple-600', bgColor: 'bg-purple-100', max: 12, current: 12 - latestAssessment.screenHours },
    { icon: Brain, label: 'ความเครียด', value: latestAssessment.stressLevel, unit: '/10', color: 'text-yellow-600', bgColor: 'bg-yellow-100', max: 10, current: 10 - latestAssessment.stressLevel },
    { icon: Dumbbell, label: 'ออกกำลังกาย', value: latestAssessment.exerciseDays, unit: 'วัน/สัปดาห์', color: 'text-emerald-600', bgColor: 'bg-emerald-100', max: 7, current: latestAssessment.exerciseDays },
    { icon: Droplets, label: 'ดื่มน้ำ', value: latestAssessment.waterGlasses, unit: 'แก้ว', color: 'text-cyan-600', bgColor: 'bg-cyan-100', max: 8, current: latestAssessment.waterGlasses },
  ] : []

  const hasAnyData = score !== null

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-12 -translate-x-8" />

        {hasAnyData ? (
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">สวัสดี, {user.name} 👋</p>
              <h1 className="text-2xl font-bold mb-1">คะแนนสุขภาพ</h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                <span>{level.emoji}</span>
                <span>{level.label}</span>
              </div>
              <p className="text-blue-200 text-xs mt-3">🔥 Streak {user.streak} วัน</p>
            </div>
            <div className="relative flex items-center justify-center">
              <ScoreRing score={score} size={120} strokeWidth={10} color="#FBBF24" />
              <div className="absolute text-center">
                <span className="text-3xl font-black">{score}</span>
                <p className="text-xs text-blue-200">/ 100</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative text-center py-2">
            <p className="text-blue-200 text-sm mb-2">สวัสดี, {user.name} 👋</p>
            <h1 className="text-2xl font-bold mb-1">ยังไม่มีข้อมูลสุขภาพ</h1>
            <p className="text-blue-200 text-sm mb-4">กดปุ่มด้านล่างเพื่อเริ่มประเมินสุขภาพของคุณ</p>
          </div>
        )}

        <Link to="/assessment" className="mt-4 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold rounded-xl px-4 py-3 transition-colors">
          <Zap size={16} />
          {hasAnyData ? 'ประเมินสุขภาพอีกครั้ง' : 'เริ่มประเมินสุขภาพเดี๋ยวนี้!'}
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/assessment" className="bg-white rounded-2xl p-4 text-center shadow-sm border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-600 transition-colors">
            <span className="text-lg group-hover:hidden">📋</span>
            <ChevronRight size={18} className="text-white hidden group-hover:block" />
          </div>
          <p className="text-xs font-semibold text-slate-700">ประเมิน<br/>สุขภาพ</p>
        </Link>
        <Link to="/bmi" className="bg-white rounded-2xl p-4 text-center shadow-sm border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-400 transition-colors">
            <Scale size={18} className="text-yellow-600 group-hover:text-white" />
          </div>
          <p className="text-xs font-semibold text-slate-700">คำนวณ<br/>BMI</p>
        </Link>
        <Link to="/analytics" className="bg-white rounded-2xl p-4 text-center shadow-sm border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-emerald-500 transition-colors">
            <TrendingUp size={18} className="text-emerald-600 group-hover:text-white" />
          </div>
          <p className="text-xs font-semibold text-slate-700">ดูกราฟ<br/>สุขภาพ</p>
        </Link>
      </div>

      {/* Stats Grid */}
      {latestAssessment && (
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">ข้อมูลสุขภาพล่าสุด</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
            {bmiData && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Scale size={18} className="text-pink-600" />
                  </div>
                  <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                    BMI {bmiData.bmi}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">ดัชนีมวลกาย</p>
                <p className="text-xs font-semibold text-pink-600">{bmiData.category}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">แนวโน้มสุขภาพ 7 วัน</h2>
            <Link to="/analytics" className="text-xs text-blue-600 font-medium hover:underline">ดูเพิ่มเติม</Link>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#1D4ED8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tip Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-yellow-800">เคล็ดลับสุขภาพประจำวัน</p>
          <p className="text-xs text-yellow-700 mt-0.5">การดื่มน้ำอุ่นหลังตื่นนอนช่วยกระตุ้นระบบเผาผลาญ และเตรียมร่างกายให้พร้อมสำหรับวัน</p>
        </div>
      </div>
    </div>
  )
}
