import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, ChevronDown, ClipboardList, Star } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import ScoreRing from '../components/ScoreRing'
import Survey from './Survey'
import { StickerChar } from '../components/CharDecor'

// ── Static config: no user-facing text ────────────────────────────────────────
const DIMS_META = [
  { id:'food',     emoji:'🍱', color:'bg-emerald-500', light:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', ring:'#10b981' },
  { id:'exercise', emoji:'🏃', color:'bg-blue-500',    light:'bg-blue-50',    text:'text-blue-700',   border:'border-blue-200',   ring:'#3b82f6' },
  { id:'emotion',  emoji:'🧘', color:'bg-purple-500',  light:'bg-purple-50',  text:'text-purple-700', border:'border-purple-200', ring:'#8b5cf6' },
]

// isRisk flag per question per dimension (used for scoring math)
const DIMS_RISKS = [
  [false, false, false, true, true, true, true, false], // food (8)
  [false, false, false],                                 // exercise (3)
  [false, false, false, false, false],                   // emotion (5)
]

const TOTAL_Q    = DIMS_RISKS.reduce((s, r) => s + r.length, 0) // 16
const MAX_HEALTH = TOTAL_Q * 5 // 80

function getDimStart(dimIdx) {
  let start = 0
  for (let i = 0; i < dimIdx; i++) start += DIMS_RISKS[i].length
  return start
}

function getDimHealthScore(dimIdx, answers) {
  const start = getDimStart(dimIdx)
  return DIMS_RISKS[dimIdx].reduce((s, isRisk, qi) => {
    const v = answers[start + qi] || 0
    if (!v) return s
    return s + (isRisk ? (6 - v) : v)
  }, 0)
}

function getDimMaxScore(dimIdx) { return DIMS_RISKS[dimIdx].length * 5 }

function getTotalHealthScore(answers) {
  return DIMS_META.reduce((s, _, di) => s + getDimHealthScore(di, answers), 0)
}

function getDimensions(t3o) {
  return DIMS_META.map((m, di) => ({
    ...m,
    label:     t3o.dims[m.id].label,
    desc:      t3o.dims[m.id].desc,
    ref:       t3o.dims[m.id].ref,
    questions: t3o.dims[m.id].questions.map((text, qi) => ({
      text,
      isRisk: DIMS_RISKS[di][qi],
    })),
  }))
}

function getDimLevel(score, maxScore, t3o) {
  const pct = score / maxScore
  const lv  = t3o.dimLevels
  if (pct >= 0.8) return { label: lv[0], color: 'text-emerald-600', bg: 'bg-emerald-100' }
  if (pct >= 0.6) return { label: lv[1], color: 'text-teal-600',    bg: 'bg-teal-100' }
  if (pct >= 0.4) return { label: lv[2], color: 'text-yellow-600',  bg: 'bg-yellow-100' }
  return               { label: lv[3], color: 'text-red-600',       bg: 'bg-red-100' }
}

function getOverallLevel(healthScore, t3o) {
  const pct = healthScore / MAX_HEALTH
  const ol  = t3o.overallLevels
  if (pct >= 0.8) return { ...ol[0], emoji: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: '#10b981' }
  if (pct >= 0.6) return { ...ol[1], emoji: '😊', color: 'text-teal-600',    bg: 'bg-teal-50',   ring: '#0d9488' }
  if (pct >= 0.4) return { ...ol[2], emoji: '⚠️', color: 'text-yellow-600',  bg: 'bg-yellow-50', ring: '#f59e0b' }
  return               { ...ol[3], emoji: '🚨', color: 'text-red-600',       bg: 'bg-red-50',    ring: '#ef4444' }
}

function DeltaBadge({ delta }) {
  if (delta === 0) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-semibold min-w-[2.5rem] text-center inline-block">—</span>
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold min-w-[2.5rem] text-center inline-block ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {delta > 0 ? '+' : ''}{delta}
    </span>
  )
}

function BeforeAfterSection({ currentResult, prevAssessment }) {
  const { t } = useLang()
  const t3o = t.assess3o
  if (!prevAssessment) return null
  const overallDelta = (currentResult.overallScore ?? 0) - (prevAssessment.overallScore ?? 0)
  const COMPARE_DIMS = [
    { scoreKey: 'nutritionScore', emoji: '🍱', label: t3o.compareLabels[0] },
    { scoreKey: 'exerciseScore',  emoji: '🏃', label: t3o.compareLabels[1] },
    { scoreKey: 'stressScore',    emoji: '🧘', label: t3o.compareLabels[2] },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
        <p className="text-white font-bold text-sm">{t3o.compare.title}</p>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${overallDelta > 0 ? 'bg-green-500 text-white' : overallDelta < 0 ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
          {overallDelta > 0 ? '↑ +' : overallDelta < 0 ? '↓ ' : ''}{overallDelta === 0 ? t3o.compare.same : overallDelta}
        </span>
      </div>
      <div className="px-4 py-3 flex items-center gap-2 bg-slate-50 border-b border-slate-100">
        <span className="text-base">🏅</span>
        <span className="text-sm font-semibold text-slate-700 flex-1">{t3o.compare.total}</span>
        <span className="text-xs text-slate-400 w-7 text-right">{prevAssessment.overallScore ?? 0}</span>
        <span className="text-slate-300 text-xs mx-1">→</span>
        <span className="text-sm font-bold text-slate-800 w-7 text-right">{currentResult.overallScore ?? 0}</span>
        <div className="w-14 text-right"><DeltaBadge delta={overallDelta} /></div>
      </div>
      {COMPARE_DIMS.map(d => {
        const prev = prevAssessment[d.scoreKey] ?? 0
        const curr = currentResult[d.scoreKey] ?? 0
        const delta = curr - prev
        return (
          <div key={d.scoreKey} className="px-4 py-2.5 flex items-center gap-2 border-b border-slate-50 last:border-0">
            <span className="text-sm">{d.emoji}</span>
            <span className="text-xs text-slate-600 flex-1">{d.label}</span>
            <span className="text-xs text-slate-400 w-7 text-right">{prev}</span>
            <span className="text-slate-200 text-[10px] mx-1">→</span>
            <span className="text-xs font-semibold text-slate-800 w-7 text-right">{curr}</span>
            <div className="w-14 text-right"><DeltaBadge delta={delta} /></div>
          </div>
        )
      })}
    </div>
  )
}

function HistorySection({ history }) {
  const { t } = useLang()
  const t3o = t.assess3o
  const [open, setOpen] = useState(false)
  if (!history || history.length === 0) return null
  const sorted = [...history].sort((a, b) => b.fullDate.localeCompare(a.fullDate))
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-slate-50 transition-colors">
        <span className="text-base">📅</span>
        <p className="text-sm font-bold text-slate-700 flex-1">{t3o.history.title} ({t3o.history.nTimes.replace('{n}', history.length)})</p>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="divide-y divide-slate-50 border-t border-slate-100">
          {sorted.map((h, i) => {
            const color = h.score >= 80 ? '#10b981' : h.score >= 60 ? '#0d9488' : h.score >= 40 ? '#f59e0b' : '#ef4444'
            const isLatest = i === 0
            return (
              <div key={h.fullDate} className={`px-4 py-2.5 flex items-center gap-3 ${isLatest ? 'bg-emerald-50' : ''}`}>
                <div className="flex-shrink-0 w-14">
                  <p className="text-[11px] font-semibold text-slate-600">
                    {new Date(h.fullDate + 'T12:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-slate-400">{h.date}</p>
                </div>
                <div className="flex-1 flex gap-1 flex-wrap min-w-0">
                  {[{ k: 'nutrition', e: '🍱' }, { k: 'exercise', e: '🏃' }, { k: 'stress', e: '🧘' }].map(d => (
                    <span key={d.k} className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                      {d.e}{h[d.k] ?? '-'}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isLatest && <span className="text-[10px] bg-emerald-100 text-emerald-600 font-semibold px-1.5 py-0.5 rounded-full">{t3o.history.latest}</span>}
                  <span className="text-sm font-black" style={{ color }}>{h.score}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ResultScreen({ answers, pointsEarned, alreadyToday, onShare, currentResult, prevAssessment, history }) {
  const { t } = useLang()
  const t3o = t.assess3o
  const safeAnswers = Array.isArray(answers) && answers.length === TOTAL_Q ? answers : Array(TOTAL_Q).fill(3)
  const healthScore = getTotalHealthScore(safeAnswers)
  const overallPct  = Math.round((healthScore / MAX_HEALTH) * 100)
  const level       = getOverallLevel(healthScore, t3o)

  const dims = getDimensions(t3o)
  const dimResults = dims.map((dim, di) => {
    const sc    = getDimHealthScore(di, safeAnswers)
    const maxSc = getDimMaxScore(di)
    return { ...dim, score: sc, maxScore: maxSc, pct: Math.round((sc / maxSc) * 100), lv: getDimLevel(sc, maxSc, t3o) }
  })

  return (
    <div className="space-y-5">
      {/* Overall score card */}
      <div className={`${level.bg} rounded-3xl p-6 text-center`}>
        <p className="text-4xl mb-2">{level.emoji}</p>
        <p className="text-sm text-slate-500 mb-2">{t3o.result.scoreLabel}</p>
        <div className="flex items-center justify-center mb-3 relative">
          <ScoreRing score={overallPct} size={130} strokeWidth={10} color={level.ring} />
          <div className="absolute text-center">
            <span className={`text-4xl font-black ${level.color}`}>{overallPct}</span>
          </div>
        </div>
        <p className={`text-lg font-bold ${level.color}`}>{level.label}</p>
        <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {healthScore}/{MAX_HEALTH} · 3อ.2ส.
        </p>
      </div>

      {/* Points earned */}
      {alreadyToday ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-slate-600">{t3o.result.alreadyTitle}</p>
            <p className="text-xs text-slate-400">{t3o.result.alreadySub}</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-semibold text-yellow-700">{t3o.result.earnedPts.replace('{n}', pointsEarned)}</p>
            <p className="text-xs text-yellow-500">{t3o.result.reassess}</p>
          </div>
        </div>
      )}

      <BeforeAfterSection currentResult={currentResult} prevAssessment={prevAssessment} />

      {/* Per-dimension scores */}
      <div>
        <h3 className="font-bold text-slate-700 text-sm mb-2">{t3o.result.byDomain}</h3>
        <div className="space-y-2">
          {dimResults.map(d => (
            <div key={d.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-lg">{d.emoji}</span>
              <span className="text-sm font-medium text-slate-700 flex-1">{d.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.ring }} />
                </div>
                <span className="text-sm font-bold w-8 text-right" style={{ color: d.ring }}>{d.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <HistorySection history={history} />

      <button onClick={onShare} className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-xl py-3 transition-colors">
        {t3o.result.shareBtn}
      </button>
    </div>
  )
}

function GuideScreen({ onStart }) {
  const { t } = useLang()
  const t3o = t.assess3o
  const dims = getDimensions(t3o)
  const g = t3o.guide
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-8 space-y-5">
      <div className="relative text-center">
        {/* ตัวการ์ตูนซ้าย-ขวา */}
        <StickerChar name="boy5" size={0.85} style={{ position:'absolute', left:-8, bottom:0, opacity:.9 }} />
        <StickerChar name="girl1c" size={0.85} flip style={{ position:'absolute', right:-8, bottom:0, opacity:.9 }} />
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-2xl font-extrabold text-emerald-700">{g.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{g.subtitle}</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
        <p className="font-bold text-emerald-700 text-sm">{g.howTitle}</p>
        <p className="text-slate-600 text-sm leading-relaxed">
          {g.howParts[0]}<strong>{g.howParts[1]}</strong>{g.howParts[2]}
        </p>
        <div className="grid grid-cols-5 gap-1 pt-1">
          {t3o.scaleLabels.map((label, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center mx-auto text-sm font-bold text-emerald-600">{i + 1}</div>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="font-bold text-slate-700 text-sm mb-3">{g.topicsTitle} ({dims.length} · {TOTAL_Q} {t3o.qUnit})</p>
        <div className="space-y-2">
          {dims.map((d, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-xl w-7 text-center">{d.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{d.label}</p>
                <p className="text-xs text-slate-400">{d.desc}</p>
              </div>
              <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{d.questions.length} {t3o.qUnit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
        <p className="font-bold text-yellow-700 text-sm mb-1">{g.timeTitle}</p>
        <p className="text-slate-500 text-xs leading-relaxed">{g.timeSub.replace('{total}', TOTAL_Q)}</p>
      </div>

      <button onClick={onStart}
        className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-md transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
        {g.start}
      </button>
    </div>
  )
}

export default function Assessment() {
  const [activeTab, setActiveTab] = useState('assessment')
  const { saveAssessment, latestAssessment, history } = useHealth()
  const { t } = useLang()
  const t3o = t.assess3o
  const navigate = useNavigate()

  const todayStr  = new Date().toISOString().split('T')[0]
  const hasToday  = latestAssessment?.assessedAt === todayStr

  const [showGuide, setShowGuide]           = useState(() => !hasToday)
  const [step, setStep]                     = useState(0)
  const [answers, setAnswers]               = useState(Array(TOTAL_Q).fill(0))
  const [result, setResult]                 = useState(() => hasToday ? latestAssessment : null)
  const [earnInfo, setEarnInfo]             = useState(() =>
    hasToday ? { pointsEarned: 0, alreadyToday: true } : { pointsEarned: 0, alreadyToday: false }
  )
  const [prevAssessment, setPrevAssessment] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_prev') ?? 'null') } catch { return null }
  })

  const dims       = getDimensions(t3o)
  const dim        = dims[step]
  const dimStart   = getDimStart(step)
  const progress   = (step / dims.length) * 100
  const dimAnswers = answers.slice(dimStart, dimStart + dim.questions.length)
  const allAnswered = dimAnswers.every(v => v > 0)

  function handleAnswer(globalIdx, value) {
    setAnswers(prev => prev.map((a, i) => i === globalIdx ? value : a))
  }

  function handleNext() {
    if (step < dims.length - 1) {
      setStep(s => s + 1)
      window.scrollTo(0, 0)
    } else {
      const healthScore    = getTotalHealthScore(answers)
      const overallScore   = Math.round((healthScore / MAX_HEALTH) * 100)
      const nutritionScore = Math.round((getDimHealthScore(0, answers) / getDimMaxScore(0)) * 100)
      const exerciseScore  = Math.round((getDimHealthScore(1, answers) / getDimMaxScore(1)) * 100)
      const stressScore    = Math.round((getDimHealthScore(2, answers) / getDimMaxScore(2)) * 100)
      const assessment = {
        overallScore, nutritionScore, exerciseScore, stressScore,
        sleepScore: 0, digitalScore: 0,
        answers: [...answers],
      }
      const info = saveAssessment(assessment)
      setEarnInfo(info)
      setPrevAssessment(info.prevAssessment ?? null)
      setResult(assessment)
      window.scrollTo(0, 0)
    }
  }

  function handleShare() {
    const healthScore = getTotalHealthScore(answers)
    const overallPct  = Math.round((healthScore / MAX_HEALTH) * 100)
    const level       = getOverallLevel(healthScore, t3o)
    const dimLines    = dims.map((d, di) => {
      const sc  = getDimHealthScore(di, answers)
      const pct = Math.round((sc / getDimMaxScore(di)) * 100)
      return `${d.emoji} ${d.label}: ${pct}%`
    }).join('\n')
    const text = `${t3o.share.header}\n${level.emoji} ${overallPct}/100 — ${level.label}\n${dimLines}`
    if (navigator.share) {
      navigator.share({ title: t3o.share.title, text })
    } else {
      navigator.clipboard.writeText(text).then(() => alert(t3o.share.copied))
    }
  }

  return (
    <>
      {/* Tab switcher */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'assessment' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <ClipboardList size={15} />
            {t3o.tabAssess}
          </button>
          <button
            onClick={() => setActiveTab('survey')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'survey' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Star size={15} />
            {t3o.tabSurvey}
          </button>
        </div>
      </div>

      {activeTab === 'survey' ? (
        <Survey />
      ) : showGuide ? (
        <GuideScreen onStart={() => setShowGuide(false)} />
      ) : result ? (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800">{t3o.result.title}</h1>
            <button onClick={() => navigate('/analytics')} className="text-sm text-emerald-600 font-medium">
              {t3o.result.seeAdvice}
            </button>
          </div>
          <ResultScreen
            answers={result.answers}
            pointsEarned={earnInfo.pointsEarned}
            alreadyToday={earnInfo.alreadyToday}
            onShare={handleShare}
            currentResult={result}
            prevAssessment={prevAssessment}
            history={history}
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-6">
          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>{t3o.progress.replace('{step}', step + 1).replace('{total}', dims.length)}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: dim.ring }} />
            </div>
            <div className="flex gap-1.5 mt-2.5">
              {dims.map((d, i) => (
                <div key={d.id} className={`flex-1 h-1 rounded-full transition-colors ${
                  i < step ? d.color : i === step ? `${d.color} opacity-70` : 'bg-slate-100'
                }`} />
              ))}
            </div>
          </div>

          {/* Domain header */}
          <div className={`${dim.light} border ${dim.border} rounded-2xl px-4 py-3 flex items-center gap-3 mb-5`}>
            <div className={`w-11 h-11 ${dim.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
              {dim.emoji}
            </div>
            <div>
              <p className="text-xs text-slate-400">{t3o.progress.replace('{step}', step + 1).replace('{total}', dims.length)}</p>
              <p className={`font-bold ${dim.text}`}>{dim.label}</p>
            </div>
          </div>

          {/* Scale legend */}
          <div className="bg-slate-50 rounded-xl px-3 py-2 mb-4">
            <div className="flex justify-between text-[10px] text-slate-400">
              {t3o.scaleLabels.map((label, i) => (
                <span key={i} className="text-center w-1/5">{i + 1}<br/>{label}</span>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {dim.questions.map((q, qi) => {
              const globalIdx = dimStart + qi
              const picked    = answers[globalIdx]
              return (
                <div key={qi} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex gap-2 mb-3">
                    <span className={`w-6 h-6 rounded-full ${dim.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {globalIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
                      {q.isRisk && (
                        <p className="text-[10px] text-orange-400 flex items-center gap-1 mt-1">
                          ⚠️ {t3o.riskWarn}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v}
                        onClick={() => handleAnswer(globalIdx, v)}
                        className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                          picked === v
                            ? `${dim.color} text-white shadow-md`
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                  {picked > 0 && (
                    <p className={`text-[10px] ${dim.text} font-semibold mt-1.5 text-right`}>
                      {t3o.scaleLabels[picked - 1]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Reference */}
          <div className={`${dim.light} border ${dim.border} rounded-xl px-3 py-2 flex items-start gap-1.5 mt-4`}>
            <span className="text-[11px] flex-shrink-0 mt-0.5">📚</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-600">{t3o.refLabel}</span>
              {dim.ref}
            </p>
          </div>

          {/* Nav buttons */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex gap-3 pb-safe md:static md:bottom-auto md:border-none md:bg-transparent md:mt-6 md:px-0 md:pb-0">
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0) }}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                <ChevronLeft size={18} /> {t3o.backBtn}
              </button>
            )}
            <button onClick={handleNext} disabled={!allAnswered}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                allAnswered
                  ? `${dim.color} text-white hover:opacity-90`
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}>
              {step === dims.length - 1
                ? <><Check size={18} /> {t3o.finishBtn}</>
                : <>{t3o.nextBtn} <ChevronRight size={18} /></>
              }
            </button>
          </div>
        </div>
      )}
    </>
  )
}
