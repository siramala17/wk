import React, { useState } from 'react'
import { Star, ChevronRight, ChevronLeft, Check, Send, RotateCcw } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { submitSurvey } from '../services/userSync'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const display = hover || value
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform active:scale-90"
        >
          <Star
            size={36}
            className={`transition-colors ${
              n <= display
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

const TOTAL_STEPS = 3

export default function Survey() {
  const { user } = useHealth()
  const { t } = useLang()
  const sv = t.survey

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [ratings, setRatings] = useState({ overall: 0, easeOfUse: 0, design: 0, usefulness: 0 })
  const [favorites, setFavorites] = useState([])
  const [suggestion, setSuggestion] = useState('')
  const [comment, setComment]       = useState('')

  function setRating(key, val) {
    setRatings(p => ({ ...p, [key]: val }))
  }

  function toggleFeature(val) {
    setFavorites(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val])
  }

  function validateStep1() {
    const missing = sv.ratings.find(r => !ratings[r.key])
    if (missing) { setError(sv.rateError.replace('{label}', missing.label)); return false }
    setError('')
    return true
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return
    setError('')
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      await submitSurvey({
        id: Date.now(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim(),
        userRole: user.role || '',
        gradeLevel: user.gradeLevel || '',
        ratings,
        favorites,
        suggestion: suggestion.trim(),
        comment: comment.trim(),
        submittedAt: new Date().toISOString(),
      })
      setSubmitted(true)
      setStep(3)
    } catch {
      setError(sv.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep(1)
    setSubmitted(false)
    setRatings({ overall: 0, easeOfUse: 0, design: 0, usefulness: 0 })
    setFavorites([])
    setSuggestion('')
    setComment('')
    setError('')
  }

  const avgScore = Object.values(ratings).every(Boolean)
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            📝
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-tight">{sv.title}</h1>
            <p className="text-indigo-200 text-sm mt-0.5">{sv.subtitle}</p>
          </div>
        </div>

        {step < 3 && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
              <span>{sv.stepOf.replace('{step}', step).replace('{total}', TOTAL_STEPS - 1)}</span>
              <span>{sv.stepLabels[step - 1]}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Step 1: Star ratings ── */}
      {step === 1 && (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
          <h2 className="font-bold text-slate-800 text-lg">{sv.rateTitle}</h2>

          {sv.ratings.map(({ key, label, emoji }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">{label}</p>
                  {ratings[key] > 0 && (
                    <p className="text-xs text-yellow-600 font-medium">{sv.scoreLabels[ratings[key]]}</p>
                  )}
                </div>
              </div>
              <StarRating value={ratings[key]} onChange={v => setRating(key, v)} />
            </div>
          ))}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">⚠️ {error}</p>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            {sv.nextBtn} <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Step 2: Features + text ── */}
      {step === 2 && (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-slate-800 text-lg">{sv.opinionTitle}</h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              {sv.featuresLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sv.features.map(f => {
                const active = favorites.includes(f.value)
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => toggleFeature(f.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 text-left ${
                      active
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{f.emoji}</span>
                    <span className="leading-tight">{f.label}</span>
                    {active && <Check size={14} className="ml-auto flex-shrink-0 text-indigo-500" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {sv.suggestionLabel}
            </label>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder={sv.suggestionHint}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-sm placeholder-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {sv.commentLabel}
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={sv.commentHint}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-sm placeholder-slate-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">⚠️ {error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} /> {sv.backBtn}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {sv.sendingBtn}</>
                : <><Send size={16} /> {sv.submitBtn}</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Thank you ── */}
      {step === 3 && submitted && (
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={40} className="text-green-600" strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">{sv.thankTitle}</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{sv.thankDesc}</p>
          </div>

          {avgScore && (
            <div className="bg-yellow-50 rounded-2xl p-4 inline-block mx-auto">
              <p className="text-slate-500 text-xs mb-1">{sv.avgLabel}</p>
              <div className="flex items-center gap-1 justify-center">
                <Star size={22} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-extrabold text-slate-800">{avgScore}</span>
                <span className="text-slate-400 text-sm">/ 5</span>
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="flex items-center gap-2 mx-auto text-sm text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <RotateCcw size={14} /> {sv.redoBtn}
          </button>
        </div>
      )}
    </div>
  )
}
