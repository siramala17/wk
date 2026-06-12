import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, AlertCircle, ClipboardList, Scale } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import ScoreRing from '../components/ScoreRing'
import BMI from './BMI'

// Language-neutral domain config (colors, emojis, question IDs)
const DOMAIN_CONFIG = [
  { key: 'sleep',    emoji: '🌙', color: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    ring: '#3B82F6',  qIds: [1,2,3,4],    reverses: [false,false,false,true]  },
  { key: 'water',    emoji: '💧', color: 'bg-cyan-500',    light: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200',    ring: '#06B6D4',  qIds: [5,6,7,8],    reverses: [false,false,true,true]   },
  { key: 'exercise', emoji: '🏃', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: '#10B981',  qIds: [9,10,11,12], reverses: [false,false,false,true]  },
  { key: 'digital',  emoji: '📱', color: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200',  ring: '#8B5CF6',  qIds: [13,14,15,16],reverses: [true,true,false,true]   },
  { key: 'stress',   emoji: '🧘', color: 'bg-yellow-500',  light: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200',  ring: '#F59E0B',  qIds: [17,18,19,20],reverses: [true,true,false,true]   },
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
  return domains.reduce((s, d) => s + d.questions.reduce((ds, q) => ds + applyScore(answers[q.id] ?? 3, q.reverse), 0), 0)
}

function getLevel(total, t) {
  const a = t.assessment
  if (total >= 81) return { label: a.levelExcellent, emoji: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: '#10B981', desc: a.levelExcellentDesc }
  if (total >= 51) return { label: a.levelFair,      emoji: '😊', color: 'text-yellow-600',  bg: 'bg-yellow-50',  ring: '#F59E0B', desc: a.levelFairDesc }
  return               { label: a.levelPoor,          emoji: '⚠️', color: 'text-red-600',    bg: 'bg-red-50',    ring: '#EF4444', desc: a.levelPoorDesc }
}

function ResultScreen({ answers, pointsEarned, alreadyToday, onShare, t, domains }) {
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
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-2xl font-extrabold text-blue-700">{a.guideTitle}</h1>
        <p className="text-slate-500 text-sm mt-1">{a.guideSub}</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
        <p className="font-bold text-blue-700 text-sm">{a.guideHow}</p>
        <p className="text-slate-600 text-sm leading-relaxed">{a.guideInstr}</p>
        <div className="grid grid-cols-5 gap-1 pt-1">
          {a.scale.map((label, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center mx-auto text-sm font-bold text-blue-600">{i + 1}</div>
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
        className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-md shadow-blue-200 transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
        {a.guideStart}
      </button>
    </div>
  )
}

export default function Assessment() {
  const [mainTab, setMainTab] = useState('assessment')
  const [showGuide, setShowGuide] = useState(true)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [earnInfo, setEarnInfo] = useState({ pointsEarned: 0, alreadyToday: false })
  const { saveAssessment } = useHealth()
  const { t, lang } = useLang()
  const navigate = useNavigate()

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
      const sleepScore    = calcDomainScore(answers, DOMAINS[0])
      const waterScore    = calcDomainScore(answers, DOMAINS[1])
      const exerciseScore = calcDomainScore(answers, DOMAINS[2])
      const digitalScore  = calcDomainScore(answers, DOMAINS[3])
      const stressScore   = calcDomainScore(answers, DOMAINS[4])
      const overallScore  = calcTotal(answers, DOMAINS)
      const assessment    = { sleepScore, waterScore, exerciseScore, digitalScore, stressScore, overallScore, answers }
      const info = saveAssessment(assessment)
      setEarnInfo(info)
      setResult(assessment)
      window.scrollTo(0, 0)
    }
  }

  function handleShare() {
    const total = calcTotal(answers, DOMAINS)
    const level = getLevel(total, t)
    const text = lang === 'en'
      ? `🏥 My Health Assessment\n${level.emoji} Total: ${total}/100 — ${level.label}\n🌙 Sleep: ${calcDomainScore(answers, DOMAINS[0])}\n💧 Hydration: ${calcDomainScore(answers, DOMAINS[1])}\n🏃 Exercise: ${calcDomainScore(answers, DOMAINS[2])}\n📱 Digital Media: ${calcDomainScore(answers, DOMAINS[3])}\n🧘 Stress: ${calcDomainScore(answers, DOMAINS[4])}`
      : `🏥 ผลประเมินพฤติกรรมสุขภาพของฉัน\n${level.emoji} คะแนนรวม: ${total}/100 — ${level.label}\n🌙 การนอนหลับ: ${calcDomainScore(answers, DOMAINS[0])}\n💧 การดื่มน้ำ: ${calcDomainScore(answers, DOMAINS[1])}\n🏃 การออกกำลังกาย: ${calcDomainScore(answers, DOMAINS[2])}\n📱 สื่อดิจิทัล: ${calcDomainScore(answers, DOMAINS[3])}\n🧘 ความเครียด: ${calcDomainScore(answers, DOMAINS[4])}`
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
            onClick={() => setMainTab('assessment')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mainTab === 'assessment' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList size={15} />
            {a.tabAssess}
          </button>
          <button
            onClick={() => setMainTab('bmi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mainTab === 'bmi' ? 'bg-white text-yellow-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Scale size={15} />
            {a.tabBmi}
          </button>
        </div>
      </div>

      {mainTab === 'bmi' ? (
        <BMI />
      ) : showGuide ? (
        <GuideScreen onStart={() => setShowGuide(false)} t={t} domains={DOMAINS} />
      ) : result ? (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800">{a.resultTitle}</h1>
            <button onClick={() => navigate('/analytics')} className="text-sm text-blue-600 font-medium">
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
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
