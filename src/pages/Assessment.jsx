import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, AlertCircle, ChevronDown, ClipboardList, Star } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import ScoreRing from '../components/ScoreRing'
import Survey from './Survey'

const DOMAIN_REFS = {
  sleep:     'สมาคมโรคจากการหลับแห่งประเทศไทย (Sleep Society of Thailand) และกรมอนามัย',
  exercise:  'กองกิจกรรมทางกายเพื่อสุขภาพ กรมอนามัย',
  digital:   'สำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์ (ETDA) ร่วมกับราชวิทยาลัยกุมารแพทย์แห่งประเทศไทย',
  stress:    'กรมสุขภาพจิต กระทรวงสาธารณสุข',
  nutrition: 'สำนักโภชนาการ กรมอนามัย กระทรวงสาธารณสุข',
}

// Language-neutral domain config (colors, emojis, question IDs)
const DOMAIN_CONFIG = [
  { key: 'sleep',     emoji: '🌙', color: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200',  ring: '#6366f1', qIds: [1,2,3,4],     reverses: [false,false,false,true]  },
  { key: 'nutrition', emoji: '🥗', color: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  ring: '#F97316', qIds: [5,6,7,8],     reverses: [false,false,false,false]  },
  { key: 'exercise',  emoji: '🏃', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: '#10B981', qIds: [9,10,11,12],  reverses: [false,false,false,true]  },
  { key: 'digital',   emoji: '📱', color: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200',  ring: '#8B5CF6', qIds: [13,14,15,16], reverses: [true,false,false,true]   },
  { key: 'stress',    emoji: '🧘', color: 'bg-yellow-500',  light: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200',  ring: '#F59E0B', qIds: [17,18,19,20], reverses: [true,true,false,true]    },
]

function buildDomains(t) {
  return DOMAIN_CONFIG.map(cfg => ({
    ...cfg,
    label: t.assessment.domains[cfg.key].label,
    questions: cfg.qIds.map((id, i) => ({
      id,
      text: t.assessment.domains[cfg.key].questions[i],
      reverse: cfg.reverses[i],
    })),
  }))
}

function buildScale(t) {
  return t.assessment.scale.map((label, i) => ({ value: i + 1, label }))
}

function applyScore(raw, reverse) {
  return reverse ? (6 - raw) : raw
}

function calcDomainScore(answers, domain) {
  const raw = domain.questions.reduce((s, q) => s + applyScore(answers[q.id] ?? 3, q.reverse), 0)
  return Math.round(((raw - 4) / 16) * 100)
}

function calcTotal(answers, domains) {
  const raw = domains.reduce((s, d) => s + d.questions.reduce((ds, q) => ds + applyScore(answers[q.id] ?? 3, q.reverse), 0), 0)
  const n = domains.length * 4
  return Math.round(((raw - n) / (n * 4)) * 100)
}

function getLevel(total, t) {
  const a = t.assessment
  if (total >= 81) return { label: a.levelExcellent, emoji: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: '#10B981', desc: a.levelExcellentDesc }
  if (total >= 51) return { label: a.levelFair,      emoji: '😊', color: 'text-yellow-600',  bg: 'bg-yellow-50',  ring: '#F59E0B', desc: a.levelFairDesc }
  return               { label: a.levelPoor,          emoji: '⚠️', color: 'text-red-600',    bg: 'bg-red-50',    ring: '#EF4444', desc: a.levelPoorDesc }
}

const COMPARE_DIMS = [
  { scoreKey: 'sleepScore',     emoji: '🌙', label: 'นอนหลับ' },
  { scoreKey: 'nutritionScore', emoji: '🥗', label: 'โภชนาการ' },
  { scoreKey: 'exerciseScore',  emoji: '🏃', label: 'ออกกำลังกาย' },
  { scoreKey: 'digitalScore',   emoji: '📱', label: 'ดิจิทัล' },
  { scoreKey: 'stressScore',    emoji: '🧘', label: 'ความเครียด' },
]

function DeltaBadge({ delta }) {
  if (delta === 0) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-semibold min-w-[2.5rem] text-center inline-block">—</span>
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold min-w-[2.5rem] text-center inline-block ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {delta > 0 ? '+' : ''}{delta}
    </span>
  )
}

function BeforeAfterSection({ currentResult, prevAssessment }) {
  if (!prevAssessment) return null
  const overallDelta = (currentResult.overallScore ?? 0) - (prevAssessment.overallScore ?? 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
        <p className="text-white font-bold text-sm">🔄 เปรียบเทียบกับครั้งก่อน</p>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${overallDelta > 0 ? 'bg-green-500 text-white' : overallDelta < 0 ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
          {overallDelta > 0 ? '↑ +' : overallDelta < 0 ? '↓ ' : ''}{overallDelta === 0 ? 'เท่าเดิม' : overallDelta}
        </span>
      </div>

      <div className="px-4 py-3 flex items-center gap-2 bg-slate-50 border-b border-slate-100">
        <span className="text-base">🏅</span>
        <span className="text-sm font-semibold text-slate-700 flex-1">คะแนนรวม</span>
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
  const [open, setOpen] = useState(false)
  if (!history || history.length === 0) return null
  const sorted = [...history].sort((a, b) => b.fullDate.localeCompare(a.fullDate))

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-slate-50 transition-colors">
        <span className="text-base">📅</span>
        <p className="text-sm font-bold text-slate-700 flex-1">ประวัติการประเมิน ({history.length} ครั้ง)</p>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="divide-y divide-slate-50 border-t border-slate-100">
          {sorted.map((h, i) => {
            const color = h.score >= 81 ? '#10B981' : h.score >= 51 ? '#F59E0B' : '#EF4444'
            const isLatest = i === 0
            return (
              <div key={h.fullDate} className={`px-4 py-2.5 flex items-center gap-3 ${isLatest ? 'bg-indigo-50' : ''}`}>
                <div className="flex-shrink-0 w-14">
                  <p className="text-[11px] font-semibold text-slate-600">
                    {new Date(h.fullDate + 'T12:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-slate-400">{h.date}</p>
                </div>
                <div className="flex-1 flex gap-1 flex-wrap min-w-0">
                  {[
                    { k: 'sleep',     e: '🌙' },
                    { k: 'water',     e: '💧' },
                    { k: 'exercise',  e: '🏃' },
                    { k: 'screen',    e: '📱' },
                    { k: 'stress',    e: '🧘' },
                    { k: 'nutrition', e: '🥗' },
                  ].map(d => (
                    <span key={d.k} className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                      {d.e}{h[d.k] ?? '-'}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isLatest && <span className="text-[10px] bg-indigo-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full">ล่าสุด</span>}
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

function ResultScreen({ answers, pointsEarned, alreadyToday, onShare, t, domains, currentResult, prevAssessment, history }) {
  const total = calcTotal(answers, domains)
  const level = getLevel(total, t)
  const domainScores = domains.map(d => ({ ...d, score: calcDomainScore(answers, d) }))
  const a = t.assessment

  return (
    <div className="space-y-5">
      <div className={`${level.bg} rounded-3xl p-6 text-center`}>
        <p className="text-4xl mb-2">{level.emoji}</p>
        <p className="text-sm text-slate-500 mb-2">{a.scoreLabel}</p>
        <div className="flex items-center justify-center mb-3 relative">
          <ScoreRing score={total} size={130} strokeWidth={10} color={level.ring} />
          <div className="absolute text-center">
            <span className={`text-4xl font-black ${level.color}`}>{total}</span>
          </div>
        </div>
        <p className={`text-lg font-bold ${level.color}`}>{level.label}</p>
        <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
      </div>

      {alreadyToday ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-slate-600">{a.alreadyDone}</p>
            <p className="text-xs text-slate-400">{a.alreadySub}</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-semibold text-yellow-700">{pointsEarned} {a.earnedPts}</p>
            <p className="text-xs text-yellow-500">{a.assessTomr}</p>
          </div>
        </div>
      )}

      <BeforeAfterSection currentResult={currentResult} prevAssessment={prevAssessment} />

      <div>
        <h3 className="font-bold text-slate-700 text-sm mb-2">{a.byDomain}</h3>
        <div className="space-y-2">
          {domainScores.map(d => (
            <div key={d.key} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-lg">{d.emoji}</span>
              <span className="text-sm font-medium text-slate-700 flex-1">{d.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, background: d.ring }} />
                </div>
                <span className="text-sm font-bold w-8 text-right" style={{ color: d.ring }}>{d.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <HistorySection history={history} />

      <button onClick={onShare}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-xl py-3 transition-colors">
        {a.shareBtn}
      </button>
    </div>
  )
}

function GuideScreen({ onStart, t, domains }) {
  const a = t.assessment
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-8 space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-2xl font-extrabold text-indigo-700">{a.guideTitle}</h1>
        <p className="text-slate-500 text-sm mt-1">{a.guideSub}</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
        <p className="font-bold text-indigo-700 text-sm">{a.guideHow}</p>
        <p className="text-slate-600 text-sm leading-relaxed">{a.guideInstr}</p>
        <div className="grid grid-cols-5 gap-1 pt-1">
          {a.scale.map((label, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center mx-auto text-sm font-bold text-indigo-600">{i + 1}</div>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="font-bold text-slate-700 text-sm mb-3">{a.guideTopics}</p>
        <div className="space-y-2">
          {domains.map((d, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-xl w-7 text-center">{d.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{d.label}</p>
                <p className="text-xs text-slate-400">{t.assessment.domains[d.key].desc}</p>
              </div>
              <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{a.guideQCount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
        <p className="font-bold text-yellow-700 text-sm mb-1">{a.guideTime}</p>
        <p className="text-slate-500 text-xs leading-relaxed">{a.guideTimeSub}</p>
      </div>

      <button onClick={onStart}
        className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-md shadow-indigo-200 transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}>
        {a.guideStart}
      </button>

    </div>
  )
}

export default function Assessment() {
  const [activeTab, setActiveTab] = useState('assessment')
  const { saveAssessment, latestAssessment, history } = useHealth()
  const { t, lang } = useLang()
  const navigate = useNavigate()

  const todayStr = new Date().toISOString().split('T')[0]
  const hasToday = latestAssessment?.assessedAt === todayStr

  const [showGuide, setShowGuide] = useState(() => !hasToday)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(() => hasToday ? latestAssessment : null)
  const [earnInfo, setEarnInfo] = useState(() =>
    hasToday ? { pointsEarned: 0, alreadyToday: true } : { pointsEarned: 0, alreadyToday: false }
  )
  const [prevAssessment, setPrevAssessment] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_prev') ?? 'null') } catch { return null }
  })

  const DOMAINS = buildDomains(t)
  const SCALE   = buildScale(t)
  const a       = t.assessment

  const domain = DOMAINS[step]
  const progress = (step / DOMAINS.length) * 100
  const allAnswered = domain.questions.every(q => answers[q.id] !== undefined)

  function handleAnswer(qId, value) {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  function handleNext() {
    if (step < DOMAINS.length - 1) {
      setStep(s => s + 1)
      window.scrollTo(0, 0)
    } else {
      const domainByKey    = Object.fromEntries(DOMAINS.map(d => [d.key, d]))
      const sleepScore     = calcDomainScore(answers, domainByKey.sleep)
      const exerciseScore  = calcDomainScore(answers, domainByKey.exercise)
      const digitalScore   = calcDomainScore(answers, domainByKey.digital)
      const stressScore    = calcDomainScore(answers, domainByKey.stress)
      const nutritionScore = calcDomainScore(answers, domainByKey.nutrition)
      const overallScore   = calcTotal(answers, DOMAINS)
      const assessment     = { sleepScore, exerciseScore, digitalScore, stressScore, nutritionScore, overallScore, answers }
      const info = saveAssessment(assessment)
      setEarnInfo(info)
      setPrevAssessment(info.prevAssessment ?? null)
      setResult(assessment)
      window.scrollTo(0, 0)
    }
  }

  function handleShare() {
    const total = calcTotal(answers, DOMAINS)
    const level = getLevel(total, t)
    const domainLines = DOMAINS.map(d => `${d.emoji} ${d.label}: ${calcDomainScore(answers, d)}`).join('\n')
    const header = lang === 'en'
      ? `🏥 My Health Assessment\n${level.emoji} Total: ${total}/100 — ${level.label}`
      : `🏥 ผลประเมินพฤติกรรมสุขภาพของฉัน\n${level.emoji} คะแนนรวม: ${total}/100 — ${level.label}`
    const text = `${header}\n${domainLines}`
    if (navigator.share) {
      navigator.share({ title: lang === 'en' ? 'My Health Results' : 'ผลสุขภาพของฉัน', text })
    } else {
      navigator.clipboard.writeText(text).then(() => alert(lang === 'en' ? 'Copied!' : 'คัดลอกข้อความแล้ว!'))
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
              activeTab === 'assessment' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList size={15} />
            {a.tabAssess ?? 'ประเมิน'}
          </button>
          <button
            onClick={() => setActiveTab('survey')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'survey' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Star size={15} />
            ความพึงพอใจ
          </button>
        </div>
      </div>

      {activeTab === 'survey' ? (
        <Survey />
      ) : showGuide ? (
        <GuideScreen onStart={() => setShowGuide(false)} t={t} domains={DOMAINS} />
      ) : result ? (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800">{a.resultTitle}</h1>
            <button onClick={() => navigate('/analytics')} className="text-sm text-indigo-600 font-medium">
              {a.seeAdvice}
            </button>
          </div>
          <ResultScreen
            answers={result.answers}
            pointsEarned={earnInfo.pointsEarned}
            alreadyToday={earnInfo.alreadyToday}
            onShare={handleShare}
            t={t}
            domains={DOMAINS}
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
              <span>{a.stepOf.replace('{a}', step + 1).replace('{b}', DOMAINS.length)}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-1.5 mt-2.5">
              {DOMAINS.map((d, i) => (
                <div key={d.key} className={`flex-1 h-1 rounded-full transition-colors ${
                  i < step ? d.color : i === step ? `${d.color} opacity-70` : 'bg-slate-100'
                }`} />
              ))}
            </div>
          </div>

          {/* Domain header */}
          <div className={`${domain.light} border ${domain.border} rounded-2xl px-4 py-3 flex items-center gap-3 mb-5`}>
            <div className={`w-11 h-11 ${domain.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
              {domain.emoji}
            </div>
            <div>
              <p className="text-xs text-slate-400">{a.stepOf.replace('{a}', step + 1).replace('{b}', DOMAINS.length)}</p>
              <p className={`font-bold ${domain.text}`}>{domain.label}</p>
            </div>
          </div>

          {/* Scale legend */}
          <div className="bg-slate-50 rounded-xl px-3 py-2 mb-4">
            <div className="flex justify-between text-[10px] text-slate-400">
              {SCALE.map(s => (
                <span key={s.value} className="text-center w-1/5">{s.value}<br/>{s.label}</span>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {domain.questions.map(q => (
              <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-full ${domain.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {q.id}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed flex-1">{q.text}</p>
                </div>
                {q.reverse && (
                  <p className="text-[10px] text-orange-400 flex items-center gap-1 mb-2">
                    <AlertCircle size={10} /> {a.reverseWarn}
                  </p>
                )}
                <div className="flex gap-2">
                  {SCALE.map(s => {
                    const selected = answers[q.id] === s.value
                    return (
                      <button key={s.value} onClick={() => handleAnswer(q.id, s.value)}
                        className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                          selected ? `${domain.color} text-white shadow-md` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {s.value}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Reference */}
          {DOMAIN_REFS[domain.key] && (
            <div className={`${domain.light} border ${domain.border} rounded-xl px-3 py-2 flex items-start gap-1.5`}>
              <span className="text-[11px] flex-shrink-0 mt-0.5">📚</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-600">แหล่งอ้างอิง: </span>
                {DOMAIN_REFS[domain.key]}
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex gap-3 pb-safe md:static md:bottom-auto md:border-none md:bg-transparent md:mt-6 md:px-0 md:pb-0">
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0) }}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                <ChevronLeft size={18} /> {a.back}
              </button>
            )}
            <button onClick={handleNext} disabled={!allAnswered}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                allAnswered ? `${domain.color} text-white hover:opacity-90` : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {step === DOMAINS.length - 1 ? (
                <><Check size={18} /> {a.finishBtn}</>
              ) : (
                <>{a.next} <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
