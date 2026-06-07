import React, { useState, useRef, useMemo } from 'react'
import {
  Camera, Settings, X, Trash2, ChevronLeft, ChevronRight,
  Flame, Zap, Droplets, Search, Plus, Leaf, Edit3, BookOpen
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { FOOD_DB, FOOD_CATS as CATS } from '../data/foodDb'

const CIRCLE_R = 60
const CIRC = 2 * Math.PI * CIRCLE_R
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || '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'

function CalorieRing({ value, goal }) {
  const pct = Math.min(value / Math.max(goal, 1), 1)
  const dash = pct * CIRC
  const stroke = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#2563eb'
  return (
    <svg width="156" height="156" viewBox="0 0 156 156">
      <circle cx="78" cy="78" r={CIRCLE_R} fill="none" stroke="#dbeafe" strokeWidth="12" />
      <circle cx="78" cy="78" r={CIRCLE_R} fill="none" stroke={stroke} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={`${dash} ${CIRC}`}
        transform="rotate(-90 78 78)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  )
}

const TODAY = () => new Date().toISOString().split('T')[0]
const BLANK = { foodName: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' }

export default function NubCal() {
  const { calorieLog, addCalorieEntry, deleteCalorieEntry } = useHealth()

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
  const [apiKeyInput, setApiKeyInput] = useState(() => API_KEY || localStorage.getItem('nubcal_key') || '')
  const [goalInput, setGoalInput] = useState(() => localStorage.getItem('nubcal_goal') || '2000')
  const [apiKey, setApiKey] = useState(() => API_KEY || localStorage.getItem('nubcal_key') || '')
  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem('nubcal_goal') || '2000'))
  const fileRef = useRef(null)

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCat, setActiveCat] = useState('')
  const [manualEntry, setManualEntry] = useState(BLANK)

  const entries  = calorieLog[viewDate] || []
  const totalCal  = entries.reduce((s, e) => s + (e.calories || 0), 0)
  const totalPro  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
  const totalCarb = entries.reduce((s, e) => s + (e.carbs    || 0), 0)
  const totalFat  = entries.reduce((s, e) => s + (e.fat      || 0), 0)
  const totalFib  = entries.reduce((s, e) => s + (e.fiber    || 0), 0)
  const isToday   = viewDate === TODAY()

  const filteredFoods = useMemo(() => {
    let list = FOOD_DB
    if (activeCat) list = list.filter(f => f.cat === activeCat)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q))
    }
    return list
  }, [searchQuery, activeCat])

  function shiftDate(delta) {
    const d = new Date(viewDate)
    d.setDate(d.getDate() + delta)
    setViewDate(d.toISOString().split('T')[0])
  }

  function formatDate(str) {
    const d = new Date(str + 'T00:00:00')
    const days   = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์']
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const type = file.type || 'image/jpeg'
    setImageType(type)
    const reader = new FileReader()
    reader.onload = ev => {
      const base64 = ev.target.result.split(',')[1]
      setImagePreview(ev.target.result)
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
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: type, data: base64 } },
              { type: 'text', text: `วิเคราะห์อาหารในภาพนี้และประมาณค่าโภชนาการต่อ 1 ที่เสิร์ฟ ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:\n{"foodName":"ชื่ออาหาร (ภาษาไทย)","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"description":"คำอธิบายสั้น ๆ"}\nถ้าไม่พบอาหารในภาพให้ตอบ: {"error":"ไม่พบอาหารในภาพ"}\ncalories=kcal, ตัวเลขอื่นเป็นกรัม ห้ามใส่หน่วยในตัวเลข` },
            ],
          }],
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
    const key = API_KEY || apiKey
    if (!key) { setError('กรุณาตั้งค่า API Key ก่อนใช้งาน (กดไอคอนเฟืองด้านบนขวา)'); return }
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
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: imageType, data: imageBase64 } },
              { type: 'text', text: `วิเคราะห์อาหารในภาพนี้และประมาณค่าโภชนาการต่อ 1 ที่เสิร์ฟ ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:\n{"foodName":"ชื่ออาหาร (ภาษาไทย)","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"description":"คำอธิบายสั้น ๆ"}\nถ้าไม่พบอาหารในภาพให้ตอบ: {"error":"ไม่พบอาหารในภาพ"}\ncalories=kcal, ตัวเลขอื่นเป็นกรัม ห้ามใส่หน่วยในตัวเลข` },
            ],
          }],
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
      id: Date.now(), image: imagePreview,
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
      id: Date.now(), foodName: food.name,
      calories: food.cal, protein: food.pro, carbs: food.carb,
      fat: food.fat, fiber: food.fib, description: food.qty,
      timestamp: new Date().toISOString(),
    })
    setShowSearch(false); setSearchQuery(''); setActiveCat('')
  }

  function saveManualEntry() {
    if (!manualEntry.foodName.trim()) return
    addCalorieEntry(viewDate, {
      id: Date.now(), foodName: manualEntry.foodName,
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
    localStorage.setItem('nubcal_key', apiKeyInput)
    localStorage.setItem('nubcal_goal', goalInput)
    setApiKey(apiKeyInput); setGoal(parseInt(goalInput) || 2000); setShowSettings(false)
  }

  const nutrientBars = [
    { label:'โปรตีน',  val:totalPro,  max:60,  color:'bg-blue-500',   track:'bg-blue-100',   icon:<Zap      size={11} className="text-blue-500"   /> },
    { label:'คาร์บ',   val:totalCarb, max:250, color:'bg-yellow-400', track:'bg-yellow-100', icon:<Flame    size={11} className="text-yellow-500" /> },
    { label:'ไขมัน',  val:totalFat,  max:65,  color:'bg-orange-400', track:'bg-orange-100', icon:<Droplets size={11} className="text-orange-400" /> },
    { label:'ใยอาหาร', val:totalFib,  max:25,  color:'bg-green-500',  track:'bg-green-100',  icon:<Leaf     size={11} className="text-green-500"  /> },
  ]

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-blue-700 tracking-tight">nubcal</h1>
          <p className="text-xs text-slate-400">ติดตามแคลอรีและสารอาหาร</p>
        </div>
        <button onClick={() => { setApiKeyInput(apiKey); setGoalInput(String(goal)); setShowSettings(true) }}
          className="p-2 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Date nav */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-700">{formatDate(viewDate)}</p>
            {isToday && <span className="text-xs text-blue-500 font-medium">วันนี้</span>}
          </div>
          <button onClick={() => shiftDate(1)} disabled={isToday}
            className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 disabled:opacity-25 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700">สรุปโภชนาการ</h2>
            <span className="text-xs text-slate-400 bg-blue-50 px-2 py-1 rounded-full">เป้า {goal.toLocaleString()} kcal</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <CalorieRing value={totalCal} goal={goal} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800 leading-none">{totalCal.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">kcal</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
              {nutrientBars.map(({ label, val, max, color, track, icon }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1">{icon}{label}</span>
                    <span className="font-medium">{Math.round(val * 10) / 10}g<span className="text-slate-300 font-normal">/{max}</span></span>
                  </div>
                  <div className={`h-1.5 ${track} rounded-full overflow-hidden`}>
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(val / max * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs pt-0.5">
                {totalCal <= goal
                  ? <span className="text-slate-400">เหลือ <span className="text-blue-600 font-semibold">{(goal - totalCal).toLocaleString()}</span> kcal</span>
                  : <span className="text-red-500 font-medium">เกินเป้า {(totalCal - goal).toLocaleString()} kcal</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Add button */}
        {isToday && (
          <button onClick={() => setShowAddSheet(true)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-white text-base shadow-md shadow-blue-200 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Plus size={20} />
            เพิ่มรายการอาหาร
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        {/* Food log */}
        {entries.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <Flame size={40} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">ยังไม่มีรายการอาหาร</p>
            {isToday && <p className="text-xs mt-1">กดปุ่มด้านบนเพื่อเพิ่มอาหาร</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm p-3 flex gap-3 items-start">
                {entry.image
                  ? <img src={entry.image} alt={entry.foodName} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  : <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>🍽️</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{entry.foodName}</p>
                    <button onClick={() => deleteCalorieEntry(viewDate, entry.id)}
                      className="p-1 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-blue-600 font-bold text-base mt-0.5">{entry.calories} <span className="text-xs font-normal">kcal</span></p>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {[
                      ['P', entry.protein, 'text-blue-500'],
                      ['C', entry.carbs, 'text-yellow-600'],
                      ['F', entry.fat, 'text-orange-500'],
                      ...(entry.fiber > 0 ? [['ใย', entry.fiber, 'text-green-600']] : [])
                    ].map(([l, v, cls]) => (
                      <span key={l} className={`text-[11px] font-semibold ${cls}`}>{l} {Math.round(v * 10) / 10}g</span>
                    ))}
                  </div>
                  {entry.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{entry.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Sheet ── */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAddSheet(false)}>
          <div className="bg-white rounded-t-3xl w-full p-4 space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1" />
            <h3 className="font-bold text-slate-800 text-center pb-1">เพิ่มรายการอาหาร</h3>
            {[
              { icon:<Camera   size={22} className="text-blue-600"  />, bg:'#eff6ff', title:'ถ่ายรูป / เลือกภาพ',    desc:'วิเคราะห์โภชนาการด้วย AI',         action:() => fileRef.current?.click() },
              { icon:<BookOpen size={22} className="text-amber-600" />, bg:'#fffbeb', title:'ค้นหาจากฐานข้อมูล',   desc:`อาหารไทย ${FOOD_DB.length} รายการ`,  action:() => { setShowAddSheet(false); setShowSearch(true) } },
              { icon:<Edit3    size={22} className="text-green-600" />, bg:'#f0fdf4', title:'บันทึกเอง',             desc:'ระบุชื่ออาหารและสารอาหารเอง',       action:() => { setShowAddSheet(false); setShowManual(true) } },
            ].map(({ icon, bg, title, desc, action }) => (
              <button key={title} onClick={action}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-95 transition-all text-left"
                style={{ background: bg, border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/80">{icon}</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
            <button onClick={() => setShowAddSheet(false)}
              className="w-full py-3 rounded-2xl text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* ── Search Modal ── */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">ค้นหาอาหาร</h3>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setActiveCat('') }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input placeholder="ค้นหาอาหาร..." autoFocus
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide flex-shrink-0">
              {['', ...CATS].map(c => (
                <button key={c || 'all'} onClick={() => setActiveCat(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${activeCat === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'}`}>
                  {c || 'ทั้งหมด'}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
              {filteredFoods.length === 0
                ? <p className="text-center text-slate-400 text-sm py-8">ไม่พบรายการ</p>
                : filteredFoods.map(food => (
                  <button key={food.id} onClick={() => addFromDB(food)}
                    className="w-full bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl p-3.5 text-left flex items-center justify-between gap-3 transition-all active:scale-95">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{food.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{food.qty} · {food.cat}</p>
                      <div className="flex gap-2 mt-1.5">
                        {[['P', food.pro,'text-blue-500'], ['C', food.carb,'text-yellow-600'], ['F', food.fat,'text-orange-500']].map(([l, v, cls]) => (
                          <span key={l} className={`text-[10px] font-bold ${cls}`}>{l} {v}g</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-600 font-extrabold text-lg leading-none">{food.cal}</p>
                      <p className="text-[10px] text-slate-400">kcal</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Manual Entry Modal ── */}
      {showManual && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">บันทึกเอง</h3>
              <button onClick={() => setShowManual(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">ชื่ออาหาร *</label>
                <input placeholder="เช่น ข้าวผัดหมู"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={manualEntry.foodName} onChange={e => setManualEntry(p => ({ ...p, foodName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">🔥 แคลอรี่ (kcal)</label>
                <input type="number" min="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={manualEntry.calories} onChange={e => setManualEntry(p => ({ ...p, calories: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['💪 โปรตีน (g)', 'protein'], ['🌾 คาร์โบไฮเดรต (g)', 'carbs'], ['🫙 ไขมัน (g)', 'fat'], ['🥦 ใยอาหาร (g)', 'fiber']].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                    <input type="number" min="0"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                      value={manualEntry[key]} onChange={e => setManualEntry(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <button onClick={saveManualEntry} disabled={!manualEntry.foodName.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                บันทึกลงประวัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera / Analysis Modal ── */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">วิเคราะห์อาหาร</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {imagePreview && <img src={imagePreview} alt="อาหาร" className="w-full h-52 object-cover rounded-2xl" />}
              {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}
              {!analyzed && (
                <button onClick={analyzeImage} disabled={analyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-colors">
                  {analyzing
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> กำลังวิเคราะห์...</>
                    : '🔍 วิเคราะห์สารอาหาร'}
                </button>
              )}
              {editResult && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 text-sm">ผลการวิเคราะห์ (แก้ไขได้)</h4>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">ชื่ออาหาร</label>
                    <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                      value={editResult.foodName || ''} onChange={e => setEditResult(p => ({ ...p, foodName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[['🔥 แคลอรี่ (kcal)', 'calories'], ['💪 โปรตีน (g)', 'protein'], ['🌾 คาร์โบไฮเดรต (g)', 'carbs'], ['🫙 ไขมัน (g)', 'fat']].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                        <input type="number" min="0"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                          value={editResult[key] ?? ''} onChange={e => setEditResult(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  {editResult.description && <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">{editResult.description}</p>}
                  <button onClick={saveEntry} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors">
                    บันทึกลงประวัติ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">ตั้งค่า nubcal</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Anthropic API Key</label>
                <input type="password" placeholder="sk-ant-api03-..." autoComplete="off"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} />
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">ใช้สำหรับวิเคราะห์ภาพอาหารด้วย AI • API Key เก็บในเครื่องของคุณเท่านั้น</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">เป้าหมายแคลอรีต่อวัน (kcal)</label>
                <input type="number" min="500" max="9999"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={goalInput} onChange={e => setGoalInput(e.target.value)} />
              </div>
              <button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors">
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
