import React, { useState, useEffect } from 'react'
import { Scale, RefreshCw, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { calcBmiScore, getBmiCategory } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
      : part
  )
}

const SECTION_STYLES = {
  '1': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', dot: '#f97316' },
  '2': { bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-700',    dot: '#ef4444' },
  '3': { bg: 'bg-emerald-50',border: 'border-emerald-300',text: 'text-emerald-700',dot: '#10b981' },
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0
  let sectionNum = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) { elements.push(<div key={key++} className="h-1.5" />); continue }

    // ### heading or **1. heading**
    const isH3 = trimmed.startsWith('### ') || trimmed.startsWith('## ')
    const isBoldNum = /^\*\*\d+\./.test(trimmed)
    if (isH3 || isBoldNum) {
      sectionNum++
      const content = trimmed.replace(/^#+\s*/, '').replace(/^\*\*(.*)\*\*$/, '$1')
      const s = SECTION_STYLES[String(sectionNum)] || { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' }
      elements.push(
        <div key={key++} className={`${s.bg} border-l-4 ${s.border} pl-3 pr-2 py-2 rounded-r-xl mt-4 mb-1`}>
          <p className={`font-bold text-sm ${s.text}`}>{renderInline(content)}</p>
        </div>
      )
      continue
    }

    // - bullet
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.slice(2)
      // detect **label:** prefix
      const labelMatch = content.match(/^\*\*([^*]+):\*\*\s*(.*)/)
      if (labelMatch) {
        elements.push(
          <div key={key++} className="flex items-start gap-2 py-0.5 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-700">{labelMatch[1]}:</span>{' '}
              {renderInline(labelMatch[2])}
            </p>
          </div>
        )
      } else {
        elements.push(
          <div key={key++} className="flex items-start gap-2 py-0.5 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
            <p className="text-xs text-slate-600 leading-relaxed">{renderInline(content)}</p>
          </div>
        )
      }
      continue
    }

    // plain paragraph
    elements.push(
      <p key={key++} className="text-xs text-slate-600 leading-relaxed">{renderInline(trimmed)}</p>
    )
  }
  return elements
}

// 5-dimension WHO Adolescent Health Assessment (12–18 yr)
// Reference: กระทรวงสาธารณสุข — กรมอนามัย กรมสุขภาพจิต กรมควบคุมโรค
const DIMENSIONS = [
  {
    id: 'nutrition', emoji: '🥗', label: 'ด้านโภชนาการ',
    desc: 'พฤติกรรมการกินตาม WHO Nutrition Guidelines',
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', head: 'bg-emerald-600',
    ref: 'กองโภชนาการ กรมอนามัย กระทรวงสาธารณสุข',
    questions: [
      'คุณข้ามมื้ออาหาร โดยเฉพาะมื้อเช้า',
      'คุณดื่มน้ำอัดลม เครื่องดื่มชูกำลัง หรือน้ำหวานบรรจุขวดแทนน้ำเปล่า',
      'คุณกินผักและผลไม้รวมน้อยกว่า 5 ส่วนต่อวัน (WHO แนะนำ ≥400 ก./วัน)',
    ],
  },
  {
    id: 'activity', emoji: '🏃', label: 'ด้านกิจกรรมทางกาย',
    desc: 'WHO แนะนำ ≥60 นาที/วันสำหรับวัยรุ่น',
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', head: 'bg-blue-600',
    ref: 'กรมอนามัย กระทรวงสาธารณสุข · แนวทางส่งเสริมกิจกรรมทางกายวัยรุ่น',
    questions: [
      'คุณออกกำลังกายน้อยกว่า 60 นาทีต่อวัน (วิ่ง ว่ายน้ำ ปั่นจักรยาน เล่นกีฬา)',
      'คุณใช้เวลาหน้าจอรวม (โทรศัพท์/ทีวี/เกม) มากกว่า 4 ชั่วโมงต่อวัน',
      'คุณนั่งหรือนอนเฉยโดยไม่เคลื่อนไหวร่างกายนานกว่า 2 ชั่วโมงต่อเนื่อง',
    ],
  },
  {
    id: 'mental', emoji: '🧠', label: 'ด้านสุขภาพจิต',
    desc: 'อารมณ์ ความเครียด และสุขภาวะทางจิต',
    color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', head: 'bg-purple-600',
    ref: 'กรมสุขภาพจิต กระทรวงสาธารณสุข · คู่มือสุขภาพจิตวัยรุ่น',
    questions: [
      'คุณรู้สึกเครียด วิตกกังวล หรือหนักใจจนส่งผลต่อการเรียนหรือชีวิตประจำวัน',
      'คุณมีอารมณ์หดหู่ ซึมเศร้า หรือรู้สึกไม่มีคุณค่าในตนเอง',
      'คุณรู้สึกโดดเดี่ยวหรือขาดคนที่ไว้ใจได้ในชีวิต',
    ],
  },
  {
    id: 'sleep', emoji: '💤', label: 'ด้านการนอนหลับ',
    desc: 'กรมสุขภาพจิต แนะนำวัยรุ่น 8–10 ชม./คืน',
    color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', head: 'bg-indigo-600',
    ref: 'กรมสุขภาพจิต กระทรวงสาธารณสุข · แนวทางการนอนหลับในวัยรุ่น',
    questions: [
      'คุณนอนหลับน้อยกว่า 8 ชั่วโมงต่อคืนในวันเรียน',
      'คุณใช้โทรศัพท์หรือหน้าจอจนดึกหลัง 5 ทุ่ม ทำให้เข้านอนช้า',
      'คุณตื่นนอนรู้สึกเหนื่อยล้า ไม่สดชื่น หรืองัวเงียตลอดวัน',
    ],
  },
  {
    id: 'risk', emoji: '🛡️', label: 'ด้านพฤติกรรมเสี่ยง',
    desc: 'สิ่งแวดล้อม สังคม และพฤติกรรมที่เสี่ยงต่อสุขภาพ',
    color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', head: 'bg-red-600',
    ref: 'กรมควบคุมโรค กระทรวงสาธารณสุข · แผนป้องกันพฤติกรรมเสี่ยงวัยรุ่น',
    questions: [
      'คุณอยู่ในสภาพแวดล้อมที่มีการสูบบุหรี่ ดื่มแอลกอฮอล์ หรือใช้สารเสพติด',
      'คุณรู้สึกถูกกดดัน บูลลี่ หรือมีความขัดแย้งรุนแรงกับเพื่อนหรือคนรอบข้าง',
      'คุณเปรียบเทียบรูปลักษณ์หรือชีวิตตัวเองกับผู้อื่นในโซเชียลมีเดียจนรู้สึกแย่กับตัวเอง',
    ],
  },
]

// Flatten questions for array index compatibility
const HEALTH_QUESTIONS = DIMENSIONS.flatMap(d => d.questions)
const SCORE_LABELS = ['ไม่เคย', 'นานๆ ครั้ง', 'บางครั้ง', 'บ่อยครั้ง', 'เป็นประจำ']

function getDimScore(dimIdx, answers) {
  return answers.slice(dimIdx * 3, dimIdx * 3 + 3).reduce((s, v) => s + v, 0)
}
function getDimLevel(score) {
  if (score <= 6)  return { label: 'ดี',           color: 'text-emerald-600', bg: 'bg-emerald-100' }
  if (score <= 10) return { label: 'ควรปรับปรุง',  color: 'text-yellow-600',  bg: 'bg-yellow-100' }
  return                   { label: 'ต้องดูแล',    color: 'text-red-600',     bg: 'bg-red-100' }
}
function getRiskLevel(total) {
  if (total <= 30) return { label: 'สุขภาพดี',            color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: '#10b981' }
  if (total <= 45) return { label: 'ควรปรับปรุง',          color: 'text-yellow-700',  bg: 'bg-yellow-50',   border: 'border-yellow-200',  dot: '#f59e0b' }
  if (total <= 60) return { label: 'ต้องดูแลพฤติกรรม',    color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  dot: '#f97316' }
  return                   { label: 'ต้องการความช่วยเหลือ', color: 'text-red-700',    bg: 'bg-red-50',      border: 'border-red-200',     dot: '#ef4444' }
}

function ObesityAssessment({ bmi, weight, height, category }) {
  const { user } = useHealth()
  const historyKey = `obesity_history_${user?.id || 'guest'}`

  const [answers, setAnswers]         = useState(Array(15).fill(0))
  const [aiResult, setAiResult]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [done, setDone]               = useState(false)
  const [saved, setSaved]             = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(`obesity_history_${user?.id || 'guest'}`) || '[]') }
    catch { return [] }
  })

  const answered  = answers.filter(v => v > 0).length
  const total     = answers.reduce((s, v) => s + v, 0)
  const allDone   = answered === 15
  const risk      = getRiskLevel(total)
  const pct       = (answered / 15) * 100
  const dimScores = DIMENSIONS.map((_, di) => getDimScore(di, answers))

  function saveRecord(resultText) {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      bmi, weight, height, category,
      total,
      riskLabel: getRiskLevel(total).label,
      answers: [...answers],
      aiResult: resultText,
    }
    const updated = [record, ...history].slice(0, 20)
    setHistory(updated)
    localStorage.setItem(historyKey, JSON.stringify(updated))
    setSaved(true)
  }

  async function analyze() {
    if (!allDone) return
    setLoading(true); setError('')
    try {
      const dimText = DIMENSIONS.map((dim, di) => {
        const sc = dimScores[di]
        const lv = getDimLevel(sc)
        const qRows = dim.questions.map((q, qi) => {
          const ai = di * 3 + qi
          return `  • ${q} → ${answers[ai]}/5 (${SCORE_LABELS[answers[ai] - 1]})`
        }).join('\n')
        return `${dim.emoji} ${dim.label} — คะแนน ${sc}/15 (${lv.label})\n${qRows}`
      }).join('\n\n')

      const prompt = `คุณเป็นผู้เชี่ยวชาญด้านสุขภาพวัยรุ่น อ้างอิงแนวทางของ กระทรวงสาธารณสุข ประเทศไทย (กรมอนามัย กรมสุขภาพจิต กรมควบคุมโรค) สำหรับวัยรุ่นอายุ 12–18 ปี อย่างเคร่งครัด

ข้อมูลผู้ใช้:
- BMI: ${bmi} (${category}) — เกณฑ์กรมอนามัย (อ้างอิง WHO Asia-Pacific): ปกติ 18.5–22.9, เริ่มเกิน 23–24.9, อ้วน ≥25
- น้ำหนัก: ${weight} kg · ส่วนสูง: ${height} cm
- คะแนนรวม: ${total}/75 (${risk.label})

ผลแบบประเมินสุขภาพ 5 ด้าน (1 = ไม่เคย … 5 = เป็นประจำ):
${dimText}

วิเคราะห์โดยอ้างอิงแนวทางกระทรวงสาธารณสุขสำหรับวัยรุ่น 12–18 ปี ดังนี้:

### 1. ภาพรวมสุขภาพ 5 ด้าน
วิเคราะห์แต่ละด้านที่มีคะแนนสูง เทียบกับเกณฑ์กระทรวงสาธารณสุข ได้แก่:
- โภชนาการ: กองโภชนาการ กรมอนามัย แนะนำผักและผลไม้ ≥5 ส่วน/วัน ลดน้ำตาล-โซเดียม
- กิจกรรมทางกาย: กรมอนามัย แนะนำวัยรุ่น ≥60 นาที/วัน ลดหน้าจอ ≤2 ชม./วัน
- สุขภาพจิต: กรมสุขภาพจิต ระบุวัยรุ่นเป็นช่วงเสี่ยงโรคซึมเศร้า ความเครียด
- การนอนหลับ: กรมสุขภาพจิต แนะนำวัยรุ่น 8–10 ชม./คืน
- พฤติกรรมเสี่ยง: กรมควบคุมโรค ระบุปัจจัยเสี่ยง NCDs และสุขภาวะสังคมวัยรุ่น

### 2. จุดเสี่ยงสำคัญที่ต้องแก้ไข
ระบุ 2–3 ข้อที่คะแนนสูงสุดและส่งผลต่อสุขภาพมากที่สุด พร้อมอ้างอิงหน่วยงานกระทรวงสาธารณสุข

### 3. แผนปรับพฤติกรรมเฉพาะตัว (ปฏิบัติได้จริง)
แนะนำ 3–4 ขั้นตอนที่วัดผลได้ ตามแนวทางกระทรวงสาธารณสุขสำหรับวัยรุ่น 12–18 ปี

ตอบภาษาไทย กระชับ ใช้หัวข้อย่อย ไม่เกิน 480 คำ`

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
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error?.message || `API Error ${res.status}`) }
      const data = await res.json()
      const resultText = data.content[0].text.trim()
      setAiResult(resultText)
      setDone(true)
      saveRecord(resultText)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative">
          <h2 className="font-black text-base">แบบประเมินสุขภาพ 5 ด้าน</h2>
          <p className="text-purple-200 text-xs mt-0.5">ตามหลัก WHO สำหรับวัยรุ่น 12–18 ปี · 15 ข้อ 5 ด้าน</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {DIMENSIONS.map(d => (
              <span key={d.id} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                {d.emoji} {d.label.replace('ด้าน', '').trim()}
              </span>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-purple-200">
              <span>ตอบแล้ว {answered}/15 ข้อ</span>
              {answered > 0 && <span className="font-bold text-white">คะแนนสะสม {total}/75</span>}
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Score legend */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SCORE_LABELS.map((l, i) => (
          <div key={i} className="flex-1 min-w-0 text-center bg-slate-50 rounded-xl py-1.5 px-1">
            <p className="text-xs font-black text-slate-700">{i + 1}</p>
            <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Questions — grouped by dimension */}
      <div className="space-y-4">
        {DIMENSIONS.map((dim, di) => {
          const dimAnswered = answers.slice(di * 3, di * 3 + 3).filter(v => v > 0).length
          const sc = dimScores[di]
          const lv = getDimLevel(sc)
          return (
            <div key={dim.id} className={`rounded-2xl border ${dim.border} overflow-hidden`}>
              {/* Dimension header */}
              <div className={`${dim.head} px-4 py-2.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dim.emoji}</span>
                  <div>
                    <p className="font-black text-white text-sm">{dim.label}</p>
                    <p className="text-white/70 text-[10px]">{dim.ref}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-[10px]">{dimAnswered}/3 ข้อ</p>
                  {dimAnswered === 3 && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${lv.bg} ${lv.color}`}>{sc}/15 · {lv.label}</span>
                  )}
                </div>
              </div>
              {/* Questions */}
              <div className={`${dim.bg} divide-y divide-white/60`}>
                {dim.questions.map((q, qi) => {
                  const i = di * 3 + qi
                  const picked = answers[i]
                  return (
                    <div key={qi} className="px-4 py-3.5 bg-white/80">
                      <p className="text-sm font-medium text-slate-700 mb-3 leading-relaxed">
                        <span className={`${dim.color} font-black mr-1.5`}>{i + 1}.</span>{q}
                      </p>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v}
                            onClick={() => setAnswers(prev => prev.map((a, idx) => idx === i ? v : a))}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                              picked === v
                                ? `${dim.head} text-white shadow-md`
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {picked > 0 && (
                        <p className={`text-[10px] ${dim.color} font-semibold mt-1.5 text-right`}>{SCORE_LABELS[picked - 1]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Risk summary */}
      {allDone && (
        <div className={`rounded-2xl border ${risk.border} ${risk.bg} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">คะแนนรวมสุขภาพ 5 ด้าน</p>
              <p className={`text-3xl font-black mt-0.5 ${risk.color}`}>
                {total} <span className="text-base font-normal text-slate-400">/ 75</span>
              </p>
            </div>
            <span className={`inline-block px-4 py-2 rounded-2xl font-bold text-sm ${risk.color} bg-white/70 border ${risk.border}`}>
              {risk.label}
            </span>
          </div>
          {/* Per-dimension mini bars */}
          <div className="space-y-1.5">
            {DIMENSIONS.map((dim, di) => {
              const sc = dimScores[di]
              const lv = getDimLevel(sc)
              const pct = (sc / 15) * 100
              return (
                <div key={dim.id} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{dim.emoji}</span>
                  <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct <= 40 ? '#10b981' : pct <= 67 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className={`text-[10px] font-bold w-16 text-right ${lv.color}`}>{sc}/15 {lv.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Analyze button */}
      {!done && (
        <button onClick={analyze} disabled={!allDone || loading}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI กำลังวิเคราะห์...</>
            : <>🔍 วิเคราะห์สาเหตุด้วย AI</>}
        </button>
      )}

      {!allDone && answered > 0 && (
        <p className="text-center text-xs text-slate-400">ตอบให้ครบ {15 - answered} ข้อที่เหลือเพื่อวิเคราะห์</p>
      )}

      {/* AI Result */}
      {done && aiResult && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-purple-100">
          {/* Card header */}
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="font-bold text-white text-sm">ผลการวิเคราะห์โดย AI</p>
                <p className="text-purple-200 text-[10px]">อ้างอิงมาตรฐาน WHO • {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            {saved && (
              <span className="text-[10px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                ✓ บันทึกแล้ว
              </span>
            )}
          </div>
          {/* WHO badge */}
          <div className="bg-purple-50 border-b border-purple-100 px-5 py-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-purple-600 bg-white border border-purple-200 px-2 py-0.5 rounded-full">WHO Adolescent Health</span>
            <span className="text-[10px] text-purple-400">12–18 ปี · กระทรวงสาธารณสุข · วิเคราะห์เฉพาะบุคคล</span>
          </div>
          {/* Content */}
          <div className="bg-white px-5 py-4 space-y-0.5">
            {renderMarkdown(aiResult)}
          </div>
          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">* ไม่ใช่คำวินิจฉัยทางการแพทย์</p>
            <button onClick={() => { setDone(false); setAiResult(''); setSaved(false) }}
              className="text-xs text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1">
              <RefreshCw size={11} /> วิเคราะห์ใหม่
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📋</span>
              <p className="text-sm font-bold text-slate-600">ประวัติการประเมิน</p>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{history.length}</span>
            </div>
            {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {showHistory && (
            <div className="px-4 pb-4 space-y-3">
              {history.map(rec => {
                const r = getRiskLevel(rec.total)
                const d = new Date(rec.date)
                const dateStr = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                const timeStr = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                return (
                  <HistoryCard key={rec.id} rec={rec} r={r} dateStr={dateStr} timeStr={timeStr} />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryCard({ rec, r, dateStr, timeStr }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border ${r.border} overflow-hidden`}>
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 ${r.bg}`}>
        <div className="flex items-center gap-2 text-left">
          <div>
            <p className="text-xs font-bold text-slate-700">{dateStr} · {timeStr}</p>
            <p className="text-[10px] text-slate-500">BMI {rec.bmi} · {rec.category} · คะแนน {rec.total}/75</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 ${r.color}`}>{r.label}</span>
          {open ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
        </div>
      </button>
      {open && rec.aiResult && (
        <div className="px-3 pb-3 pt-2 bg-white border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 mb-2">ผลวิเคราะห์ AI (อ้างอิง WHO)</p>
          <div className="space-y-0.5">{renderMarkdown(rec.aiResult)}</div>
        </div>
      )}
    </div>
  )
}

function getBmiAdvice(lang) {
  if (lang === 'en') {
    return {
      underweight: {
        title: 'Underweight — Needs Attention',
        icon: '⚠️', headerBg: 'bg-indigo-600', cardBg: 'bg-indigo-50', border: 'border-indigo-200',
        sections: [
          { icon: '🍱', title: 'Nutrition', bg: 'bg-white', border: 'border-indigo-100', items: ['Add quality calories: nuts, avocado, oats, sesame', 'Eat 3–5 small meals/day in addition to main meals', 'Focus on high protein: eggs, dairy, fish, lean meat, soy', 'Add healthy fats: olive oil, salmon, pumpkin seeds'] },
          { icon: '💪', title: 'Exercise', bg: 'bg-white', border: 'border-indigo-100', items: ['Resistance / light weight training 2–3x/week to build muscle', 'Avoid heavy cardio that burns too many calories', 'Exercise 1 hour after meals for better nutrient absorption'] },
          { icon: '👨‍⚕️', title: 'Medical Advice', bg: 'bg-indigo-100', border: 'border-indigo-200', items: ['See a doctor to investigate the cause of low weight', 'Check blood work, vitamins, and essential nutrients', 'Consult a nutritionist for a personalized meal plan'] },
        ],
        goal: 'Goal: Gain 0.3–0.5 kg/week gradually',
        goalColor: 'text-indigo-700 bg-indigo-100',
      },
      overweight: {
        title: 'Overweight — Improvable',
        icon: '💛', headerBg: 'bg-orange-500', cardBg: 'bg-orange-50', border: 'border-orange-200',
        sections: [
          { icon: '🥗', title: 'Adjust Diet', bg: 'bg-white', border: 'border-orange-100', items: ['Reduce refined carbs, sugar, fried food, and sugary drinks', 'Add vegetables, protein, and fiber to stay full longer', 'Drink 1–2 glasses of water 15 minutes before meals', 'Eat slowly and chew thoroughly 20–30 times per bite'] },
          { icon: '🏃', title: 'Exercise', bg: 'bg-white', border: 'border-orange-100', items: ['150 min/week cardio: brisk walk, run, cycling', 'Add strength training 2x/week for long-term metabolism boost', 'Add daily activity: take stairs, park farther away'] },
          { icon: '📊', title: 'Track Progress', bg: 'bg-white', border: 'border-orange-100', items: ['Log your food daily to see patterns clearly', 'Weigh weekly at the same time — morning after waking', 'Also measure waist circumference (target < 80 cm women / < 90 cm men)'] },
        ],
        goal: 'Goal: Lose 0.5 kg/week through lifestyle changes',
        goalColor: 'text-orange-700 bg-orange-100',
      },
      obese: {
        title: 'Obese — Urgent Care Needed',
        icon: '🚨', headerBg: 'bg-red-600', cardBg: 'bg-red-50', border: 'border-red-200',
        sections: [
          { icon: '🥗', title: 'Adjust Diet Now', bg: 'bg-white', border: 'border-red-100', items: ['Reduce 300–500 kcal/day (do not completely skip meals)', 'Avoid all fried food, sugar, refined carbs, and sugary drinks', 'Add leafy greens, lean protein, and fiber', 'Eat breakfast daily to prevent overeating later'] },
          { icon: '🚶', title: 'Safe Exercise', bg: 'bg-white', border: 'border-red-100', items: ['Start with 20–30 min walks/day, low joint impact', 'Swimming or cycling are excellent for heavier individuals', 'Gradually increase intensity — do not overdo it at first'] },
          { icon: '🏥', title: 'See a Doctor (Important)', bg: 'bg-red-100', border: 'border-red-300', items: ['Screen for diabetes, hypertension, and high cholesterol', 'Always consult a doctor before starting a weight-loss program', 'May need a nutritionist and physiotherapist', 'In some cases, additional medical treatments may be considered'] },
        ],
        goal: 'Goal: Lose 5–10% of body weight within 6 months to significantly reduce chronic disease risk',
        goalColor: 'text-red-700 bg-red-100',
      },
    }
  }
  return {
    underweight: {
      title: 'น้ำหนักน้อยกว่าเกณฑ์ — ต้องการความใส่ใจ',
      icon: '⚠️', headerBg: 'bg-indigo-600', cardBg: 'bg-indigo-50', border: 'border-indigo-200',
      sections: [
        { icon: '🍱', title: 'อาหารและโภชนาการ', bg: 'bg-white', border: 'border-indigo-100', items: ['เพิ่มแคลอรี่จากอาหารคุณภาพ เช่น ถั่ว อะโวคาโด ข้าวโอ๊ต งา', 'กินมื้อย่อย 3–5 ครั้ง/วัน เพิ่มเติมจากมื้อหลัก', 'เน้นโปรตีนสูง เช่น ไข่ นม ปลา เนื้อไม่ติดมัน ถั่วเหลือง', 'เพิ่มไขมันดี เช่น น้ำมันมะกอก ปลาแซลมอน เมล็ดฟักทอง'] },
        { icon: '💪', title: 'การออกกำลังกาย', bg: 'bg-white', border: 'border-indigo-100', items: ['ฝึก Resistance Training / ยกน้ำหนักเบา 2–3 ครั้ง/สัปดาห์ เพิ่มมวลกล้ามเนื้อ', 'หลีกเลี่ยง Cardio หนักๆ ที่เผาผลาญแคลอรี่มากเกินไป', 'ออกกำลังกายหลังอาหาร 1 ชั่วโมง เพื่อให้ร่างกายดูดซึมได้ดี'] },
        { icon: '👨‍⚕️', title: 'คำแนะนำทางการแพทย์', bg: 'bg-indigo-100', border: 'border-indigo-200', items: ['พบแพทย์เพื่อตรวจหาสาเหตุที่น้ำหนักต่ำกว่าเกณฑ์', 'ตรวจค่าเลือด วิตามิน และธาตุอาหารที่จำเป็น', 'ปรึกษานักโภชนาการเพื่อวางแผนอาหารเฉพาะบุคคล'] },
      ],
      goal: 'เป้าหมาย: เพิ่มน้ำหนัก 0.3–0.5 kg/สัปดาห์ อย่างค่อยเป็นค่อยไป',
      goalColor: 'text-indigo-700 bg-indigo-100',
    },
    overweight: {
      title: 'น้ำหนักเกิน — สามารถปรับปรุงได้',
      icon: '💛', headerBg: 'bg-orange-500', cardBg: 'bg-orange-50', border: 'border-orange-200',
      sections: [
        { icon: '🥗', title: 'ปรับอาหาร', bg: 'bg-white', border: 'border-orange-100', items: ['ลดแป้งขัดสี น้ำตาล ของทอด และเครื่องดื่มหวาน', 'เพิ่มผัก โปรตีน และใยอาหาร ทำให้อิ่มนานขึ้น', 'ดื่มน้ำเปล่า 1–2 แก้วก่อนอาหาร 15 นาที', 'กินช้าๆ เคี้ยวให้ละเอียด 20–30 ครั้ง/คำ'] },
        { icon: '🏃', title: 'การออกกำลังกาย', bg: 'bg-white', border: 'border-orange-100', items: ['Cardio 150 นาที/สัปดาห์ เช่น เดินเร็ว วิ่ง ปั่นจักรยาน', 'เพิ่ม Strength Training 2 ครั้ง/สัปดาห์ ช่วยเผาผลาญระยะยาว', 'เพิ่มกิจกรรมในชีวิตประจำวัน เช่น เดินขึ้นบันได จอดรถห่างขึ้น'] },
        { icon: '📊', title: 'ติดตามผล', bg: 'bg-white', border: 'border-orange-100', items: ['บันทึกอาหารที่กินทุกวัน ช่วยให้เห็นพฤติกรรมชัดเจนขึ้น', 'ชั่งน้ำหนักทุกสัปดาห์ในเวลาเดียวกัน เช้าหลังตื่นนอน', 'วัด Waist Circumference ร่วมด้วย (ควร < 80 cm หญิง / < 90 cm ชาย)'] },
      ],
      goal: 'เป้าหมาย: ลดน้ำหนัก 0.5 kg/สัปดาห์ ด้วยการปรับพฤติกรรม',
      goalColor: 'text-orange-700 bg-orange-100',
    },
    obese: {
      title: 'โรคอ้วน — ต้องการการดูแลเร่งด่วน',
      icon: '🚨', headerBg: 'bg-red-600', cardBg: 'bg-red-50', border: 'border-red-200',
      sections: [
        { icon: '🥗', title: 'ปรับอาหารทันที', bg: 'bg-white', border: 'border-red-100', items: ['ลดแคลอรี่ลง 300–500 kcal/วัน (ไม่ควรอดอาหารอย่างสิ้นเชิง)', 'หลีกเลี่ยงอาหารทอด น้ำตาล แป้งขัดสี และเครื่องดื่มหวานทุกชนิด', 'เพิ่มผักใบเขียว โปรตีนไม่ติดมัน และใยอาหาร', 'กินอาหารเช้าทุกวัน ป้องกันการกินมากเกินในมื้อถัดไป'] },
        { icon: '🚶', title: 'ออกกำลังกายแบบปลอดภัย', bg: 'bg-white', border: 'border-red-100', items: ['เริ่มด้วยการเดิน 20–30 นาที/วัน ลดแรงกระแทกต่อข้อเข่า', 'ว่ายน้ำหรือปั่นจักรยาน เป็นตัวเลือกที่ดีมากสำหรับผู้มีน้ำหนักมาก', 'ค่อยๆ เพิ่มความเข้มข้น อย่าหักโหมในช่วงแรก'] },
        { icon: '🏥', title: 'ต้องพบแพทย์ (สำคัญมาก)', bg: 'bg-red-100', border: 'border-red-300', items: ['ตรวจคัดกรองเบาหวาน ความดันโลหิตสูง และไขมันในเลือด', 'ปรึกษาแพทย์ก่อนเริ่มโปรแกรมลดน้ำหนักทุกครั้ง', 'อาจต้องร่วมกับนักโภชนาการและนักกายภาพบำบัด', 'ในบางกรณีแพทย์อาจพิจารณาการรักษาเพิ่มเติม'] },
      ],
      goal: 'เป้าหมาย: ลดน้ำหนัก 5–10% ภายใน 6 เดือน ลดความเสี่ยงโรคเรื้อรังได้มาก',
      goalColor: 'text-red-700 bg-red-100',
    },
  }
}

function BmiRecommendations({ bmi, lang }) {
  const [open, setOpen] = useState(true)
  const type = bmi >= 30 ? 'obese' : bmi >= 25 ? 'overweight' : bmi < 18.5 ? 'underweight' : null
  if (!type) return null
  const advice = getBmiAdvice(lang)[type]

  return (
    <div className={`rounded-3xl overflow-hidden border ${advice.border} shadow-sm`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 ${advice.headerBg} text-white`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{advice.icon}</span>
          <span className="font-bold text-sm">{advice.title}</span>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className={`${advice.cardBg} p-4 space-y-3`}>
          {advice.sections.map(sec => (
            <div key={sec.title} className={`rounded-2xl border ${sec.border} ${sec.bg} p-4`}>
              <p className="font-bold text-slate-700 text-sm mb-2.5 flex items-center gap-1.5">
                <span>{sec.icon}</span>{sec.title}
              </p>
              <ul className="space-y-1.5">
                {sec.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${advice.goalColor}`}>
            🎯 {advice.goal}
          </div>
        </div>
      )}
    </div>
  )
}

function BmiGauge({ bmi, zones }) {
  const clampedBmi = Math.max(10, Math.min(40, bmi))
  const pct = ((clampedBmi - 10) / 30) * 100
  const colors = ['#818cf8', '#34D399', '#FBBF24', '#F97316', '#EF4444']
  const widths = [28.3, 15, 6.7, 16.7, 33.3]

  return (
    <div className="mt-4">
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {zones.map((label, i) => (
          <div key={label} className="h-full rounded-sm" style={{ width: `${widths[i]}%`, backgroundColor: colors[i] }} />
        ))}
      </div>
      <div className="relative mt-1">
        <div className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${pct}%` }}>
          <div className="w-3 h-3 bg-slate-800 rounded-full border-2 border-white shadow" />
          <div className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-lg mt-1 whitespace-nowrap">
            BMI {bmi}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-8 text-xs text-slate-400">
        {zones.map(z => (
          <span key={z} className="text-center">{z}</span>
        ))}
      </div>
    </div>
  )
}

function IdealWeightCard({ height, t }) {
  const b = t.bmi
  const minWeight = (18.5 * Math.pow(height / 100, 2)).toFixed(1)
  const maxWeight = (22.9 * Math.pow(height / 100, 2)).toFixed(1)
  return (
    <div className="bg-indigo-50 rounded-2xl p-4">
      <p className="text-sm font-semibold text-indigo-800 mb-1">{b.idealTitle}</p>
      <p className="text-xl font-black text-indigo-700">{minWeight} – {maxWeight} kg</p>
      <p className="text-xs text-indigo-500 mt-1">{b.idealFor.replace('{h}', height)}</p>
    </div>
  )
}

function getNextMonthDate(lang) {
  const d = new Date()
  const locale = lang === 'en' ? 'en-US' : 'th-TH'
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
    .toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BMI() {
  const { saveBmi, bmiData } = useHealth()
  const { t, lang } = useLang()
  const b = t.bmi

  const [height, setHeight] = useState(165)
  const [weight, setWeight] = useState(60)
  const [result, setResult] = useState(null)
  const [pointsEarned, setPointsEarned] = useState(null)

  useEffect(() => {
    if (bmiData) setResult(bmiData)
  }, [])

  const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  const alreadyEarnedThisMonth = bmiData?.lastBmiPointsMonth === currentMonthKey

  function calculate() {
    const bmiVal = +(weight / Math.pow(height / 100, 2)).toFixed(1)
    const cat    = getBmiCategory(bmiVal)
    const score  = calcBmiScore(bmiVal)
    const res    = { bmi: bmiVal, category: cat.label, advice: cat.advice, color: cat.color, bg: cat.bg, score, height, weight }
    setResult(res)
    setPointsEarned(saveBmi(res))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
          <Scale size={22} className="text-yellow-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{b.title}</h1>
          <p className="text-xs text-slate-500">{b.subtitle}</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-50 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">{b.heightLabel}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={100} max={220} value={height} onChange={e => setHeight(+e.target.value)} className="flex-1 accent-indigo-600" />
            <div className="w-20">
              <input type="number" value={height} onChange={e => setHeight(+e.target.value)}
                className="w-full text-center border-2 border-indigo-100 rounded-xl py-2 font-bold text-indigo-700 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">{b.weightLabel}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={30} max={150} value={weight} onChange={e => setWeight(+e.target.value)} className="flex-1 accent-indigo-600" />
            <div className="w-20">
              <input type="number" value={weight} onChange={e => setWeight(+e.target.value)}
                className="w-full text-center border-2 border-indigo-100 rounded-xl py-2 font-bold text-indigo-700 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {alreadyEarnedThisMonth ? (
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500">
            <Clock size={16} className="text-slate-400 flex-shrink-0" />
            <span>{b.waitUntil} <span className="font-semibold text-slate-700">{getNextMonthDate(lang)}</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
            <Star size={16} className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
            <span>{b.points15}</span>
          </div>
        )}

        <button onClick={calculate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors">
          <Scale size={18} />
          {b.calcBtn}
        </button>
      </div>

      {/* Points banner */}
      {pointsEarned === true && (
        <div className="flex items-center gap-3 bg-yellow-400 rounded-2xl px-4 py-3 shadow-md shadow-yellow-200 animate-bounce">
          <Star size={22} className="text-yellow-900 fill-yellow-700 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-900">{b.earnedPoints}</p>
            <p className="text-yellow-800 text-xs">{b.earnedSub}</p>
          </div>
        </div>
      )}
      {pointsEarned === false && (
        <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-4 py-3 text-slate-500 text-sm">
          <Clock size={18} className="flex-shrink-0" />
          <span>{b.noExtraPts} <span className="font-semibold text-slate-700">{getNextMonthDate(lang)}</span></span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-slide-up space-y-4">
          <div className={`${result.bg} rounded-3xl p-5`}>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <ScoreRing score={result.score} size={100} strokeWidth={9}
                  color={result.color?.includes('emerald') ? '#10B981' : result.color?.includes('yellow') ? '#D97706' : result.color?.includes('red') ? '#DC2626' : '#F97316'} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{result.bmi}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">{b.analysisLabel}</p>
                <p className={`text-xl font-black ${result.color}`}>{result.category}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.advice}</p>
              </div>
            </div>
            <BmiGauge bmi={result.bmi} zones={b.gaugeZones} />
          </div>

          <IdealWeightCard height={result.height} t={t} />

          <BmiRecommendations bmi={result.bmi} lang={lang} />

          <ObesityAssessment
            bmi={result.bmi}
            weight={result.weight}
            height={result.height}
            category={result.category}
          />

          {/* BMI Reference Table */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50">
            <p className="text-sm font-bold text-slate-700 mb-3">{b.tableTitle}</p>
            <div className="space-y-2">
              {[
                { range: '< 18.5',      color: 'bg-indigo-100 text-indigo-700'    },
                { range: '18.5 – 22.9', color: 'bg-emerald-100 text-emerald-700' },
                { range: '23 – 24.9',   color: 'bg-yellow-100 text-yellow-700'  },
                { range: '25 – 29.9',   color: 'bg-orange-100 text-orange-700'  },
                { range: '≥ 30',        color: 'bg-red-100 text-red-700'       },
              ].map((row, i) => (
                <div key={row.range} className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                  row.range.includes(result.bmi.toString().split('.')[0]) || (result.bmi >= 30 && row.range.includes('30'))
                    ? 'ring-2 ring-indigo-400' : ''
                } ${row.color}`}>
                  <span className="font-semibold text-sm">{row.range}</span>
                  <span className="text-sm">{b.tableRows[i].label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setResult(null)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-indigo-100 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors">
            <RefreshCw size={16} />
            {b.recalc}
          </button>
        </div>
      )}
    </div>
  )
}
