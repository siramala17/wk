import React, { useState, useRef, useEffect } from 'react'
import { Send, Check, XCircle, RefreshCw, Image, Star } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { addSubmission, fetchSubmissions } from '../services/userSync'

const CATEGORIES = [
  { value: 'exercise', label: 'ออกกำลังกาย', emoji: '🏃' },
  { value: 'food', label: 'อาหารสุขภาพ', emoji: '🥗' },
  { value: 'water', label: 'ดื่มน้ำเพียงพอ', emoji: '💧' },
  { value: 'sleep', label: 'นอนหลับพักผ่อน', emoji: '🌙' },
  { value: 'stress', label: 'จัดการความเครียด', emoji: '🧘' },
  { value: 'other', label: 'กิจกรรมอื่น ๆ', emoji: '⭐' },
]

const STATUS_CONFIG = {
  pending:  { label: 'รอตรวจสอบ',  emoji: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { label: 'อนุมัติแล้ว', emoji: '✅', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  rejected: { label: 'ไม่ผ่าน',    emoji: '❌', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
}

export default function ActivitySubmit() {
  const { user, claimActivityPoints } = useHealth()
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

  // ดึงแต้มที่รอรับเมื่อเข้าหน้านี้
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
    if (!category) { setError('กรุณาเลือกประเภทกิจกรรม'); return }
    if (!photo)    { setError('กรุณาแนบภาพกิจกรรม'); return }
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
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">

      {/* แต้มที่เพิ่งได้รับ */}
      {claimedPts > 0 && (
        <div className="bg-yellow-400 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4 shadow-lg animate-bounce">
          <Star size={24} className="text-yellow-900 fill-yellow-700 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-900">ได้รับแต้มใหม่ +{claimedPts} แต้ม!</p>
            <p className="text-yellow-800 text-xs">Admin อนุมัติภาพกิจกรรมของคุณแล้ว</p>
          </div>
        </div>
      )}

      {/* กำลังตรวจสอบแต้ม */}
      {claiming && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
          กำลังตรวจสอบแต้มที่รอรับ...
        </div>
      )}

      {/* header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-5 text-white mb-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📸</div>
          <div>
            <h1 className="font-bold text-lg">ส่งภาพกิจกรรม</h1>
            <p className="text-blue-100 text-xs mt-0.5">1 ภาพ = 5 แต้ม เมื่อ Admin อนุมัติ</p>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
        {[['submit','ส่งภาพใหม่'],['history','ประวัติของฉัน']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}>{l}</button>
        ))}
      </div>

      {/* ── TAB: ส่งภาพ ── */}
      {tab === 'submit' && (
        <div className="space-y-4">

          {/* เลือกประเภท */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภทกิจกรรม <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => { setCategory(c.value); setError('') }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 text-xs font-semibold transition-all active:scale-95 ${
                    category === c.value
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
                  <span className="text-2xl">{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* คำอธิบาย */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">คำอธิบาย (ไม่บังคับ)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="เช่น วันนี้วิ่ง 30 นาที รอบสนามโรงเรียน..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 text-sm placeholder-slate-400 resize-none"
            />
          </div>

          {/* แนบภาพ */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">ภาพหลักฐาน <span className="text-red-400">*</span></label>
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
                className="w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50 transition-all">
                <Image size={32} />
                <span className="text-sm font-medium">กดเพื่อเลือกหรือถ่ายภาพ</span>
                <span className="text-xs">รองรับ JPG, PNG</span>
              </button>
            )}
          </div>

          {/* error */}
          {error && <p className="text-red-500 text-sm flex items-center gap-1.5">⚠️ {error}</p>}

          {/* ส่ง / success */}
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 flex items-center gap-3">
              <Check size={22} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-700">ส่งภาพสำเร็จ!</p>
                <p className="text-xs text-green-500">รอ Admin ตรวจสอบและยืนยัน</p>
              </div>
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังส่ง...</>
                : <><Send size={16} /> ส่งภาพให้ Admin ตรวจสอบ</>}
            </button>
          )}
        </div>
      )}

      {/* ── TAB: ประวัติ ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">ภาพที่ส่งทั้งหมด {mySubmissions.length} รายการ</p>
            <button onClick={loadHistory} disabled={loadingHistory}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} /> รีเฟรช
            </button>
          </div>

          {loadingHistory && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingHistory && mySubmissions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Image size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">ยังไม่มีภาพที่ส่ง</p>
            </div>
          )}

          {!loadingHistory && mySubmissions.map(s => {
            const cat = CATEGORIES.find(c => c.value === s.category)
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
                          ⭐ +{s.pointsValue || 5} แต้ม{s.pointsClaimed ? ' (รับแล้ว)' : ' (รอรับ)'}
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
