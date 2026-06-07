import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, Moon, Activity,
  Lightbulb, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, Brain
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { generateRecommendations, getHealthLevel } from '../utils/healthScore'

const tooltipStyle = {
  contentStyle: { borderRadius: '12px', border: '1px solid #DBEAFE', fontSize: '12px', fontFamily: 'Sarabun' },
  labelStyle: { fontWeight: '700', color: '#1E40AF' },
}

/* ── Shared chart card ── */
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

/* ── Analytics tab content ── */
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

function AnalyticsContent({ history, latestAssessment }) {
  const [chartTab, setChartTab] = useState('score')

  const radarData = latestAssessment ? [
    { subject: 'นอนหลับ', value: latestAssessment.sleepScore, fullMark: 100 },
    { subject: 'หน้าจอ', value: latestAssessment.screenScore, fullMark: 100 },
    { subject: 'เครียด', value: latestAssessment.stressScore, fullMark: 100 },
    { subject: 'ออกกำลัง', value: latestAssessment.exerciseScore, fullMark: 100 },
    { subject: 'น้ำดื่ม', value: latestAssessment.waterScore, fullMark: 100 },
  ] : []

  const chartTabs = [
    { key: 'score', label: 'คะแนน' },
    { key: 'sleep', label: 'นอนหลับ' },
    { key: 'water', label: 'น้ำ' },
    { key: 'stress', label: 'เครียด' },
    { key: 'screen', label: 'หน้าจอ' },
  ]

  return (
    <div className="space-y-5">
      <StatSummary history={history} />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {chartTabs.map(t => (
          <button key={t.key} onClick={() => setChartTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              chartTab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border border-blue-100 hover:border-blue-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <ChartCard
        title={chartTabs.find(t => t.key === chartTab)?.label + ' — 7 วันที่ผ่านมา'}
        icon={Activity}
        iconColor="bg-blue-600"
      >
        <ResponsiveContainer width="100%" height={200}>
          {chartTab === 'score' ? (
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
          ) : chartTab === 'sleep' ? (
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
          ) : chartTab === 'water' ? (
            <BarChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECFEFF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} แก้ว`, 'น้ำดื่ม']} />
              <Bar dataKey="water" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : chartTab === 'stress' ? (
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

/* ── Recommendations tab content ── */
function AiInsightBanner({ assessment }) {
  const level = getHealthLevel(assessment.overallScore)
  const weakAreas = [
    assessment.sleepScore < 65 && 'การนอนหลับ',
    assessment.screenScore < 65 && 'เวลาหน้าจอ',
    assessment.stressScore < 65 && 'ความเครียด',
    assessment.exerciseScore < 65 && 'การออกกำลังกาย',
    assessment.waterScore < 65 && 'การดื่มน้ำ',
  ].filter(Boolean)

  return (
    <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-5 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-yellow-900" />
          </div>
          <div>
            <p className="text-blue-200 text-xs">AI Health Analysis</p>
            <p className="font-bold text-sm">วิเคราะห์สุขภาพอัจฉริยะ</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed">
          {level.emoji} สุขภาพโดยรวมของคุณอยู่ในระดับ <strong className="text-white">{level.label}</strong>
          {weakAreas.length > 0 && (
            <> จุดที่ต้องปรับปรุงคือ <strong className="text-yellow-300">{weakAreas.join(', ')}</strong></>
          )}
          {weakAreas.length === 0 && <> ทุกด้านอยู่ในเกณฑ์ดี รักษาต่อไปนะ!</>}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${assessment.overallScore}%` }} />
          </div>
          <span className="text-sm font-bold text-yellow-300">{assessment.overallScore}/100</span>
        </div>
      </div>
    </div>
  )
}

function RecCard({ rec, completedTips, toggleTip }) {
  const [expanded, setExpanded] = useState(true)
  const done = rec.tips.filter(t => completedTips.includes(t.id)).length
  const total = rec.tips.length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-blue-50/50 transition-colors">
        <span className="text-2xl">{rec.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">{rec.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priorityColor}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{done}/{total} เสร็จแล้ว</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-blue-50">
          <div className="bg-blue-50 rounded-xl p-3 my-3">
            <div className="flex items-start gap-2">
              <Brain size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">{rec.aiInsight}</p>
            </div>
          </div>
          <div className="space-y-2">
            {rec.tips.map(tip => {
              const isDone = completedTips.includes(tip.id)
              return (
                <button key={tip.id} onClick={() => toggleTip(tip.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-blue-50 border border-transparent'
                  }`}
                >
                  {isDone
                    ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Circle size={18} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  }
                  <span className={`text-sm leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {tip.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function RecommendationsContent({ latestAssessment, completedTips, toggleTip }) {
  if (!latestAssessment) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
        <p className="text-6xl mb-4">🤔</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีข้อมูลการประเมิน</h2>
        <p className="text-sm text-slate-500 mb-6">ทำแบบประเมินสุขภาพก่อนเพื่อรับคำแนะนำ AI ส่วนตัว</p>
        <Link to="/assessment" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
          เริ่มประเมินสุขภาพ
        </Link>
      </div>
    )
  }

  const recs = generateRecommendations(latestAssessment)
  const completedCount = completedTips.length
  const totalTips = recs.reduce((s, r) => s + r.tips.length, 0)

  return (
    <div className="space-y-4">
      <AiInsightBanner assessment={latestAssessment} />

      {totalTips > 0 && (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-blue-50">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">ความคืบหน้า</p>
            <p className="text-xs text-slate-400">{completedCount} จาก {totalTips} คำแนะนำ</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-blue-700">{Math.round((completedCount / totalTips) * 100)}%</p>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden self-center">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(completedCount / totalTips) * 100}%` }} />
          </div>
        </div>
      )}

      {recs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-6xl mb-4">🌟</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">สุขภาพดีเยี่ยม!</h2>
          <p className="text-sm text-slate-500 mb-4">ทุกด้านของคุณอยู่ในเกณฑ์ที่ดีมาก รักษาสุขภาพนี้ต่อไปนะ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map(rec => (
            <RecCard key={rec.id} rec={rec} completedTips={completedTips} toggleTip={toggleTip} />
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-yellow-800 mb-3">🌟 เคล็ดลับทั่วไปสำหรับวัยรุ่น</p>
        <div className="space-y-2">
          {[
            '😊 ใช้เวลากับคนที่รัก ลดความเครียดได้ดีที่สุด',
            '🌅 ออกไปรับแสงแดดตอนเช้า กระตุ้น Serotonin',
            '🎵 ฟังเพลงที่ชอบขณะออกกำลังกาย เพิ่มแรงบันดาลใจ',
            '📵 ลอง Digital Detox 1 ชั่วโมงก่อนนอน',
          ].map(tip => (
            <p key={tip} className="text-xs text-yellow-700 leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/assessment" className="text-sm text-blue-600 font-medium hover:underline">
          ประเมินสุขภาพใหม่ →
        </Link>
      </div>
    </div>
  )
}

/* ── Main combined page ── */
export default function Analytics() {
  const { history, latestAssessment, completedTips, toggleTip } = useHealth()
  const [mainTab, setMainTab] = useState('charts')

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">สุขภาพของฉัน</h1>
          <p className="text-xs text-slate-500">กราฟ & คำแนะนำ AI</p>
        </div>
      </div>

      {/* Top-level tab switcher */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setMainTab('charts')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mainTab === 'charts'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp size={15} />
          กราฟสุขภาพ
        </button>
        <button
          onClick={() => setMainTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mainTab === 'ai'
              ? 'bg-white text-yellow-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lightbulb size={15} />
          คำแนะนำ AI
        </button>
      </div>

      {mainTab === 'charts' ? (
        <AnalyticsContent history={history} latestAssessment={latestAssessment} />
      ) : (
        <RecommendationsContent
          latestAssessment={latestAssessment}
          completedTips={completedTips}
          toggleTip={toggleTip}
        />
      )}
    </div>
  )
}
