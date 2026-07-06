import React, { useState, useEffect, useRef } from 'react'
import {
  Award, Star, Zap, Share2, Flame, Trophy,
  Lock, Gift, Check, X, Clock, RefreshCw, AlertCircle, Camera, XCircle, Image,
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { getUserLevel, getBadges } from '../utils/healthScore'
import { StickerChar } from '../components/CharDecor'
import ScoreRing from '../components/ScoreRing'
import { fetchRedemptions, fetchRewardCatalog, addSubmission } from '../services/userSync'
import ActivitySubmit from './ActivitySubmit'

const WORKOUT = [
  { id:'E01', pts:50,  color:'#fcd34d' },
  { id:'E02', pts:50,  color:'#fca5a5' },
  { id:'E03', pts:100, color:'#6ee7b7' },
  { id:'E04', pts:30,  color:'#7dd3fc' },
  { id:'E05', pts:100, color:'#93c5fd' },
  { id:'E06', pts:100, color:'#86efac' },
  { id:'E07', pts:50,  color:'#f9a8d4' },
  { id:'E08', pts:50,  color:'#fde68a' },
  { id:'E09', pts:50,  color:'#fcd34d' },
  { id:'E10', pts:50,  color:'#f9a8d4' },
  { id:'E11', pts:50,  color:'#d8b4fe' },
  { id:'E12', pts:100, color:'#fde68a' },
  { id:'E13', pts:100, color:'#86efac' },
  { id:'E14', pts:50,  color:'#d8b4fe' },
  { id:'E15', pts:100, color:'#fcd34d' },
  { id:'E16', pts:50,  color:'#fca5a5' },
  { id:'E17', pts:150, color:'#93c5fd' },
  { id:'E18', pts:200, color:'#fca5a5' },
  { id:'E19', pts:100, color:'#7dd3fc' },
  { id:'E20', pts:100, color:'#fcd34d' },
  { id:'E21', pts:150, color:'#fca5a5' },
]

function WorkoutChallenge({ user }) {
  const { t } = useLang()
  const wt = t.workout
  const ptsUnit = t.rewards.ptsUnit
  const fileRef = useRef(null)
  const storageKey = `workout_${user.id}`
  const [submitted, setSubmitted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })
  const [active, setActive]       = useState(null)
  const [photo, setPhoto]         = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [justDone, setJustDone]   = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const workouts = WORKOUT.map((w, i) => ({ ...w, label: wt.exerciseLabels[i] }))
  const allDone = submitted.length >= workouts.length

  function saveProgress(ids) {
    localStorage.setItem(storageKey, JSON.stringify(ids))
    setSubmitted(ids)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmitProof() {
    if (!photo) { setError(wt.noPhotoError); return }
    setError('')
    setSubmitting(true)
    try {
      await addSubmission({
        id: Date.now(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.faceImage,
        category: 'exercise',
        description: `[Workout ${active.id}] ${active.label}`,
        photo,
        challengeId: active.id,
        pointsValue: active.pts,
      })
      const next = [...submitted, active.id]
      saveProgress(next)
      setJustDone(active.id)
      setActive(null)
      setPhoto(null)
      setTimeout(() => setJustDone(null), 2500)
    } catch (e) {
      setError(e?.message || wt.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  const totalPts = workouts.filter(w => submitted.includes(w.id)).reduce((s, w) => s + w.pts, 0)

  return (
    <div className="space-y-4">
      {/* Hero Header */}
      <div className="rounded-3xl text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#f97316 0%,#ec4899 60%,#a855f7 100%)', minHeight: 140 }}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-6" />

        <StickerChar name="boy2" size={0.92} style={{ position:'absolute', left:0, bottom:0 }} />
        <StickerChar name="girl1e" size={0.92} flip style={{ position:'absolute', right:0, bottom:0 }} />

        <div className="relative flex flex-col items-center justify-center py-5 px-28 text-center">
          <div className="text-2xl font-black tracking-wide drop-shadow">Let's Workout! 🔥</div>
          <div className="text-white/85 text-xs mt-0.5 font-medium">{wt.completeSub}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-black">{submitted.length}</span>
            <span className="text-white/70 text-sm font-semibold">/ 21</span>
          </div>
          <div className="text-white/70 text-xs">{wt.thisPts} <span className="font-black text-white">+{totalPts}</span> {ptsUnit}</div>
        </div>

        <div className="mx-4 mb-4 h-3 bg-white/25 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700 relative"
            style={{ width: `${(submitted.length / 21) * 100}%` }}>
            {submitted.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 to-white/80 rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full rounded-2xl overflow-hidden border-2 border-orange-200 shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 flex items-center gap-2">
          <span className="text-white font-black text-sm">{wt.chartHeader}</span>
        </div>
        <img src="/workout-chart.png" alt="Let's Workout Chart" className="w-full h-auto" />
      </div>

      {/* All done */}
      {allDone && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-black text-green-700 text-lg">{wt.allDoneTitle}</p>
          <p className="text-sm text-green-600 mb-3">{wt.allDoneSub}</p>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)}
              className="bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 active:scale-95 transition-all flex items-center gap-2 mx-auto">
              <RefreshCw size={15} /> {wt.restartBtn}
            </button>
          ) : (
            <div className="flex gap-2 justify-center">
              <button onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">
                {wt.cancelBtn}
              </button>
              <button onClick={() => { saveProgress([]); setConfirmReset(false) }}
                className="px-5 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 active:scale-95 transition-all">
                {wt.confirmBtn}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Proof sent notification */}
      {justDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-emerald-700 text-sm font-semibold animate-bounce">
          <Check size={16} /> {wt.proofSent.replace('{id}', justDone)}
        </div>
      )}

      {/* Section title */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
        <span className="text-xs font-black text-orange-500 tracking-widest uppercase">{wt.selectLabel}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {workouts.map(w => {
          const done = submitted.includes(w.id)
          return (
            <button key={w.id}
              onClick={() => { if (!done && !allDone) { setActive(w); setPhoto(null); setError('') } }}
              disabled={done}
              className={`rounded-2xl p-2.5 text-left transition-all relative overflow-hidden ${
                done ? 'cursor-default' : 'hover:shadow-lg active:scale-95 cursor-pointer hover:-translate-y-0.5'
              }`}
              style={{
                background: done ? '#f8fafc' : `linear-gradient(135deg,${w.color}55,${w.color}22)`,
                border: `2px solid ${done ? '#e2e8f0' : w.color}`,
                boxShadow: done ? 'none' : `0 2px 8px ${w.color}55`,
              }}>
              <div className="text-[9px] font-black tracking-wider mb-0.5"
                style={{ color: done ? '#94a3b8' : '#7c3aed' }}>{w.id}</div>
              <div className="text-[10px] font-semibold leading-snug mb-1.5"
                style={{ color: done ? '#94a3b8' : '#334155' }}>{w.label}</div>
              <div className="text-[10px] font-black"
                style={{ color: done ? '#cbd5e1' : '#d97706' }}>
                ⭐ +{w.pts}
              </div>
              {done && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(240,253,244,0.85)' }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                      <Check size={18} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black text-emerald-600">{wt.sentLabel}</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer tip */}
      <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
        <img src="/kids-yoga.webp" alt="" className="h-12 object-contain flex-shrink-0" />
        <p className="text-xs text-orange-700 leading-relaxed font-medium">{wt.footerTip}</p>
      </div>

      {/* Proof modal */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black mb-1"
                  style={{ background: active.color + '60', color: '#374151' }}>{active.id}</span>
                <h3 className="font-bold text-slate-800 text-base leading-tight">{active.label}</h3>
                <p className="text-orange-500 font-black text-sm mt-0.5">{wt.ptsLabel.replace('{pts}', active.pts)}</p>
              </div>
              <button onClick={() => { setActive(null); setPhoto(null); setError('') }}
                className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0">
                <X size={22} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {wt.proofModalTitle} <span className="text-red-400">*</span>
              </label>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                onChange={handleFile} className="hidden" />
              {photo ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={photo} alt="proof" className="w-full max-h-52 object-cover rounded-2xl" />
                  <button onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white">
                    <XCircle size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-50 transition-all">
                  <Camera size={30} />
                  <span className="text-sm font-medium">{wt.takeOrChoose}</span>
                  <span className="text-xs">{wt.formats}</span>
                </button>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}

            <div className="flex gap-2">
              <button onClick={() => { setActive(null); setPhoto(null); setError('') }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                {wt.cancelBtn}
              </button>
              <button onClick={handleSubmitProof} disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[.98] transition-all"
                style={{ background: 'linear-gradient(135deg,#f97316,#ec4899)' }}>
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {wt.sendingBtn}</>
                  : <><Check size={16} /> {wt.sendProofBtn}</>}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">{wt.proofNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const STREAK_REQ = 7
const POINTS_REQ = 500

function getRedeemStatus(r) {
  return {
    pending:  { label: r.statusPending,  emoji: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    approved: { label: r.statusApproved, emoji: '✅', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    rejected: { label: r.statusRejected, emoji: '❌', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  }
}

function PointsCard({ points, level, progress, nextLevel, streak, r }) {
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl p-5 text-yellow-900 relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-6" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-yellow-800 text-sm font-medium">{r.accumulated}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">{points}</span>
              <span className="text-sm font-semibold text-yellow-800">{r.ptsUnit}</span>
            </div>
          </div>
          <div className="relative">
            <ScoreRing score={progress} size={80} strokeWidth={8} color="#92400E" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black">Lv.{level}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-yellow-800 mb-1">
            <span>{r.levelLabel} {level}</span>
            <span>{nextLevel} {r.ptsUnit} → {r.levelLabel} {level + 1}</span>
          </div>
          <div className="h-2.5 bg-yellow-300/50 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-900/40 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-red-600" />
            <span className="text-sm font-bold">Streak {streak} {r.streakUnit}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            streak >= STREAK_REQ ? 'bg-green-500/20 text-green-800' : 'bg-red-500/20 text-red-800'
          }`}>
            {streak >= STREAK_REQ ? '✅' : '🔒'} Streak {streak}/{STREAK_REQ}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            points >= POINTS_REQ ? 'bg-green-500/20 text-green-800' : 'bg-red-500/20 text-red-800'
          }`}>
            {points >= POINTS_REQ ? '✅' : '🔒'} {points}/{POINTS_REQ} {r.ptsUnit}
          </div>
        </div>
      </div>
    </div>
  )
}

function BadgeGrid({ badges, r }) {
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" /> {r.achievements}
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {badges.map(b => (
          <div key={b.id} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
            b.earned ? 'bg-yellow-50 border-yellow-300 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'
          }`}>
            <span className={`text-2xl mb-1 ${!b.earned ? 'grayscale' : ''}`}>{b.emoji}</span>
            <p className="text-xs font-semibold text-center text-slate-700 leading-tight">{b.name}</p>
            {!b.earned && <p className="text-[10px] text-slate-400 text-center mt-0.5 leading-tight">{b.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ShareCard({ user, score, points, r }) {
  const [shared, setShared] = useState(false)
  function handleShare() {
    const text = `🏥 สุขภาพของฉันวันนี้\n⭐ คะแนน: ${score || '?'}/100\n🏆 แต้ม: ${points} ${r.ptsUnit}\n🌟 ระดับ: ${getUserLevel(points).level}\n\nมาดูแลสุขภาพด้วยกันที่ HealthCheck!`
    if (navigator.share) navigator.share({ title: 'HealthCheck', text })
    else navigator.clipboard.writeText(text).then(() => { setShared(true); setTimeout(() => setShared(false), 2000) })
  }
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white">
      <p className="text-sm font-medium text-indigo-200 mb-1">{r.shareTitle}</p>
      <p className="text-base font-bold mb-4">{r.shareSub}</p>
      <button onClick={handleShare}
        className="w-full bg-white text-indigo-700 font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
        {shared ? <><Check size={16} /> {r.copied}</> : <><Share2 size={16} /> {r.shareHealth}</>}
      </button>
    </div>
  )
}

function HowToEarn({ r, isEn }) {
  const ways = isEn ? [
    { emoji: '📋', action: 'Health Assessment',   pts: '10–50', freq: 'per day' },
    { emoji: '📏', action: 'BMI Check',            pts: '15',    freq: 'per month' },
    { emoji: '🔥', action: `Streak 7 ${r.streakUnit}`, pts: '100', freq: 'bonus' },
    { emoji: '📸', action: r.sendPhoto,            pts: '5',     freq: 'per submission' },
  ] : [
    { emoji: '📋', action: 'ทำแบบประเมินสุขภาพ',              pts: '10–50', freq: 'ต่อวัน' },
    { emoji: '📏', action: 'วัดค่า BMI',                       pts: '15',    freq: 'ต่อเดือน' },
    { emoji: '🔥', action: `Streak 7 ${r.streakUnit} (ปลดล็อคแลกรางวัล)`, pts: '100', freq: 'โบนัส' },
    { emoji: '📸', action: `${r.sendPhoto} (Admin อนุมัติ)`,  pts: '5',     freq: 'ต่อครั้ง' },
  ]
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Zap size={18} className="text-yellow-500" /> {r.howToEarn}
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden">
        {ways.map((w, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < ways.length - 1 ? 'border-b border-slate-50' : ''}`}>
            <span className="text-xl w-8 text-center">{w.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{w.action}</p>
              <p className="text-xs text-slate-400">{w.freq}</p>
            </div>
            <span className="text-sm font-black text-yellow-600">+{w.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RewardCatalog({ user, onRedeem, r }) {
  const qualified = user.streak >= STREAK_REQ && user.points >= POINTS_REQ

  const [catalog, setCatalog]       = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError]     = useState(false)
  const [confirmItem, setConfirmItem] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [justRedeemed, setJustRedeemed] = useState(null)

  async function loadCatalog() {
    setCatalogLoading(true); setCatalogError(false)
    try {
      const items = await fetchRewardCatalog()
      setCatalog(shuffle(items.filter(i => i.active !== false)))
    } catch { setCatalogError(true) }
    finally { setCatalogLoading(false) }
  }

  useEffect(() => { loadCatalog() }, [])

  async function handleConfirm() {
    if (!confirmItem) return
    setSubmitting(true); setError('')
    try {
      await onRedeem(confirmItem)
      setJustRedeemed(confirmItem.name)
      setConfirmItem(null)
      setTimeout(() => setJustRedeemed(null), 4000)
    } catch (e) {
      setError(e.message || r.loadError)
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Gift size={18} className="text-pink-500" /> {r.catalogTitle}
        </h2>
        <button onClick={loadCatalog} disabled={catalogLoading}
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
          <RefreshCw size={13} className={catalogLoading ? 'animate-spin' : ''} /> {r.shuffle}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        {[
          { ok: user.streak >= STREAK_REQ, label: `Streak ${user.streak}/${STREAK_REQ} ${r.streakUnit}` },
          { ok: user.points >= POINTS_REQ, label: `${user.points}/${POINTS_REQ} ${r.ptsUnit}` },
        ].map(({ ok, label }) => (
          <div key={label} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border ${
            ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {ok ? <Check size={13} /> : <Lock size={13} />} {label}
          </div>
        ))}
      </div>

      {!qualified && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 mb-3 flex items-start gap-3">
          <Lock size={17} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500 leading-relaxed">
            {r.lockMsg.replace('{streak}', STREAK_REQ).replace('{pts}', POINTS_REQ)}
          </p>
        </div>
      )}

      {justRedeemed && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <Check size={16} /> {r.redeemed.replace('{name}', justRedeemed)}
        </div>
      )}

      {catalogLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : catalogError ? (
        <div className="text-center py-10 text-slate-400 space-y-2">
          <p className="text-sm">{r.loadError}</p>
          <button onClick={loadCatalog} className="text-xs text-indigo-500 underline">{r.retryLoad}</button>
        </div>
      ) : catalog.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Gift size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">{r.noRewards}</p>
          <p className="text-xs mt-1">{r.noRewardsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {catalog.map(item => {
            const canAfford = user.points >= item.cost
            const canRedeem = qualified && canAfford
            return (
              <div key={item.id} className={`bg-white rounded-2xl border-2 p-3.5 transition-all ${
                canRedeem ? 'border-yellow-200 shadow-sm' : 'border-slate-100 opacity-70'
              }`}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="font-bold text-slate-800 text-sm leading-tight">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-2 leading-tight line-clamp-2">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black flex items-center gap-1 ${canAfford ? 'text-yellow-600' : 'text-red-500'}`}>
                    <Star size={12} className={canAfford ? 'fill-yellow-400 text-yellow-400' : 'text-red-400'} />
                    {item.cost.toLocaleString()}
                  </span>
                  <button
                    onClick={() => { setError(''); setConfirmItem(item) }}
                    disabled={!canRedeem}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      canRedeem
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canRedeem ? r.redeemBtn : <Lock size={12} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="text-center">
              <span className="text-5xl">{confirmItem.emoji}</span>
              <h3 className="font-bold text-slate-800 text-lg mt-2">{confirmItem.name}</h3>
              <p className="text-slate-400 text-sm">{confirmItem.desc}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
              <p className="text-sm text-yellow-700">{r.usePoints} <span className="font-black text-base">{confirmItem.cost.toLocaleString()}</span> {r.ptsUnit}</p>
              <p className="text-xs text-yellow-600 mt-0.5">{r.remainingPts} {(user.points - confirmItem.cost).toLocaleString()} {r.ptsUnit}</p>
            </div>
            <p className="text-xs text-slate-400 text-center leading-relaxed">{r.adminApproveNote}</p>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setConfirmItem(null); setError('') }} disabled={submitting}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50">
                {r.cancel}
              </button>
              <button onClick={handleConfirm} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-900 rounded-full animate-spin" /> {r.sending}</>
                  : <><Gift size={15} /> {r.confirmRedeem}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RedemptionHistory({ userId, claimRefunds, r }) {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [refundMsg, setRefundMsg] = useState('')

  const REDEEM_STATUS = getRedeemStatus(r)

  async function load() {
    setLoading(true)
    try {
      const all = await fetchRedemptions()
      setItems(all.filter(x => x.userId === userId).reverse())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const pendingRefunds = items.filter(x => x.status === 'rejected' && x.refundPending && !x.refundClaimed)

  async function handleClaimRefunds() {
    setClaiming(true)
    try {
      const pts = await claimRefunds()
      if (pts > 0) {
        setRefundMsg(r.refundReceived.replace('{n}', pts))
        setTimeout(() => setRefundMsg(''), 4000)
        await load()
      }
    } finally { setClaiming(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock size={18} className="text-indigo-500" /> {r.historyTitle}
        </h2>
        <button onClick={load} disabled={loading} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {r.refresh}
        </button>
      </div>

      {pendingRefunds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-3 flex items-center gap-3">
          <span className="text-xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-700">
              {r.pendingRefundMsg.replace('{n}', pendingRefunds.reduce((s, x) => s + x.pointsCost, 0))}
            </p>
            <p className="text-xs text-orange-500">{r.fromRejected}</p>
          </div>
          <button onClick={handleClaimRefunds} disabled={claiming}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">
            {claiming ? '...' : r.claimRefund}
          </button>
        </div>
      )}

      {refundMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-3 text-sm text-green-700 font-medium flex items-center gap-2">
          <Check size={15} /> {refundMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Gift size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">{r.noHistory}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const st = REDEEM_STATUS[item.status] || REDEEM_STATUS.pending
            return (
              <div key={item.id} className={`${st.bg} border ${st.border} rounded-2xl p-3.5 flex gap-3 items-start`}>
                <span className="text-2xl flex-shrink-0">{item.rewardEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{item.rewardName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(item.requestedAt).toLocaleDateString(r.streakUnit === 'days' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs font-semibold ${st.text}`}>{st.emoji} {st.label}</span>
                    <span className="text-xs text-slate-400">-{item.pointsCost} {r.ptsUnit}</span>
                    {item.status === 'rejected' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        item.refundClaimed ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {item.refundClaimed ? r.refundClaimed : r.refundPending}
                      </span>
                    )}
                  </div>
                  {item.adminNote && (
                    <p className="text-xs text-slate-500 mt-1 bg-white/60 rounded-lg px-2 py-1">
                      💬 {item.adminNote}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Rewards() {
  const { user, latestAssessment, bmiData, redeemReward, claimRefunds } = useHealth()
  const { t } = useLang()
  const r = t.rewards
  const { level, progress, nextLevel } = getUserLevel(user.points)
  const badges = getBadges(user, latestAssessment, bmiData)
  const [mainTab, setMainTab] = useState('rewards')
  const [tab, setTab] = useState('rewards')

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setMainTab('rewards')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              mainTab === 'rewards' ? 'bg-white text-yellow-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award size={13} /> {r.tabRewards}
          </button>
          <button
            onClick={() => setMainTab('workout')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              mainTab === 'workout' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🏋️ Workout
          </button>
          <button
            onClick={() => setMainTab('activity')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              mainTab === 'activity' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera size={13} /> {r.tabActivity}
          </button>
        </div>
      </div>

      {mainTab === 'activity' ? (
        <ActivitySubmit />
      ) : mainTab === 'workout' ? (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
          <WorkoutChallenge user={user} />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">
          <PointsCard points={user.points} level={level} progress={progress} nextLevel={nextLevel} streak={user.streak} r={r} />

          <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
            {[
              { key: 'rewards', label: r.innerRedeem },
              { key: 'history', label: r.innerHistory },
              { key: 'badges',  label: r.innerBadges },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'rewards' && (
            <>
              <RewardCatalog user={user} onRedeem={redeemReward} r={r} />
              <ShareCard user={user} score={latestAssessment?.overallScore} points={user.points} r={r} />
              <HowToEarn r={r} isEn={r.ptsUnit === 'pts'} />
            </>
          )}
          {tab === 'history' && <RedemptionHistory userId={user.id} claimRefunds={claimRefunds} r={r} />}
          {tab === 'badges'  && <BadgeGrid badges={badges} r={r} />}
        </div>
      )}
    </>
  )
}
