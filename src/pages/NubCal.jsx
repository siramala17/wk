import React, { useState, useRef } from 'react'
import { Camera, Settings, X, Trash2, ChevronLeft, ChevronRight, Flame, Zap, Droplets } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const CIRCLE_R = 62
const CIRC = 2 * Math.PI * CIRCLE_R

function CalorieRing({ value, goal }) {
  const pct = Math.min(value / Math.max(goal, 1), 1)
  const dash = pct * CIRC
  const stroke = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#2563eb'
  return (
    <svg width="156" height="156" viewBox="0 0 156 156">
      <circle cx="78" cy="78" r={CIRCLE_R} fill="none" stroke="#dbeafe" strokeWidth="12" />
      <circle
        cx="78" cy="78" r={CIRCLE_R}
        fill="none"
        stroke={stroke}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRC}`}
        transform="rotate(-90 78 78)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  )
}

const TODAY = () => new Date().toISOString().split('T')[0]

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
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('nubcal_key') || '')
  const [goalInput, setGoalInput] = useState(() => localStorage.getItem('nubcal_goal') || '2000')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nubcal_key') || '')
  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem('nubcal_goal') || '2000'))
  const fileRef = useRef(null)

  const entries = calorieLog[viewDate] || []
  const totalCal = entries.reduce((s, e) => s + (e.calories || 0), 0)
  const totalPro = entries.reduce((s, e) => s + (e.protein || 0), 0)
  const totalCarb = entries.reduce((s, e) => s + (e.carbs || 0), 0)
  const totalFat = entries.reduce((s, e) => s + (e.fat || 0), 0)
  const isToday = viewDate === TODAY()

  function shiftDate(delta) {
    const d = new Date(viewDate)
    d.setDate(d.getDate() + delta)
    setViewDate(d.toISOString().split('T')[0])
  }

  function formatDate(str) {
    const d = new Date(str + 'T00:00:00')
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์']
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const type = file.type || 'image/jpeg'
    setImageType(type)
    const reader = new FileReader()
    reader.onload = ev => {
      setImagePreview(ev.target.result)
      setImageBase64(ev.target.result.split(',')[1])
      setEditResult(null)
      setAnalyzed(false)
      setError('')
      setShowCamera(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function analyzeImage() {
    if (!imageBase64) return
    if (!apiKey) {
      setError('กรุณาตั้งค่า API Key ก่อนใช้งาน (กดไอคอนเฟืองด้านบนขวา)')
      return
    }
    setAnalyzing(true)
    setError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
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
              {
                type: 'text',
                text: `วิเคราะห์อาหารในภาพนี้และประมาณค่าโภชนาการต่อ 1 ที่เสิร์ฟ ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "foodName": "ชื่ออาหาร (ภาษาไทย)",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "description": "คำอธิบายสั้น ๆ เกี่ยวกับอาหาร"
}
ถ้าไม่พบอาหารในภาพให้ตอบ: {"error": "ไม่พบอาหารในภาพ"}
calories = kcal, ตัวเลขอื่นเป็นกรัม ห้ามใส่หน่วยในตัวเลข`,
              },
            ],
          }],
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error?.message || `API Error ${res.status}`)
      }
      const data = await res.json()
      const text = data.content[0].text.trim()
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) throw new Error('ไม่สามารถอ่านผลได้')
      const parsed = JSON.parse(m[0])
      if (parsed.error) throw new Error(parsed.error)
      setEditResult({ ...parsed })
      setAnalyzed(true)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setAnalyzing(false)
    }
  }

  function saveEntry() {
    if (!editResult) return
    addCalorieEntry(viewDate, {
      id: Date.now(),
      image: imagePreview,
      foodName: editResult.foodName || 'ไม่ทราบชื่ออาหาร',
      calories: Number(editResult.calories) || 0,
      protein: Number(editResult.protein) || 0,
      carbs: Number(editResult.carbs) || 0,
      fat: Number(editResult.fat) || 0,
      fiber: Number(editResult.fiber) || 0,
      description: editResult.description || '',
      timestamp: new Date().toISOString(),
    })
    closeModal()
  }

  function closeModal() {
    setShowCamera(false)
    setImagePreview(null)
    setImageBase64(null)
    setEditResult(null)
    setAnalyzed(false)
    setError('')
  }

  function saveSettings() {
    localStorage.setItem('nubcal_key', apiKeyInput)
    localStorage.setItem('nubcal_goal', goalInput)
    setApiKey(apiKeyInput)
    setGoal(parseInt(goalInput) || 2000)
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-8">
      {/* Page header */}
      <div className="bg-white border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-blue-700 tracking-tight">nubcal</h1>
          <p className="text-xs text-slate-400">บันทึกแคลอรีจากภาพถ่าย</p>
        </div>
        <button
          onClick={() => { setApiKeyInput(apiKey); setGoalInput(String(goal)); setShowSettings(true) }}
          className="p-2 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Date navigation */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-700">{formatDate(viewDate)}</p>
            {isToday && <span className="text-xs text-blue-500 font-medium">วันนี้</span>}
          </div>
          <button
            onClick={() => shiftDate(1)}
            disabled={isToday}
            className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 disabled:opacity-25 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calorie ring card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700">แคลอรีวันนี้</h2>
            <span className="text-xs text-slate-400 bg-blue-50 px-2 py-1 rounded-full">
              เป้าหมาย {goal.toLocaleString()} kcal
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <CalorieRing value={totalCal} goal={goal} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800 leading-none">{totalCal.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">kcal</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              {[
                { label: 'โปรตีน', val: totalPro, max: 60, color: 'bg-blue-500', trackColor: 'bg-blue-100', icon: <Zap size={11} className="text-blue-500" /> },
                { label: 'คาร์บ', val: totalCarb, max: 250, color: 'bg-yellow-400', trackColor: 'bg-yellow-100', icon: <Flame size={11} className="text-yellow-500" /> },
                { label: 'ไขมัน', val: totalFat, max: 65, color: 'bg-orange-400', trackColor: 'bg-orange-100', icon: <Droplets size={11} className="text-orange-400" /> },
              ].map(({ label, val, max, color, trackColor, icon }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1">{icon}{label}</span>
                    <span>{val}g</span>
                  </div>
                  <div className={`h-1.5 ${trackColor} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${Math.min(val / max * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs pt-0.5">
                {totalCal <= goal
                  ? <span className="text-slate-400">เหลือ <span className="text-blue-600 font-semibold">{(goal - totalCal).toLocaleString()}</span> kcal</span>
                  : <span className="text-red-500 font-medium">เกินเป้า {(totalCal - goal).toLocaleString()} kcal</span>
                }
              </p>
            </div>
          </div>
        </div>

        {/* Shoot button (today only) */}
        {isToday && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 text-white rounded-2xl py-4 flex items-center justify-center gap-3 shadow-md shadow-blue-200 transition-all"
          >
            <Camera size={22} />
            <span className="text-base font-bold">ถ่ายรูปอาหาร</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        {/* Food log */}
        {entries.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <Camera size={40} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">ยังไม่มีรายการอาหาร</p>
            {isToday && <p className="text-xs mt-1">กดถ่ายรูปอาหารเพื่อเริ่มบันทึก</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm p-3 flex gap-3 items-start">
                {entry.image && (
                  <img src={entry.image} alt={entry.foodName} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{entry.foodName}</p>
                    <button
                      onClick={() => deleteCalorieEntry(viewDate, entry.id)}
                      className="p-1 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-blue-600 font-bold text-base mt-0.5">{entry.calories} <span className="text-xs font-normal">kcal</span></p>
                  <div className="flex gap-3 mt-1">
                    {[['P', entry.protein, 'text-blue-500'], ['C', entry.carbs, 'text-yellow-600'], ['F', entry.fat, 'text-orange-500']].map(([l, v, cls]) => (
                      <span key={l} className={`text-[11px] font-semibold ${cls}`}>{l} {v}g</span>
                    ))}
                  </div>
                  {entry.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{entry.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera / Analysis modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">วิเคราะห์อาหาร</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Image preview */}
              {imagePreview && (
                <img src={imagePreview} alt="อาหาร" className="w-full h-52 object-cover rounded-2xl" />
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}

              {/* Analyze button (before analysis) */}
              {!analyzed && (
                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {analyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                      กำลังวิเคราะห์...
                    </>
                  ) : '🔍 วิเคราะห์สารอาหาร'}
                </button>
              )}

              {/* Editable result */}
              {editResult && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 text-sm">ผลการวิเคราะห์ (แก้ไขได้)</h4>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">ชื่ออาหาร</label>
                    <input
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                      value={editResult.foodName || ''}
                      onChange={e => setEditResult(p => ({ ...p, foodName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['แคลอรี่ (kcal)', 'calories', '🔥'],
                      ['โปรตีน (g)', 'protein', '💪'],
                      ['คาร์โบไฮเดรต (g)', 'carbs', '🌾'],
                      ['ไขมัน (g)', 'fat', '🫙'],
                    ].map(([label, key, emoji]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 mb-1 block">{emoji} {label}</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                          value={editResult[key] ?? ''}
                          onChange={e => setEditResult(p => ({ ...p, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  {editResult.description && (
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">{editResult.description}</p>
                  )}
                  <button
                    onClick={saveEntry}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors"
                  >
                    บันทึกลงประวัติ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">ตั้งค่า nubcal</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Anthropic API Key</label>
                <input
                  type="password"
                  placeholder="sk-ant-api03-..."
                  autoComplete="off"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  ใช้สำหรับวิเคราะห์ภาพอาหารด้วย AI • API Key เก็บในเครื่องของคุณเท่านั้น
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">เป้าหมายแคลอรีต่อวัน (kcal)</label>
                <input
                  type="number"
                  min="500"
                  max="9999"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                />
              </div>
              <button
                onClick={saveSettings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
