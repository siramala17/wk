import React, { useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Moon, Droplets, Brain, Smartphone, Activity } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const tooltipStyle = {
  contentStyle: { borderRadius: '12px', border: '1px solid #DBEAFE', fontSize: '12px', fontFamily: 'Sarabun' },
  labelStyle: { fontWeight: '700', color: '#1E40AF' },
}

function ChartCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function StatSummary({ history }) {
  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0
  const avgSleep = history.length ? +(history.reduce((s, h) => s + h.sleep, 0) / history.length).toFixed(1) : 0
  const avgWater = history.length ? Math.round(history.reduce((s, h) => s + h.water, 0) / history.length) : 0
  const exerciseDays = history.filter(h => h.exercise).length

  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'คะแนนเฉลี่ย', value: avgScore, unit: 'คะแนน', emoji: '⭐', bg: 'bg-blue-50', text: 'text-blue-700' },
        { label: 'นอนหลับเฉลี่ย', value: avgSleep, unit: 'ชม./วัน', emoji: '🌙', bg: 'bg-indigo-50', text: 'text-indigo-700' },
        { label: 'ดื่มน้ำเฉลี่ย', value: avgWater, unit: 'แก้ว/วัน', emoji: '💧', bg: 'bg-cyan-50', text: 'text-cyan-700' },
        { label: 'ออกกำลังกาย', value: exerciseDays, unit: 'วัน/สัปดาห์', emoji: '🏃', bg: 'bg-emerald-50', text: 'text-emerald-700' },
      ].map(s => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
          <p className="text-xl mb-1">{s.emoji}</p>
          <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
          <p className="text-xs text-slate-500">{s.unit}</p>
          <p className="text-xs font-medium text-slate-600 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { history, latestAssessment } = useHealth()
  const [tab, setTab] = useState('score')

  const radarData = latestAssessment ? [
    { subject: 'นอนหลับ', value: latestAssessment.sleepScore, fullMark: 100 },
    { subject: 'หน้าจอ', value: latestAssessment.screenScore, fullMark: 100 },
    { subject: 'เครียด', value: latestAssessment.stressScore, fullMark: 100 },
    { subject: 'ออกกำลัง', value: latestAssessment.exerciseScore, fullMark: 100 },
    { subject: 'น้ำดื่ม', value: latestAssessment.waterScore, fullMark: 100 },
  ] : []

  const tabs = [
    { key: 'score', label: 'คะแนน' },
    { key: 'sleep', label: 'นอนหลับ' },
    { key: 'water', label: 'น้ำ' },
    { key: 'stress', label: 'เครียด' },
    { key: 'screen', label: 'หน้าจอ' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">กราฟสุขภาพ</h1>
          <p className="text-xs text-slate-500">วิเคราะห์ข้อมูล 7 วันย้อนหลัง</p>
        </div>
      </div>

      <StatSummary history={history} />

      {/* Tab Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border border-blue-100 hover:border-blue-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <ChartCard
        title={tabs.find(t => t.key === tab)?.label + ' — 7 วันที่ผ่านมา'}
        icon={Activity}
        iconColor="bg-blue-600"
      >
        <ResponsiveContainer width="100%" height={200}>
          {tab === 'score' ? (
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} คะแนน`, 'คะแนนสุขภาพ']} />
              <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} fill="url(#g1)" dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
            </AreaChart>
          ) : tab === 'sleep' ? (
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0FF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ชม.`, 'ชั่วโมงนอน']} />
              <Area type="monotone" dataKey="sleep" stroke="#6366F1" strokeWidth={2.5} fill="url(#g2)" dot={{ r: 4, fill: '#6366F1' }} />
              <Line type="monotone" dataKey={() => 7} stroke="#FCA5A5" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="เป้าหมาย" />
            </AreaChart>
          ) : tab === 'water' ? (
            <BarChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECFEFF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} แก้ว`, 'น้ำดื่ม']} />
              <Bar dataKey="water" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : tab === 'stress' ? (
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFBEB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v}/10`, 'ระดับความเครียด']} />
              <Area type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2.5} fill="url(#g3)" dot={{ r: 4, fill: '#F59E0B' }} />
            </AreaChart>
          ) : (
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F3FF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 16]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ชม.`, 'เวลาหน้าจอ']} />
              <Area type="monotone" dataKey="screen" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#g4)" dot={{ r: 4, fill: '#8B5CF6' }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {/* Radar Chart */}
      {latestAssessment && (
        <ChartCard title="โปรไฟล์สุขภาพ (Radar)" icon={Activity} iconColor="bg-emerald-500">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontFamily: 'Sarabun', fill: '#64748B' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={5} />
              <Radar name="คะแนน" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#2563EB' }} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} คะแนน`]} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 text-center mt-2">จากการประเมินล่าสุด</p>
        </ChartCard>
      )}

      {/* Exercise Pattern */}
      <ChartCard title="การออกกำลังกาย 7 วัน" icon={Activity} iconColor="bg-emerald-500">
        <div className="flex gap-2 justify-center py-4">
          {history.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                h.exercise ? 'bg-emerald-100 shadow-sm' : 'bg-slate-100'
              }`}>
                {h.exercise ? '🏃' : '💤'}
              </div>
              <span className="text-xs text-slate-400">{h.date}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs px-2">
          <span className="text-slate-400">✅ ออกกำลังกาย {history.filter(h => h.exercise).length} วัน</span>
          <span className="text-slate-400">❌ หยุด {history.filter(h => !h.exercise).length} วัน</span>
        </div>
      </ChartCard>

      {/* Combo Chart */}
      <ChartCard title="เปรียบเทียบนอนหลับ vs น้ำดื่ม" icon={Moon} iconColor="bg-indigo-500">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Sarabun' }} />
            <Line type="monotone" dataKey="sleep" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} name="นอนหลับ (ชม.)" />
            <Line type="monotone" dataKey="water" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} name="น้ำ (แก้ว)" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
