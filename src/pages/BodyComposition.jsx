import React, { useState, useEffect } from 'react'
import {
  Scale, Droplets, Dumbbell, Zap, Activity, Upload, FileText,
  X, AlertCircle, CheckCircle, TrendingUp, Heart, Utensils,
  RefreshCw, ChevronDown, ChevronUp, Save, Clock,
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { saveBodyComposition, fetchBodyCompositions } from '../services/userSync'

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''

const LEVEL_COLOR = {
  'ต่ำ':      { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  'ปกติ':     { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  'มาตรฐาน': { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  'เกิน':     { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  'สูง':      { color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
  'เกินมาก':  { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
}

const ICON_MAP = { muscle: Dumbbell, fat: Activity, water: Droplets, diet: Utensils, exercise: TrendingUp, heart: Heart }
const PRIORITY_COLOR = { high: '#f43f5e', medium: '#f59e0b', low: '#6366f1' }

function LevelBadge({ level }) {
  const s = LEVEL_COLOR[level] || LEVEL_COLOR['ปกติ']
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {level}
    </span>
  )
}

function MetricRow({ label, value, unit, level, normal }) {
  const s = LEVEL_COLOR[level] || {}
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {normal && <p className="text-[10px] text-slate-400">{normal}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black" style={{ color: s.color || '#334155' }}>
          {value} <span className="font-normal text-xs text-slate-400">{unit}</span>
        </span>
        {level && <LevelBadge level={level} />}
      </div>
    </div>
  )
}

function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = img.width  * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const url = canvas.toDataURL('image/jpeg', 0.85)
        resolve({ base64: url.split(',')[1], mediaType: 'image/jpeg', isPdf: false })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function readPdf(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const base64 = e.target.result.split(',')[1]
      resolve({ base64, mediaType: 'application/pdf', isPdf: true })
    }
    reader.readAsDataURL(file)
  })
}

const EXTRACT_PROMPT = `วิเคราะห์รายงาน Body Composition ในภาพนี้อย่างละเอียด ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "info": { "name":"", "age":0, "gender":"", "height":0, "testDate":"" },
  "data": {
    "weight":0, "weightLevel":"",
    "bodyFatKg":0, "bodyFatPct":0, "bodyFatLevel":"",
    "protein":0, "proteinLevel":"",
    "waterKg":0, "waterPct":0, "waterLevel":"",
    "muscleMassKg":0, "muscleMassLevel":"",
    "skeletalMuscleKg":0, "skeletalMuscleLevel":"",
    "bmi":0, "bmiLevel":"",
    "obesityPct":0, "obesityLevel":"",
    "bodyScore":0,
    "visceralFatLevel":0,
    "bmr":0,
    "leanBodyMass":0,
    "subcutaneousFatPct":0,
    "smi":0,
    "bodyAge":0,
    "whr":0
  },
  "weightControl": { "targetWeight":0, "adjustWeight":0, "adjustFat":0, "adjustMuscle":0 },
  "segmentFat": {
    "leftArm":{"kg":0,"pct":0,"level":""},
    "rightArm":{"kg":0,"pct":0,"level":""},
    "trunk":{"kg":0,"pct":0,"level":""},
    "leftLeg":{"kg":0,"pct":0,"level":""},
    "rightLeg":{"kg":0,"pct":0,"level":""}
  },
  "segmentMuscle": {
    "leftArm":{"kg":0,"pct":0,"level":""},
    "rightArm":{"kg":0,"pct":0,"level":""},
    "trunk":{"kg":0,"pct":0,"level":""},
    "leftLeg":{"kg":0,"pct":0,"level":""},
    "rightLeg":{"kg":0,"pct":0,"level":""}
  },
  "exercise": [{"name":"","kcal":0}],
  "recommendations": [
    {
      "title": "หัวข้อคำแนะนำ",
      "detail": "คำอธิบายละเอียดอิงหลักสากล WHO/ACSM/ISSN",
      "priority": "high",
      "icon": "muscle"
    }
  ]
}
ระดับให้ใช้: ต่ำ / ปกติ / มาตรฐาน / เกิน / สูง / เกินมาก
icon ให้เลือกจาก: muscle, fat, water, diet, exercise, heart
priority: high, medium, low
สร้าง recommendations อย่างน้อย 5 ข้อ อิงมาตรฐาน WHO, ACSM, ISSN ให้เหมาะสมกับค่าที่วัดได้จริง`

function todayStr() { return new Date().toISOString().split('T')[0] }
function nowTimeStr() { return new Date().toTimeString().slice(0, 5) }

export default function BodyComposition() {
  const { user } = useHealth()
  const [filePreview, setFilePreview]   = useState(null)
  const [fileData, setFileData]         = useState(null)
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState(null)
  const [error, setError]               = useState('')
  const [showSegment, setShowSegment]   = useState(false)
  const [showExercise, setShowExercise] = useState(false)

  // Save state
  const [saveDate, setSaveDate]         = useState(todayStr)
  const [saveTime, setSaveTime]         = useState(nowTimeStr)
  const [saveStatus, setSaveStatus]     = useState('idle') // idle | saving | saved | error
  const [savedDates, setSavedDates]     = useState(new Set())
  const [historyLoading, setHistoryLoading] = useState(true)

  // โหลดข้อมูลล่าสุดที่บันทึกไว้เมื่อเปิดหน้า
  useEffect(() => {
    if (!user?.id) { setHistoryLoading(false); return }
    fetchBodyCompositions(String(user.id))
      .then(list => {
        setSavedDates(new Set(list.map(r => r.date)))
        if (list.length > 0) {
          const latest = list[0] // sorted desc by date
          setResult(latest.result)
          setSaveDate(latest.date)
          setSaveTime(latest.time || nowTimeStr())
          setSaveStatus('saved')
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [user?.id])

  async function handleFile(file) {
    if (!file) return
    const isPdf = file.type === 'application/pdf'
    const isImg = file.type.startsWith('image/')
    if (!isPdf && !isImg) { setError('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) หรือ PDF เท่านั้น'); return }
    setError(''); setResult(null)
    if (isPdf) {
      setFilePreview({ type: 'pdf', name: file.name })
      const data = await readPdf(file)
      setFileData(data)
    } else {
      setFilePreview({ type: 'image', url: URL.createObjectURL(file) })
      const data = await compressImage(file)
      setFileData(data)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function analyze() {
    if (!fileData) return
    if (!API_KEY) { setError('ไม่พบ VITE_ANTHROPIC_KEY ใน .env'); return }
    setLoading(true); setError('')
    try {
      const fileBlock = fileData.isPdf
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileData.base64 } }
        : { type: 'image',    source: { type: 'base64', media_type: fileData.mediaType, data: fileData.base64 } }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          messages: [{ role: 'user', content: [
            fileBlock,
            { type: 'text', text: EXTRACT_PROMPT },
          ]}],
        }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error?.message || `API Error ${res.status}`) }
      const data = await res.json()
      const text = data.content[0].text.trim()
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) throw new Error('ไม่สามารถอ่านผลได้')
      const parsed = JSON.parse(m[0])
      setResult(parsed)
      setSaveDate(todayStr())
      setSaveTime(nowTimeStr())
      setSaveStatus('idle')
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result || !user?.id) return
    setSaveStatus('saving')
    try {
      await saveBodyComposition(String(user.id), saveDate, saveTime, result)
      setSavedDates(prev => new Set([...prev, saveDate]))
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  function reset() {
    setFilePreview(null); setFileData(null); setResult(null)
    setError(''); setSaveStatus('idle')
  }

  const isUpdate = savedDates.has(saveDate)

  if (historyLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col items-center gap-3 pt-16">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl p-5 text-white mb-5 shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7490, #22d3ee)' }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black">Body Composition</h1>
              <p className="text-cyan-100 text-xs">วิเคราะห์องค์ประกอบร่างกาย + คำแนะนำ AI</p>
            </div>
          </div>
          {result && (
            <button
              onClick={reset}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all"
            >
              <Upload size={12} /> อัปโหลดใหม่
            </button>
          )}
        </div>
      </div>

      {/* Upload zone */}
      {!result && (
        <div className="mb-5">
          <input
            id="bc-file-input"
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = '' }}
          />
          {!filePreview ? (
            <label
              htmlFor="bc-file-input"
              className="border-2 border-dashed border-indigo-300 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all hover:border-cyan-400 hover:bg-cyan-50"
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Upload size={24} className="text-indigo-400" />
              </div>
              <p className="font-bold text-slate-600">อัปโหลดรายงาน Body Composition</p>
              <p className="text-xs text-slate-400 text-center">ถ่ายรูปหรือเลือกไฟล์จากเครื่องชั่งวิเคราะห์ร่างกาย<br />รองรับ JPG, PNG, WEBP และ PDF</p>
              <span className="text-xs text-cyan-600 font-semibold border border-cyan-300 px-3 py-1 rounded-full">เลือกไฟล์</span>
            </label>
          ) : filePreview.type === 'image' ? (
            <div className="rounded-2xl overflow-hidden relative shadow-sm border border-slate-100">
              <img src={filePreview.url} alt="report" className="w-full max-h-72 object-contain bg-slate-50" />
              <button onClick={reset}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{filePreview.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">PDF พร้อมวิเคราะห์</p>
              </div>
              <button onClick={reset}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {fileData && !loading && (
            <button onClick={analyze}
              className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0e7490, #22d3ee)', boxShadow: '0 4px 16px rgba(6,182,212,0.4)' }}>
              <Zap size={18} /> วิเคราะห์ด้วย AI
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">AI กำลังอ่านผลและสร้างคำแนะนำ...</p>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Score + Info */}
          <div className="rounded-2xl p-4 text-white relative overflow-hidden shadow"
            style={{ background: 'linear-gradient(135deg, #0e7490, #22d3ee)' }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-xs">{result.info?.name || 'ผู้รับการทดสอบ'}</p>
                <p className="text-[11px] text-cyan-200">
                  อายุ {result.info?.age} ปี · {result.info?.gender} · {result.info?.height} cm
                </p>
              </div>
              {result.data?.bodyScore > 0 && (
                <div className="text-right">
                  <p className="text-3xl font-black">{result.data.bodyScore}</p>
                  <p className="text-cyan-100 text-xs">/ 100 คะแนน</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Save Panel ── */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Save size={13} className="text-cyan-600" />
              <p className="text-xs font-bold text-slate-600">บันทึกข้อมูล</p>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">วันที่</label>
                <input
                  type="date"
                  value={saveDate}
                  onChange={e => { setSaveDate(e.target.value); setSaveStatus('idle') }}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">เวลา</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input
                    type="time"
                    value={saveTime}
                    onChange={e => setSaveTime(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl pl-8 pr-3 py-2 outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {isUpdate && saveStatus !== 'saved' && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                <p className="text-[11px] text-amber-600">มีข้อมูลของวันนี้แล้ว — กดเพื่ออัปเดต</p>
              </div>
            )}

            {saveStatus === 'error' && (
              <p className="text-[11px] text-red-500 mb-2">เกิดข้อผิดพลาด กรุณาลองใหม่</p>
            )}

            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: saveStatus === 'saved'
                  ? '#10b981'
                  : 'linear-gradient(135deg, #0e7490, #22d3ee)',
                opacity: saveStatus === 'saving' ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(6,182,212,0.35)',
              }}
            >
              {saveStatus === 'saving' ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</>
              ) : saveStatus === 'saved' ? (
                <><CheckCircle size={15} /> บันทึกแล้ว</>
              ) : (
                <><Save size={15} /> {isUpdate ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}</>
              )}
            </button>
          </div>

          {/* Weight control */}
          {result.weightControl?.targetWeight > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-3">การควบคุมน้ำหนัก</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'น้ำหนักเป้าหมาย', value: result.weightControl.targetWeight, unit: 'kg' },
                  { label: 'ปรับน้ำหนัก', value: (result.weightControl.adjustWeight > 0 ? '+' : '') + result.weightControl.adjustWeight, unit: 'kg' },
                  { label: 'ปรับไขมัน', value: (result.weightControl.adjustFat > 0 ? '+' : '') + result.weightControl.adjustFat, unit: 'kg' },
                  { label: 'ปรับกล้ามเนื้อ', value: (result.weightControl.adjustMuscle > 0 ? '+' : '') + result.weightControl.adjustMuscle, unit: 'kg' },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="bg-slate-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-sm font-black text-slate-700">{value} <span className="text-xs font-normal">{unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body composition table */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">การวิเคราะห์องค์ประกอบร่างกาย</p>
            {[
              { label: 'น้ำหนัก',          value: result.data?.weight,         unit: 'kg', level: result.data?.weightLevel },
              { label: 'ไขมันในร่างกาย',   value: `${result.data?.bodyFatKg} (${result.data?.bodyFatPct}%)`, unit: 'kg', level: result.data?.bodyFatLevel },
              { label: 'โปรตีน',           value: result.data?.protein,        unit: 'kg', level: result.data?.proteinLevel },
              { label: 'น้ำในร่างกาย',     value: `${result.data?.waterKg} (${result.data?.waterPct}%)`, unit: 'kg', level: result.data?.waterLevel },
              { label: 'กล้ามเนื้อ',       value: result.data?.muscleMassKg,   unit: 'kg', level: result.data?.muscleMassLevel },
              { label: 'กล้ามเนื้อโครงร่าง', value: result.data?.skeletalMuscleKg, unit: 'kg', level: result.data?.skeletalMuscleLevel },
            ].filter(r => r.value).map(row => (
              <MetricRow key={row.label} {...row} />
            ))}
          </div>

          {/* Obesity + BMI */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">การประเมินโรคอ้วน</p>
            {[
              { label: 'BMI',    value: result.data?.bmi,        unit: 'kg/m²', level: result.data?.bmiLevel },
              { label: '%ไขมัน', value: result.data?.bodyFatPct, unit: '%',     level: result.data?.bodyFatLevel },
              { label: 'โรคอ้วน', value: result.data?.obesityPct, unit: '%',    level: result.data?.obesityLevel },
            ].filter(r => r.value).map(row => (
              <MetricRow key={row.label} {...row} />
            ))}
          </div>

          {/* Other indicators */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">ตัวชี้วัดอื่นๆ</p>
            {[
              { label: 'ระดับไขมันช่องท้อง', value: result.data?.visceralFatLevel, unit: '' },
              { label: 'อัตราเผาผลาญ (BMR)',  value: result.data?.bmr,             unit: 'kcal' },
              { label: 'น้ำหนักที่ไม่รวมไขมัน', value: result.data?.leanBodyMass,  unit: 'kg' },
              { label: 'ไขมันใต้ผิวหนัง',     value: result.data?.subcutaneousFatPct, unit: '%' },
              { label: 'ดัชนีกล้ามเนื้อโครงร่าง (SMI)', value: result.data?.smi,  unit: 'kg/m²' },
              { label: 'อายุร่างกาย',          value: result.data?.bodyAge,         unit: 'ปี' },
              { label: 'รอบเอว/สะโพก (WHR)',   value: result.data?.whr,             unit: '' },
            ].filter(r => r.value).map(row => (
              <MetricRow key={row.label} {...row} />
            ))}
          </div>

          {/* Segment analysis toggle */}
          {result.segmentFat && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button
                onClick={() => setShowSegment(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <p className="text-xs font-bold text-slate-500">การวิเคราะห์เฉพาะส่วน</p>
                {showSegment ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {showSegment && (
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 mb-1">ไขมันเฉพาะส่วน</p>
                    {Object.entries(result.segmentFat).map(([part, val]) => {
                      const labels = { leftArm:'แขนซ้าย', rightArm:'แขนขวา', trunk:'ลำตัว', leftLeg:'ขาซ้าย', rightLeg:'ขาขวา' }
                      return <MetricRow key={part} label={labels[part]} value={`${val.kg} kg (${val.pct}%)`} unit="" level={val.level} />
                    })}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 mb-1">กล้ามเนื้อเฉพาะส่วน</p>
                    {Object.entries(result.segmentMuscle).map(([part, val]) => {
                      const labels = { leftArm:'แขนซ้าย', rightArm:'แขนขวา', trunk:'ลำตัว', leftLeg:'ขาซ้าย', rightLeg:'ขาขวา' }
                      return <MetricRow key={part} label={labels[part]} value={`${val.kg} kg (${val.pct}%)`} unit="" level={val.level} />
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exercise calories toggle */}
          {result.exercise?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button
                onClick={() => setShowExercise(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <p className="text-xs font-bold text-slate-500">พลังงานที่ใช้จากการออกกำลังกาย (30 นาที)</p>
                {showExercise ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {showExercise && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-1.5">
                  {result.exercise.map(({ name, kcal }) => (
                    <div key={name} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-1.5">
                      <span className="text-[11px] text-slate-600">{name}</span>
                      <span className="text-[11px] font-bold text-orange-500">{kcal} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 px-1">คำแนะนำตามหลักสากล</p>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => {
                  const Icon = ICON_MAP[rec.icon] || CheckCircle
                  const pc   = PRIORITY_COLOR[rec.priority] || '#6366f1'
                  return (
                    <div key={i}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: pc }} />
                      <div className="flex items-start gap-3 pl-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${pc}15` }}>
                          <Icon size={15} style={{ color: pc }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-0.5">{rec.title}</p>
                          <p className="text-[12px] text-slate-500 leading-relaxed">{rec.detail}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400 pb-2">
            * วิเคราะห์โดย AI อ้างอิงมาตรฐาน WHO / ACSM / ISSN — ไม่ใช่คำวินิจฉัยทางการแพทย์
          </p>
        </div>
      )}
    </div>
  )
}
