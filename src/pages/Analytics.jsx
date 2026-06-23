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
import { useLang } from '../context/LangContext'
import { generateRecommendations, getHealthLevel } from '../utils/healthScore'

const tooltipStyle = {
  contentStyle: { borderRadius: '12px', border: '1px solid #e0e7ff', fontSize: '12px', fontFamily: 'Sarabun' },
  labelStyle: { fontWeight: '700', color: '#3730a3' },
}

function ChartCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50">
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

function StatSummary({ history, t }) {
  const a = t.analytics
  const avgScore     = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0
  const avgSleep     = history.length ? +(history.reduce((s, h) => s + h.sleep, 0) / history.length).toFixed(1) : 0
  const avgWater     = history.length ? Math.round(history.reduce((s, h) => s + h.water, 0) / history.length) : 0
  const exerciseDays = history.filter(h => h.exercise).length

  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: a.avgScore,    value: avgScore,     unit: a.unitScore,   emoji: '⭐', bg: 'bg-indigo-50',    text: 'text-indigo-700' },
        { label: a.avgSleep,    value: avgSleep,     unit: a.unitHrs,     emoji: '🌙', bg: 'bg-indigo-50',  text: 'text-indigo-700' },
        { label: a.avgWater,    value: avgWater,     unit: a.unitGlasses, emoji: '💧', bg: 'bg-cyan-50',    text: 'text-cyan-700' },
        { label: a.avgExercise, value: exerciseDays, unit: a.unitDays,    emoji: '🏃', bg: 'bg-emerald-50', text: 'text-emerald-700' },
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

function AnalyticsContent({ history, latestAssessment, t }) {
  const a = t.analytics
  const [chartTab, setChartTab] = useState('score')

  const radarData = latestAssessment ? [
    { subject: a.weakAreas.sleep,      value: latestAssessment.sleepScore,     fullMark: 100 },
    { subject: a.weakAreas.screen,     value: latestAssessment.digitalScore,   fullMark: 100 },
    { subject: a.weakAreas.stress,     value: latestAssessment.stressScore,    fullMark: 100 },
    { subject: a.weakAreas.exercise,   value: latestAssessment.exerciseScore,  fullMark: 100 },
    { subject: a.weakAreas.water,      value: latestAssessment.waterScore,     fullMark: 100 },
    { subject: a.weakAreas.nutrition,  value: latestAssessment.nutritionScore, fullMark: 100 },
  ] : []

  const chartTabs = a.chartTabs
  const currentLabel = chartTabs.find(ct => ct.key === chartTab)?.label ?? ''

  return (
    <div className="space-y-5">
      <StatSummary history={history} t={t} />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {chartTabs.map(ct => (
          <button key={ct.key} onClick={() => setChartTab(ct.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              chartTab === ct.key ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 border border-indigo-100 hover:border-indigo-300'
            }`}>
            {ct.label}
          </button>
        ))}
      </div>

      <ChartCard title={currentLabel + ' ' + a.last7} icon={Activity} iconColor="bg-indigo-600">
        <ResponsiveContainer width="100%" height={200}>
          {chartTab === 'score' ? (
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ${a.ttScoreUnit}`, a.ttScoreLabel]} />
              <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fill="url(#g1)" dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
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
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ${a.ttSleepUnit}`, a.ttSleepLabel]} />
              <Area type="monotone" dataKey="sleep" stroke="#6366F1" strokeWidth={2.5} fill="url(#g2)" dot={{ r: 4, fill: '#6366F1' }} />
              <Line type="monotone" dataKey={() => 7} stroke="#FCA5A5" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name={a.goalLabel} />
            </AreaChart>
          ) : chartTab === 'water' ? (
            <BarChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECFEFF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ${a.ttWaterUnit}`, a.ttWaterLabel]} />
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
              <Tooltip {...tooltipStyle} formatter={v => [`${v}/10`, a.ttStressLabel]} />
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
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ${a.ttScreenUnit}`, a.ttScreenLabel]} />
              <Area type="monotone" dataKey="screen" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#g4)" dot={{ r: 4, fill: '#8B5CF6' }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {latestAssessment && (
        <ChartCard title={a.radarTitle} icon={Activity} iconColor="bg-emerald-500">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontFamily: 'Sarabun', fill: '#64748B' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={5} />
              <Radar name={a.ttScoreUnit} dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#4f46e5' }} />
              <Tooltip {...tooltipStyle} formatter={v => [`${v} ${a.ttScoreUnit}`]} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 text-center mt-2">{a.radarSub}</p>
        </ChartCard>
      )}

      <ChartCard title={a.exTitle} icon={Activity} iconColor="bg-emerald-500">
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
          <span className="text-slate-400">✅ {a.exActive} {history.filter(h => h.exercise).length}</span>
          <span className="text-slate-400">❌ {a.exRest} {history.filter(h => !h.exercise).length}</span>
        </div>
      </ChartCard>

      <ChartCard title={a.sleepWater} icon={Moon} iconColor="bg-indigo-500">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Sarabun' }} />
            <Line type="monotone" dataKey="sleep" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} name={a.sleepLine} />
            <Line type="monotone" dataKey="water" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} name={a.waterLine} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function AiInsightBanner({ assessment, t }) {
  const a = t.analytics
  const level = getHealthLevel(assessment.overallScore)
  const weakAreas = [
    assessment.sleepScore     < 65 && a.weakAreas.sleep,
    assessment.digitalScore   < 65 && a.weakAreas.screen,
    assessment.stressScore    < 65 && a.weakAreas.stress,
    assessment.exerciseScore  < 65 && a.weakAreas.exercise,
    assessment.waterScore     < 65 && a.weakAreas.water,
    assessment.nutritionScore < 65 && a.weakAreas.nutrition,
  ].filter(Boolean)

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-3xl p-5 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-yellow-900" />
          </div>
          <div>
            <p className="text-indigo-200 text-xs">AI Health Analysis</p>
            <p className="font-bold text-sm">{a.aiTitle}</p>
          </div>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed">
          {level.emoji} {a.overallAt} <strong className="text-white">{level.label}</strong>
          {weakAreas.length > 0 && (
            <> {a.improveAt} <strong className="text-yellow-300">{weakAreas.join(', ')}</strong></>
          )}
          {weakAreas.length === 0 && <> {a.allGood}</>}
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

function RecCard({ rec, completedTips, toggleTip, t }) {
  const a = t.analytics
  const [expanded, setExpanded] = useState(true)
  const done  = rec.tips.filter(tip => completedTips.includes(tip.id)).length
  const total = rec.tips.length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-indigo-50/50 transition-colors">
        <span className="text-2xl">{rec.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">{rec.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priorityColor}`}>{rec.priority}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{done}/{total} {a.doneLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-indigo-50">
          <div className="bg-indigo-50 rounded-xl p-3 my-3">
            <div className="flex items-start gap-2">
              <Brain size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-700 leading-relaxed">{rec.aiInsight}</p>
            </div>
          </div>
          <div className="space-y-2">
            {rec.tips.map(tip => {
              const isDone = completedTips.includes(tip.id)
              return (
                <button key={tip.id} onClick={() => toggleTip(tip.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-indigo-50 border border-transparent'
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

function RecommendationsContent({ latestAssessment, completedTips, toggleTip, t }) {
  const a = t.analytics
  if (!latestAssessment) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
        <p className="text-6xl mb-4">🤔</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{a.noData}</h2>
        <p className="text-sm text-slate-500 mb-6">{a.noDataSub}</p>
        <Link to="/assessment" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
          {a.startAssess}
        </Link>
      </div>
    )
  }

  const recs = generateRecommendations(latestAssessment)
  const completedCount = completedTips.length
  const totalTips = recs.reduce((s, r) => s + r.tips.length, 0)

  return (
    <div className="space-y-4">
      <AiInsightBanner assessment={latestAssessment} t={t} />

      {totalTips > 0 && (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-indigo-50">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">{a.progress}</p>
            <p className="text-xs text-slate-400">{completedCount} {a.of} {totalTips} {a.recs}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-indigo-700">{Math.round((completedCount / totalTips) * 100)}%</p>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden self-center">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${(completedCount / totalTips) * 100}%` }} />
          </div>
        </div>
      )}

      {recs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-6xl mb-4">🌟</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{a.excellent}</h2>
          <p className="text-sm text-slate-500 mb-4">{a.excellentSub}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map(rec => (
            <RecCard key={rec.id} rec={rec} completedTips={completedTips} toggleTip={toggleTip} t={t} />
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-yellow-800 mb-3">{a.tipsTitle}</p>
        <div className="space-y-2">
          {a.generalTips.map(tip => (
            <p key={tip} className="text-xs text-yellow-700 leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/assessment" className="text-sm text-indigo-600 font-medium hover:underline">
          {a.reassess}
        </Link>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { history, latestAssessment, completedTips, toggleTip } = useHealth()
  const { t } = useLang()
  const a = t.analytics
  const [mainTab, setMainTab] = useState('charts')

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{a.title}</h1>
          <p className="text-xs text-slate-500">{a.subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setMainTab('charts')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mainTab === 'charts' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp size={15} />
          {a.tabGraph}
        </button>
        <button
          onClick={() => setMainTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mainTab === 'ai' ? 'bg-white text-yellow-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lightbulb size={15} />
          {a.tabAI}
        </button>
      </div>

      {mainTab === 'charts' ? (
        <AnalyticsContent history={history} latestAssessment={latestAssessment} t={t} />
      ) : (
        <RecommendationsContent
          latestAssessment={latestAssessment}
          completedTips={completedTips}
          toggleTip={toggleTip}
          t={t}
        />
      )}
    </div>
  )
}
