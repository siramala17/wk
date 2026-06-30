import React, { useState, useRef, useEffect } from 'react'
import { Send, Check, XCircle, RefreshCw, Image, Star } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { addSubmission, fetchSubmissions } from '../services/userSync'

export default function ActivitySubmit() {
  const { user, claimActivityPoints } = useHealth()
  const { t } = useLang()
  const ac = t.activity
  const fileRef = useRef(null)
  const [tab, setTab] = useState('submit')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [mySubmissions, setMySubmissions] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [claimedPts, setClaimedPts] = useState(0)
  const [claiming, setClaiming] = useState(false)

  const STATUS_CONFIG = {
    pending:  { label: ac.statusPending,  emoji: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    approved: { label: ac.statusApproved, emoji: '✅', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    rejected: { label: ac.statusRejected, emoji: '❌', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  }

  useEffect(() => {
    async function checkPoints() {
      setClaiming(true)
      const pts = await claimActivityPoints()
      if (pts > 0) setClaimedPts(pts)
      setClaiming(false)
    }
    checkPoints()
  }, [])

  useEffect(() => {
    if (tab === 'history') loadHistory()
  }, [tab])

  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const all = await fetchSubmissions()
      setMySubmissions(all.filter(s => s.userId === user.id).reverse())
    } catch { /* silent */ }
    finally { setLoadingHistory(false) }
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!category) { setError(ac.noCatError); return }
    if (!photo)    { setError(ac.noPhotoError); return }
    setError('')
    setSubmitting(true)
    try {
      await addSubmission({
        id: Date.now(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.faceImage,
        category,
        description: description.trim(),
        photo,
      })
      setSubmitted(true)
      setCategory('')
      setDescription('')
      setPhoto(null)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (e) {
      setError(e?.message || ac.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">

      {claimedPts > 0 && (
        <div className="bg-yellow-400 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4 shadow-lg animate-bounce">
          <Star size={24} className="text-yellow-900 fill-yellow-700 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-900">{ac.claimedPts.replace('{n}', claimedPts)}</p>
            <p className="text-yellow-800 text-xs">{ac.claimedSub}</p>
          </div>
        </div>
      )}

      {claiming && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
          {ac.checkingPts}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-5 text-white mb-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📸</div>
          <div>
            <h1 className="font-bold text-lg">{ac.headerTitle}</h1>
            <p className="text-indigo-100 text-xs mt-0.5">{ac.headerSub}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
        {[['submit', ac.tabSubmit], ['history', ac.tabHistory]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}>{label}</button>
        ))}
      </div>

      {/* ── TAB: Submit ── */}
      {tab === 'submit' && (
        <div className="space-y-4">

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {ac.catLabel} <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ac.categories.map(c => (
                <button key={c.value} onClick={() => { setCategory(c.value); setError('') }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 text-xs font-semibold transition-all active:scale-95 ${
                    category === c.value
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
                  <span className="text-2xl">{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{ac.descLabel}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={ac.descHint}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-sm placeholder-slate-400 resize-none"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {ac.photoLabel} <span className="text-red-400">*</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={handleFile} className="hidden" />
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={photo} alt="activity" className="w-full max-h-64 object-cover rounded-2xl" />
                <button onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-400 hover:bg-indigo-50 transition-all">
                <Image size={32} />
                <span className="text-sm font-medium">{ac.takeOrPick}</span>
                <span className="text-xs">{ac.formats}</span>
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm flex items-center gap-1.5">⚠️ {error}</p>}

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 flex items-center gap-3">
              <Check size={22} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-700">{ac.successTitle}</p>
                <p className="text-xs text-green-500">{ac.successSub}</p>
              </div>
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {ac.sendingBtn}</>
                : <><Send size={16} /> {ac.sendBtn}</>}
            </button>
          )}
        </div>
      )}

      {/* ── TAB: History ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{ac.historyCount.replace('{n}', mySubmissions.length)}</p>
            <button onClick={loadHistory} disabled={loadingHistory}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
              <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} /> {ac.refresh}
            </button>
          </div>

          {loadingHistory && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingHistory && mySubmissions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Image size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{ac.noHistory}</p>
            </div>
          )}

          {!loadingHistory && mySubmissions.map(s => {
            const cat = ac.categories.find(c => c.value === s.category)
            const st = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending
            return (
              <div key={s.id} className={`${st.bg} border ${st.border} rounded-2xl overflow-hidden`}>
                <div className="flex gap-3 p-3">
                  {s.photo && (
                    <img src={s.photo} alt="activity" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{cat?.emoji}</span>
                      <span className="text-sm font-semibold text-slate-800 truncate">{cat?.label}</span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-1">{s.description}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {new Date(s.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs font-semibold ${st.text} flex items-center gap-0.5`}>
                        {st.emoji} {st.label}
                      </span>
                      {s.status === 'approved' && (
                        <span className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                          s.pointsClaimed
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          ⭐ {s.pointsClaimed
                            ? ac.ptsClaimed.replace('{n}', s.pointsValue || 5)
                            : ac.ptsWaiting.replace('{n}', s.pointsValue || 5)}
                        </span>
                      )}
                    </div>
                    {s.adminNote && (
                      <p className="text-xs text-slate-600 mt-1 bg-white/60 rounded-lg px-2 py-1">
                        💬 {s.adminNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
