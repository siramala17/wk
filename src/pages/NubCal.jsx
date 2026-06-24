import React, { useState, useRef, useMemo, useEffect } from 'react'
import { Camera, X, Trash2, Plus, Edit3, BookOpen, Search, Settings } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { FOOD_DB, FOOD_CATS as CATS } from '../data/foodDb'

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''

const TODAY = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
const BLANK = { foodName: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' }
const GLASS_ML = 250

const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'ไม่ค่อยออกกำลังกาย',   desc: 'งานนั่งโต๊ะ กิจกรรมน้อยมาก',        factor: 1.2   },
  { key: 'light',       label: 'กิจกรรมเบา',            desc: 'ออกกำลังกาย 1–3 วัน/สัปดาห์',       factor: 1.375 },
  { key: 'moderate',    label: 'กิจกรรมปานกลาง',        desc: 'ออกกำลังกาย 3–5 วัน/สัปดาห์',       factor: 1.55  },
  { key: 'active',      label: 'กิจกรรมมาก',            desc: 'ออกกำลังกาย 6–7 วัน/สัปดาห์',       factor: 1.725 },
  { key: 'very_active', label: 'กิจกรรมหนักมาก',        desc: 'งานใช้แรงหนัก / นักกีฬา',            factor: 1.9   },
]

function calcTDEE(weight, height, age, gender, activityKey) {
  const bmr = (gender === 'ชาย' || gender === 'male')
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161
  const factor = ACTIVITY_LEVELS.find(a => a.key === activityKey)?.factor ?? 1.375
  return Math.round(bmr * factor)
}

function calcBMR(weight, height, age, gender) {
  if (!weight || !height || !age) return null
  return Math.round(
    (gender === 'ชาย' || gender === 'male')
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
  )
}

function compressImage(dataUrl, maxSize = 200) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

const DAY_TH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อ']

function getWeekDates(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const mon = new Date(d)
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon)
    dt.setDate(mon.getDate() + i)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const dy = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${dy}`
  })
}

function WeekRing({ pct, size = 38, selected }) {
  const r = (size - 5) / 2
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={selected ? '#ccfbf1' : '#f3f4f6'} strokeWidth="3.5" />
      {pct > 0 && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0d9488" strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      )}
    </svg>
  )
}

function SummaryRing({ consumed, goal, remaining2Label }) {
  const size = 180
  const r = 68
  const circ = 2 * Math.PI * r
  const pct = Math.min(consumed / Math.max(goal, 1), 1)
  const dash = pct * circ
  const stroke = pct >= 1 ? '#ef4444' : '#0d9488'
  const remaining = Math.max(goal - consumed, 0)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] text-gray-400 tracking-wide uppercase">{remaining2Label}</p>
        <p className="text-3xl font-black text-gray-900 leading-none mt-0.5">{remaining.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-0.5">kcal</p>
      </div>
    </div>
  )
}

// ── Intermittent Fasting ─────────────────────────────────────
const IF_PROTOCOLS = [
  { hours: 12, label: '12:12', fastH: 12, feedH: 12, name: 'Circadian Rhythm', desc: 'เหมาะสำหรับผู้เริ่มต้น',   color: '#10b981', benefit: 'ปรับนาฬิกาชีวิต ลดน้ำตาลในเลือด' },
  { hours: 16, label: '16:8',  fastH: 16, feedH: 8,  name: '16:8 Fast',        desc: 'ยอดนิยมที่สุด',           color: '#f97316', benefit: 'เผาผลาญไขมัน ลดน้ำหนักได้ดี' },
  { hours: 18, label: '18:6',  fastH: 18, feedH: 6,  name: '18:6 Fast',        desc: 'ระดับกลาง',               color: '#ef4444', benefit: 'เพิ่มประสิทธิภาพการเผาผลาญ' },
  { hours: 20, label: '20:4',  fastH: 20, feedH: 4,  name: 'Warrior Diet',     desc: 'ระดับสูง',                color: '#7c3aed', benefit: 'Autophagy สูง ล้างเซลล์เก่า' },
]

function IFTimer() {
  const [protocol, setProtocol] = useState(() => {
    const saved = Number(localStorage.getItem('if_protocol'))
    return IF_PROTOCOLS.find(p => p.hours === saved) || IF_PROTOCOLS[1]
  })
  const [startTime, setStartTime] = useState(() => {
    const s = localStorage.getItem('if_start')
    return s && localStorage.getItem('if_active') === 'true' ? Number(s) : null
  })
  const [now, setNow]             = useState(Date.now())
  const [showGuide, setShowGuide] = useState(false)
  const prevInFastRef             = useRef(null)

  const isActive = !!startTime

  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isActive])

  const elapsed   = isActive ? Math.max(0, Math.floor((now - startTime) / 1000)) : 0
  const fastSecs  = protocol.fastH * 3600
  const cycleSecs = (protocol.fastH + protocol.feedH) * 3600
  const phase     = elapsed % cycleSecs
  const inFast    = phase < fastSecs

  // fire notification when fasting period ends
  useEffect(() => {
    if (!isActive) { prevInFastRef.current = null; return }
    if (prevInFastRef.current === null) { prevInFastRef.current = inFast; return }
    if (prevInFastRef.current === true && inFast === false) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 อดอาหารครบแล้ว!', {
          body: `ยินดีด้วย! คุณอดอาหารครบ ${protocol.fastH} ชั่วโมงแล้ว ถึงเวลากินอาหารได้เลย! 🍽️`,
          icon: '/icons/icon-192.png',
        })
      }
    }
    prevInFastRef.current = inFast
  }, [inFast, isActive, protocol.fastH])

  async function start() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    const t = Date.now()
    setStartTime(t)
    setNow(t)
    localStorage.setItem('if_start',    String(t))
    localStorage.setItem('if_active',   'true')
    localStorage.setItem('if_protocol', String(protocol.hours))
  }
  function stop() {
    setStartTime(null)
    localStorage.removeItem('if_start')
    localStorage.setItem('if_active', 'false')
  }
  function changeProtocol(p) {
    setProtocol(p)
    localStorage.setItem('if_protocol', String(p.hours))
    stop()
  }

  const remaining  = inFast ? fastSecs - phase : cycleSecs - phase
  const pct        = isActive ? (inFast ? phase / fastSecs : (phase - fastSecs) / (protocol.feedH * 3600)) : 0

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const elapsedH = Math.floor(elapsed / 3600)
  const elapsedM = Math.floor((elapsed % 3600) / 60)
  const R = 88, C = 2 * Math.PI * R

  const phaseLabel = !isActive ? 'พร้อมเริ่ม' : inFast ? (elapsedH >= 12 ? 'FAT BURN 🔥' : 'FASTING') : 'FEEDING 🍽️'
  const ringColor  = isActive ? (inFast ? protocol.color : '#10b981') : '#e2e8f0'

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-base">⏱️</span>
          <span className="font-semibold text-gray-900 text-sm">Intermittent Fasting</span>
        </div>
        <button onClick={() => setShowGuide(p => !p)} className="text-xs text-indigo-500 font-semibold">
          {showGuide ? 'ซ่อนคำแนะนำ' : '📋 คำแนะนำ IF'}
        </button>
      </div>

      {/* Protocol selector */}
      <div className="px-4 pt-4 grid grid-cols-4 gap-2">
        {IF_PROTOCOLS.map(p => (
          <button key={p.hours} onClick={() => changeProtocol(p)}
            className="py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={protocol.hours === p.hours
              ? { backgroundColor: p.color, color: '#fff', boxShadow: `0 4px 12px ${p.color}55` }
              : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Ring timer */}
      <div className="flex flex-col items-center py-5 px-4">
        <div className="relative" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#f1f5f9" strokeWidth="14" />
            <circle cx="100" cy="100" r={R} fill="none" stroke={ringColor} strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${pct * C} ${C}`} />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#f8fafc" strokeWidth="8" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl leading-none mb-1">🔥</span>
            <span className="text-xl font-black text-gray-900 font-mono tracking-tight leading-none">
              {isActive ? fmt(remaining) : `${String(protocol.fastH).padStart(2,'0')}:00:00`}
            </span>
            <span className="text-[10px] font-bold tracking-widest mt-1 uppercase"
              style={{ color: ringColor === '#e2e8f0' ? '#94a3b8' : ringColor }}>
              {phaseLabel}
            </span>
          </div>
        </div>

        {isActive && (
          <div className="flex gap-6 mt-1 text-center">
            <div>
              <p className="text-[10px] text-gray-400">เริ่มอด</p>
              <p className="text-xs font-bold text-gray-700">
                {new Date(startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">ผ่านมา</p>
              <p className="text-xs font-bold" style={{ color: protocol.color }}>{elapsedH}ชม. {elapsedM}น.</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">เป้าหมาย</p>
              <p className="text-xs font-bold text-gray-700">{protocol.fastH} ชม.</p>
            </div>
          </div>
        )}

        <button onClick={isActive ? stop : start}
          className="mt-4 px-10 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 shadow-lg"
          style={{ backgroundColor: isActive ? '#ef4444' : protocol.color, boxShadow: `0 6px 20px ${isActive ? '#ef444455' : protocol.color + '55'}` }}>
          {isActive ? '⏹ หยุดอดอาหาร' : '▶ เริ่มอดอาหาร'}
        </button>
      </div>

      {/* Guide */}
      {showGuide && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">ตารางคำแนะนำ IF</p>
          {IF_PROTOCOLS.map(p => (
            <div key={p.hours} className="rounded-2xl p-3 flex gap-3 items-center"
              style={{ backgroundColor: p.color + '14' }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-xs text-center leading-tight"
                style={{ backgroundColor: p.color }}>
                {p.label.split(':').map((v,i) => <div key={i}>{v}</div>)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-xs">{p.name}
                  <span className="font-normal text-gray-400 ml-1">— {p.desc}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">อด {p.fastH} ชม. / กิน {p.feedH} ชม.</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: p.color }}>{p.benefit}</p>
              </div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mt-1">
            <p className="text-xs font-bold text-amber-700 mb-1.5">⚠️ ข้อควรระวัง</p>
            <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside leading-relaxed">
              <li>ดื่มน้ำเปล่าหรือชา/กาแฟดำได้ตลอดช่วงอดอาหาร</li>
              <li>ไม่เหมาะกับผู้ตั้งครรภ์ เด็ก และผู้มีโรคประจำตัว</li>
              <li>หากเวียนหัวหรืออ่อนเพลีย ให้หยุดและรับประทานอาหารทันที</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NubCal() {
  const ctx = useHealth()
  const { t } = useLang()
  const tr = t.trainer
  const MEALS = tr.meals
  const { calorieLog = {}, addCalorieEntry, deleteCalorieEntry, user = {}, bmiData } = ctx
  const waterLog = ctx.waterLog || {}
  const addGlass = ctx.addGlass || (() => {})
  const removeGlass = ctx.removeGlass || (() => {})

  const [viewDate, setViewDate] = useState(TODAY())
  const [showCamera, setShowCamera] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [imageType, setImageType] = useState('image/jpeg')
  const [editResult, setEditResult] = useState(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [activityLevel, setActivityLevel] = useState(() => localStorage.getItem('nubcal_activity') || 'light')
  const [goalMode, setGoalMode]       = useState(() => localStorage.getItem('nubcal_goal_mode') || 'auto')
  const [goalInput, setGoalInput]     = useState(() => localStorage.getItem('nubcal_goal') || '2000')
  const [manualGoal, setManualGoal]   = useState(() => parseInt(localStorage.getItem('nubcal_goal') || '2000'))
  const fileRef = useRef(null)
  const datePickerRef = useRef(null)

  const autoGoal = useMemo(() => {
    const w = bmiData?.weight
    const h = bmiData?.height
    const age = user?.age
    const gender = user?.gender
    if (!w || !h || !age) return null
    return calcTDEE(w, h, age, gender, activityLevel)
  }, [bmiData, user, activityLevel])

  const goal = (goalMode === 'auto' && autoGoal) ? autoGoal : manualGoal

  const macroGoals = useMemo(() => ({
    carbs:   Math.round(goal * 0.37 / 4),
    protein: Math.round(goal * 0.33 / 4),
    fat:     Math.round(goal * 0.30 / 9),
  }), [goal])

  React.useEffect(() => { localStorage.setItem('nubcal_activity', activityLevel) }, [activityLevel])
  React.useEffect(() => { localStorage.setItem('nubcal_goal_mode', goalMode) }, [goalMode])

  const [pageTab, setPageTab]     = useState('diary')
  const [activeMeal, setActiveMeal] = useState('breakfast')
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCat, setActiveCat] = useState('')
  const [manualEntry, setManualEntry] = useState(BLANK)

  const weekDates = useMemo(() => getWeekDates(viewDate), [viewDate])
  const isToday = viewDate === TODAY()
  const entries = calorieLog[viewDate] || []
  const totalCal  = entries.reduce((s, e) => s + (e.calories || 0), 0)
  const totalPro  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
  const totalCarb = entries.reduce((s, e) => s + (e.carbs    || 0), 0)
  const totalFat  = entries.reduce((s, e) => s + (e.fat      || 0), 0)
  const glasses   = waterLog?.[viewDate] || 0

  const filteredFoods = useMemo(() => {
    let list = FOOD_DB
    if (activeCat) list = list.filter(f => f.cat === activeCat)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q))
    }
    return list
  }, [searchQuery, activeCat])

  function formatDateHeader(str) {
    const d = new Date(str + 'T00:00:00')
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
  }

  function openAddFor(meal) {
    setActiveMeal(meal)
    setShowAddSheet(true)
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const type = file.type || 'image/jpeg'
    setImageType(type)
    const reader = new FileReader()
    reader.onload = async ev => {
      const original = ev.target.result
      const base64 = original.split(',')[1]
      const thumbnail = await compressImage(original, 200)
      setImagePreview(thumbnail || original)
      setImageBase64(base64)
      setEditResult(null); setAnalyzed(false); setError('')
      setShowCamera(true); setShowAddSheet(false)
      autoAnalyze(base64, type)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function autoAnalyze(base64, type) {
    const key = API_KEY
    if (!key) return
    setAnalyzing(true); setError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: type, data: base64 } },
            { type: 'text', text: `วิเคราะห์อาหารในภาพนี้และประมาณค่าโภชนาการต่อ 1 ที่เสิร์ฟ ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:\n{"foodName":"ชื่ออาหาร (ภาษาไทย)","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"description":"คำอธิบายสั้น ๆ"}\nถ้าไม่พบอาหารในภาพให้ตอบ: {"error":"ไม่พบอาหารในภาพ"}\ncalories=kcal, ตัวเลขอื่นเป็นกรัม ห้ามใส่หน่วยในตัวเลข` },
          ]}],
        }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error?.message || `API Error ${res.status}`) }
      const data = await res.json()
      const text = data.content[0].text.trim()
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) throw new Error('ไม่สามารถอ่านผลได้')
      const parsed = JSON.parse(m[0])
      if (parsed.error) throw new Error(parsed.error)
      setEditResult({ ...parsed }); setAnalyzed(true)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setAnalyzing(false)
    }
  }

  async function analyzeImage() {
    if (!imageBase64) return
    const key = API_KEY
    if (!key) { setError('ไม่พบ API Key'); return }
    setAnalyzing(true); setError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: imageType, data: imageBase64 } },
            { type: 'text', text: `วิเคราะห์อาหารในภาพนี้และประมาณค่าโภชนาการต่อ 1 ที่เสิร์ฟ ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:\n{"foodName":"ชื่ออาหาร (ภาษาไทย)","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"description":"คำอธิบายสั้น ๆ"}\nถ้าไม่พบอาหารในภาพให้ตอบ: {"error":"ไม่พบอาหารในภาพ"}\ncalories=kcal, ตัวเลขอื่นเป็นกรัม ห้ามใส่หน่วยในตัวเลข` },
          ]}],
        }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error?.message || `API Error ${res.status}`) }
      const data = await res.json()
      const text = data.content[0].text.trim()
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) throw new Error('ไม่สามารถอ่านผลได้')
      const parsed = JSON.parse(m[0])
      if (parsed.error) throw new Error(parsed.error)
      setEditResult({ ...parsed }); setAnalyzed(true)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setAnalyzing(false)
    }
  }

  function saveEntry() {
    if (!editResult) return
    addCalorieEntry(viewDate, {
      id: Date.now(), image: imagePreview, meal: activeMeal,
      foodName: editResult.foodName || 'ไม่ทราบชื่ออาหาร',
      calories: Number(editResult.calories) || 0,
      protein:  Number(editResult.protein)  || 0,
      carbs:    Number(editResult.carbs)    || 0,
      fat:      Number(editResult.fat)      || 0,
      fiber:    Number(editResult.fiber)    || 0,
      description: editResult.description || '',
      timestamp: new Date().toISOString(),
    })
    closeModal()
  }

  function closeModal() {
    setShowCamera(false); setImagePreview(null); setImageBase64(null)
    setEditResult(null); setAnalyzed(false); setError('')
  }

  function addFromDB(food) {
    addCalorieEntry(viewDate, {
      id: Date.now(), meal: activeMeal,
      foodName: food.name, calories: food.cal, protein: food.pro,
      carbs: food.carb, fat: food.fat, fiber: food.fib, description: food.qty,
      timestamp: new Date().toISOString(),
    })
    setShowSearch(false); setSearchQuery(''); setActiveCat('')
  }

  function saveManualEntry() {
    if (!manualEntry.foodName.trim()) return
    addCalorieEntry(viewDate, {
      id: Date.now(), meal: activeMeal,
      foodName: manualEntry.foodName,
      calories: Number(manualEntry.calories) || 0,
      protein:  Number(manualEntry.protein)  || 0,
      carbs:    Number(manualEntry.carbs)    || 0,
      fat:      Number(manualEntry.fat)      || 0,
      fiber:    Number(manualEntry.fiber)    || 0,
      timestamp: new Date().toISOString(),
    })
    setManualEntry(BLANK); setShowManual(false)
  }

  function saveSettings() {
    if (goalMode === 'manual') {
      const v = parseInt(goalInput) || 2000
      localStorage.setItem('nubcal_goal', String(v))
      setManualGoal(v)
    }
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50">

      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{tr.diaryTitle}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => { setGoalInput(String(goal)); setShowSettings(true) }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <Settings size={18} />
            </button>
            <button
              onClick={() => datePickerRef.current?.showPicker?.() ?? datePickerRef.current?.click()}
              className="relative flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5"
            >
              <span className="text-sm">📅</span>
              <span className="text-sm font-medium text-gray-700">{formatDateHeader(viewDate)}</span>
              <input
                ref={datePickerRef}
                type="date"
                value={viewDate}
                max={TODAY()}
                onChange={e => { if (e.target.value) setViewDate(e.target.value) }}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                tabIndex={-1}
              />
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div className="flex justify-between px-1">
          {weekDates.map((d, i) => {
            const dayCal = (calorieLog[d] || []).reduce((s, e) => s + (e.calories || 0), 0)
            const pct = Math.min(dayCal / goal, 1)
            const isSelected = d === viewDate
            const isT = d === TODAY()
            return (
              <button key={d} onClick={() => setViewDate(d)} className="flex flex-col items-center gap-0.5">
                <div className="relative">
                  <WeekRing pct={pct} size={38} selected={isSelected} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isSelected || isT ? 'text-teal-600' : 'text-gray-400'}`}>
                      {DAY_TH[i]}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-teal-600' : 'text-gray-400'}`}>
                  {new Date(d + 'T00:00:00').getDate()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab bar */}
        <div className="flex mt-3 bg-slate-100 rounded-2xl p-1 gap-1">
          {[
            { key: 'diary', label: '🍽️ Food Diary' },
            { key: 'if',    label: '⏱️ IF' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setPageTab(tab.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                pageTab === tab.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">

        {pageTab === 'diary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start max-w-5xl mx-auto">

            {/* ── LEFT: Summary ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm lg:sticky lg:top-20">
              <p className="text-sm font-semibold text-gray-500 mb-3">{tr.dailySummary}</p>

              <div className="flex items-center gap-4">
                <SummaryRing consumed={totalCal} goal={goal} remaining2Label={tr.remaining2} />
                <div className="flex-1 space-y-2">
                  <div className="bg-teal-500 rounded-xl px-3 py-2.5">
                    <p className="text-teal-100 text-xs">{tr.consumed}</p>
                    <p className="text-white font-black text-lg leading-none mt-0.5">
                      {totalCal.toLocaleString()} <span className="text-teal-200 text-xs font-normal">kcal</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-gray-400 text-xs">{tr.goal}</p>
                    <p className="text-gray-800 font-black text-lg leading-none mt-0.5">
                      {goal.toLocaleString()} <span className="text-gray-400 text-xs font-normal">kcal</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-400 px-1">
                    {goalMode === 'auto' && autoGoal ? `🤖 ${tr.fromProfile}` : `✏️ ${tr.customGoalLabel}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { l: tr.carb,    v: Math.round(totalCarb * 10) / 10, max: macroGoals.carbs,   color: '#f59e0b' },
                  { l: tr.protein, v: Math.round(totalPro  * 10) / 10, max: macroGoals.protein, color: '#0d9488' },
                  { l: tr.fat,     v: Math.round(totalFat  * 10) / 10, max: macroGoals.fat,     color: '#8b5cf6' },
                ].map(({ l, v, max, color }) => (
                  <div key={l} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{l}</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">
                      {v}<span className="font-normal text-xs text-gray-400">/{max}ก.</span>
                    </p>
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((v / Math.max(max, 1)) * 100, 100)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Meals + Water ── */}
            <div className="space-y-3">
              {MEALS.map(meal => {
                const mealEntries = entries.filter(e => (e.meal || 'breakfast') === meal.key)
                const mealCal = mealEntries.reduce((s, e) => s + (e.calories || 0), 0)
                return (
                  <div key={meal.key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="font-semibold text-gray-900 text-sm">{meal.label}</span>
                      <span className="text-sm text-gray-500 font-medium">{mealCal > 0 ? `${mealCal} kcal` : '—'}</span>
                    </div>

                    {mealEntries.map(entry => (
                      <div key={entry.id} className="px-4 py-3 flex gap-3 items-start border-t border-gray-50">
                        {entry.image
                          ? <img src={entry.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          : <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-xl">🍽️</div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{entry.foodName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{entry.description || '1 หน่วย'}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="font-semibold text-gray-700 text-sm">{entry.calories} kcal</span>
                              <button onClick={() => deleteCalorieEntry(viewDate, entry.id)}
                                className="text-gray-300 hover:text-red-400 p-0.5 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-400">{tr.carb} {Math.round((entry.carbs || 0) * 10) / 10}ก.</span>
                            <span className="text-xs text-gray-400">{tr.protein} {Math.round((entry.protein || 0) * 10) / 10}ก.</span>
                            <span className="text-xs text-gray-400">{tr.fat} {Math.round((entry.fat || 0) * 10) / 10}ก.</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isToday && (
                      <button onClick={() => openAddFor(meal.key)}
                        className="flex items-center gap-2 px-4 py-3 text-teal-600 text-sm font-medium w-full hover:bg-teal-50 transition-colors border-t border-gray-50">
                        <Plus size={15} />
                        {tr.addFoodLabel}
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Water */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="font-semibold text-gray-900 text-sm">{tr.waterTitle}</span>
                  <span className="text-sm text-gray-500 font-medium">{glasses * GLASS_ML > 0 ? `${glasses * GLASS_ML} มล.` : '—'}</span>
                </div>
                <div className="px-4 pb-3">
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 8 }, (_, i) => (
                      <button key={i}
                        onClick={() => i < glasses ? removeGlass(viewDate) : addGlass(viewDate)}
                        className="w-10 h-12 flex items-center justify-center rounded-xl hover:bg-teal-50 transition-colors">
                        <span className={`text-2xl transition-opacity ${i < glasses ? 'opacity-100' : 'opacity-20'}`}>🥤</span>
                      </button>
                    ))}
                  </div>
                </div>
                {isToday && (
                  <button onClick={() => addGlass(viewDate)}
                    className="flex items-center gap-2 px-4 py-3 text-teal-600 text-sm font-medium w-full hover:bg-teal-50 transition-colors border-t border-gray-50">
                    <Plus size={15} />
                    {tr.waterLogBtn}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {pageTab === 'if' && (
          <div className="max-w-lg mx-auto space-y-3">
            <IFTimer />
          </div>
        )}

      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Add Sheet */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowAddSheet(false)}>
          <div className="bg-white rounded-t-3xl w-full p-4 space-y-2 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 text-center text-sm pb-1">
              {tr.addMealPrefix}{MEALS.find(m => m.key === activeMeal)?.label}
            </h3>
            {[
              { icon: <Camera size={20} className="text-teal-600" />,  bg: '#f0fdfa', title: tr.shotPhoto,   desc: tr.aiAnalyze,                              action: () => fileRef.current?.click() },
              { icon: <BookOpen size={20} className="text-amber-600" />, bg: '#fffbeb', title: tr.fromDB,   desc: `${tr.thaiFood} ${FOOD_DB.length} ${tr.items}`, action: () => { setShowAddSheet(false); setShowSearch(true) } },
              { icon: <Edit3 size={20} className="text-violet-600" />,  bg: '#f5f3ff', title: tr.manualEntry, desc: tr.foodNameLabel.replace(' *', ''),         action: () => { setShowAddSheet(false); setShowManual(true) } },
            ].map(({ icon, bg, title, desc, action }) => (
              <button key={title} onClick={action}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-95 transition-all text-left"
                style={{ background: bg, border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm">{icon}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
            <button onClick={() => setShowAddSheet(false)}
              className="w-full py-3 rounded-2xl text-gray-400 font-medium text-sm hover:bg-gray-50 transition-colors">
              {tr.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-800">{tr.searchFood}</h3>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setActiveCat('') }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input placeholder={tr.searchPh} autoFocus
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {['', ...CATS].map(c => (
                <button key={c || 'all'} onClick={() => setActiveCat(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-colors ${activeCat === c ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                  {c || tr.allCats}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-1.5">
              {filteredFoods.length === 0
                ? <p className="text-center text-gray-400 text-sm py-8">{tr.noResults}</p>
                : filteredFoods.map(food => (
                  <button key={food.id} onClick={() => addFromDB(food)}
                    className="w-full bg-white hover:bg-teal-50 border border-gray-100 rounded-xl p-3.5 text-left flex items-center justify-between gap-3 transition-all active:scale-95">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{food.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{food.qty} · {food.cat}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-teal-600 font-bold text-base leading-none">{food.cal}</p>
                      <p className="text-[10px] text-gray-400">kcal</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-800">{tr.manualEntry}</h3>
              <button onClick={() => setShowManual(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{tr.foodNameLabel}</label>
                <input placeholder={tr.foodNamePh}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                  value={manualEntry.foodName} onChange={e => setManualEntry(p => ({ ...p, foodName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{tr.calLabel}</label>
                <input type="number" min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                  value={manualEntry.calories} onChange={e => setManualEntry(p => ({ ...p, calories: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[[tr.proteinG, 'protein'], [tr.carbG, 'carbs'], [tr.fatG, 'fat'], [tr.fiberG, 'fiber']].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input type="number" min="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                      value={manualEntry[key]} onChange={e => setManualEntry(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <button onClick={saveManualEntry} disabled={!manualEntry.foodName.trim()}
                className="w-full py-3 rounded-2xl font-semibold text-white text-sm disabled:opacity-40 active:scale-95 bg-teal-500 hover:bg-teal-600 transition-colors">
                {tr.saveRecord}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera / Analysis Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-800">{tr.analyzeFood}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {imagePreview && <img src={imagePreview} alt="อาหาร" className="w-full h-48 object-cover rounded-2xl" />}
              {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}
              {analyzing && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <span className="w-5 h-5 border-2 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                  <span className="text-sm font-medium text-teal-600">{tr.analyzing}</span>
                </div>
              )}
              {!analyzed && !analyzing && (
                <button onClick={analyzeImage}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3 font-semibold transition-colors">
                  {tr.analyzeBtn}
                </button>
              )}
              {editResult && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">{tr.analysisResult}</h4>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">{tr.foodNameInput}</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                      value={editResult.foodName || ''} onChange={e => setEditResult(p => ({ ...p, foodName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[[tr.calLabel, 'calories'], [tr.proteinG, 'protein'], [tr.carbG, 'carbs'], [tr.fatG, 'fat']].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                        <input type="number" min="0"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                          value={editResult[key] ?? ''} onChange={e => setEditResult(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  {editResult.description && <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">{editResult.description}</p>}
                  <button onClick={saveEntry} className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3 font-semibold transition-colors">
                    {tr.saveRecord}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-800">{tr.settings}</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">

              {autoGoal ? (
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-teal-800">📊 {tr.calcFromData}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>{tr.weightHeightAge}</span>
                      <span className="font-semibold text-gray-800">
                        {bmiData?.weight} kg / {bmiData?.height} cm / {user?.age} ปี
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{tr.bmrLabel}</span>
                      <span className="font-semibold text-gray-800">
                        {calcBMR(bmiData?.weight, bmiData?.height, user?.age, user?.gender)} kcal
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-teal-100 pt-1.5">
                      <span className="text-teal-700">{tr.tdeeLabel}</span>
                      <span className="text-teal-600">{autoGoal} {tr.tdeeUnit}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-500">⚖️ {tr.bmiFirstText}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">{tr.activityLevelLabel}</label>
                <div className="space-y-1.5">
                  {tr.activityLevels.map(al => {
                    const factor = ACTIVITY_LEVELS.find(x => x.key === al.key)?.factor ?? 1.375
                    return (
                      <button key={al.key} onClick={() => setActivityLevel(al.key)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${activityLevel === al.key ? 'border-teal-300 bg-teal-50' : 'border-gray-100 bg-white hover:border-teal-200'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{al.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{al.desc}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${activityLevel === al.key ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            ×{factor}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">{tr.goalMethodLabel}</label>
                <div className="flex gap-2">
                  <button onClick={() => setGoalMode('auto')} disabled={!autoGoal}
                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40 ${goalMode === 'auto' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                    {tr.goalAuto}
                  </button>
                  <button onClick={() => setGoalMode('manual')}
                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${goalMode === 'manual' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                    {tr.goalManual}
                  </button>
                </div>
              </div>

              {goalMode === 'manual' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{tr.dailyEnergyLabel}</label>
                  <input type="number" min="500" max="9999"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                    value={goalInput} onChange={e => setGoalInput(e.target.value)} />
                </div>
              )}

              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">{tr.currentGoalLabel}</span>
                <span className="text-lg font-black text-teal-600">{goal.toLocaleString()} kcal</span>
              </div>

              <button onClick={saveSettings} className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3 font-semibold transition-colors">
                {tr.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
