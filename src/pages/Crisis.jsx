import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Phone } from 'lucide-react'

// ── 2Q แบบคัดกรองโรคซึมเศร้า ──────────────────────────────────────────────
const TWO_Q = [
  'ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ ท่านรู้สึก หดหู่ เศร้า หรือท้อแท้สิ้นหวัง หรือไม่',
  'ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ท่านรู้สึก เบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือไม่',
]

// ── 9Q แบบประเมินโรคซึมเศร้า ──────────────────────────────────────────────
const NINE_Q = [
  'เบื่อ ไม่สนใจอยากทำอะไร',
  'ไม่สบายใจ ซึมเศร้า ท้อแท้',
  'หลับยากหรือหลับๆ ตื่นๆ หรือหลับมากไป',
  'เหนื่อยง่ายหรือไม่ค่อยมีแรง',
  'เบื่ออาหารหรือกินมากเกินไป',
  'รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลวหรือครอบครัวผิดหวัง',
  'สมาธิไม่ดี เวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ หรือทำงานที่ต้องใช้ความตั้งใจ',
  'พูดช้า ทำอะไรช้าลงจนคนอื่นสังเกตเห็นได้ หรือกระสับกระส่ายไม่สามารถอยู่นิ่งได้เหมือนที่เคยเป็น',
  'คิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปคงจะดี',
]
const NINE_LABELS = ['ไม่มีเลย', 'เป็นบางวัน\n(1-7 วัน)', 'เป็นบ่อย\n(>7 วัน)', 'เป็นทุกวัน']

function get9QLevel(score) {
  if (score < 7)  return { label: 'ไม่มีอาการหรือน้อยมาก', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', emoji: '😊' }
  if (score <= 12) return { label: 'อาการน้อย',             color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-300',  emoji: '🟡' }
  if (score <= 18) return { label: 'อาการปานกลาง',          color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-300',  emoji: '🟠' }
  return               { label: 'อาการรุนแรง',            color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-300',     emoji: '🚨' }
}

// ── 8Q แบบประเมินการฆ่าตัวตาย ────────────────────────────────────────────
const EIGHT_Q = [
  { q: 'คิดอยากตาย หรือ คิดว่าตายไปจะดีกว่า',                                              pts: 1 },
  { q: 'อยากทำร้ายตัวเอง หรือ ทำให้ตัวเองบาดเจ็บ',                                         pts: 2 },
  { q: 'คิดเกี่ยวกับการฆ่าตัวตาย',                                                          pts: 6, hasSub: true },
  { q: 'มีแผนการที่จะฆ่าตัวตาย',                                                            pts: 8 },
  { q: 'ได้เตรียมการที่จะทำร้ายตนเองหรือเตรียมการจะฆ่าตัวตายโดยตั้งใจว่าจะให้ตายจริงๆ',   pts: 9 },
  { q: 'ได้ทำให้ตนเองบาดเจ็บแต่ไม่ตั้งใจที่จะทำให้เสียชีวิต',                              pts: 4 },
  { q: 'ได้พยายามฆ่าตัวตายโดยคาดหวัง/ตั้งใจที่จะให้ตาย',                                   pts: 10 },
  { q: 'ท่านเคยพยายามฆ่าตัวตาย',                                                            pts: 4, lifetime: true },
]

function calc8QScore(answers) {
  let total = 0
  answers.forEach((a, i) => {
    if (!a.yes) return
    total += EIGHT_Q[i].pts
    if (i === 2 && a.yes && !a.canControl) total += 8
  })
  return total
}

function get8QLevel(score) {
  if (score === 0) return { label: 'ไม่มีแนวโน้มฆ่าตัวตายในปัจจุบัน', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', emoji: '✅', urgent: false }
  if (score <= 8)  return { label: 'มีแนวโน้มระดับน้อย',               color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-300',  emoji: '🟡', urgent: false }
  if (score <= 16) return { label: 'มีแนวโน้มระดับปานกลาง',            color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-300',  emoji: '⚠️', urgent: false }
  return               { label: 'มีแนวโน้มระดับรุนแรง',             color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-300',     emoji: '🚨', urgent: true  }
}

// ── Helper components ──────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>ข้อที่ {current} / {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  )
}

// ── Guide screen ──────────────────────────────────────────────────────────
function GuideScreen({ onStart }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-8 space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🧠</span>
        </div>
        <h1 className="text-xl font-extrabold text-purple-800 leading-snug">
          คู่มือวิทยากรหลักสูตร<br/>การช่วยเหลือผู้ประสบภาวะวิกฤต
        </h1>
        <p className="text-slate-500 text-sm mt-1">เครื่องมือคัดกรองสุขภาพจิต · กรมสุขภาพจิต กระทรวงสาธารณสุข</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <p className="font-bold text-slate-700 text-sm mb-1">📋 ขั้นตอนการคัดกรอง 3 ระยะ</p>
        {[
          { step: '2Q', title: 'แบบคัดกรองโรคซึมเศร้า', desc: '2 คำถาม · ใช่/ไม่ใช่', color: 'bg-blue-500' },
          { step: '9Q', title: 'แบบประเมินโรคซึมเศร้า', desc: '9 คำถาม · 0–3 คะแนน', color: 'bg-purple-500' },
          { step: '8Q', title: 'แบบประเมินการฆ่าตัวตาย', desc: '8 คำถาม · น้ำหนักเฉพาะ (ทำเมื่อ 9Q ≥ 7)', color: 'bg-red-500' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
              {s.step}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{s.title}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700">คำแนะนำสำหรับวิทยากร</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
            สอบถามด้วยท่าทีเป็นมิตร เปิดเผย ไม่ตัดสิน ให้ผู้รับการประเมินตอบตามความรู้สึกจริง ในช่วง 2 สัปดาห์ที่ผ่านมา
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-purple-700 mb-1">📞 สายด่วนกรมสุขภาพจิต</p>
        <p className="text-2xl font-black text-purple-800">1323</p>
        <p className="text-xs text-purple-500">ตลอด 24 ชั่วโมง</p>
      </div>

      <button onClick={onStart}
        className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-md transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
        เริ่มคัดกรอง 2Q
      </button>
    </div>
  )
}

// ── 2Q Screen ─────────────────────────────────────────────────────────────
function TwoQScreen({ answers, onChange, onSubmit }) {
  const allAnswered = answers.every(a => a !== null)
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-8 space-y-5">
      <div className="bg-blue-600 rounded-3xl p-5 text-white">
        <p className="text-blue-100 text-xs">ขั้นตอนที่ 1/3</p>
        <h2 className="font-black text-lg mt-0.5">แบบคัดกรองโรคซึมเศร้า 2 คำถาม</h2>
        <p className="text-blue-100 text-xs mt-1">(2Q) · กรมสุขภาพจิต กระทรวงสาธารณสุข</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
        <p className="text-sm text-blue-700 font-medium">
          ใน <strong>2 สัปดาห์ที่ผ่านมา</strong> รวมวันนี้ ท่านมีอาการต่อไปนี้หรือไม่
        </p>
      </div>

      <div className="space-y-4">
        {TWO_Q.map((q, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
            </div>
            <div className="flex gap-3">
              {[{ val: true, label: 'มี', cls: 'bg-red-500' }, { val: false, label: 'ไม่มี', cls: 'bg-emerald-500' }].map(opt => (
                <button key={String(opt.val)}
                  onClick={() => onChange(i, opt.val)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    answers[i] === opt.val ? `${opt.cls} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onSubmit} disabled={!allAnswered}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] ${
          allAnswered ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}>
        ดูผลการคัดกรอง 2Q
      </button>
    </div>
  )
}

// ── 9Q Screen ─────────────────────────────────────────────────────────────
function NineQScreen({ answers, onChange, onSubmit }) {
  const answered = answers.filter(v => v >= 0).length
  const allAnswered = answered === 9
  const currentScore = answers.reduce((s, v) => s + Math.max(0, v), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-8 space-y-5">
      <div className="bg-purple-600 rounded-3xl p-5 text-white">
        <p className="text-purple-100 text-xs">ขั้นตอนที่ 2/3</p>
        <h2 className="font-black text-lg mt-0.5">แบบประเมินโรคซึมเศร้า 9 คำถาม</h2>
        <p className="text-purple-100 text-xs mt-1">(9Q) · กรมสุขภาพจิต กระทรวงสาธารณสุข</p>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-purple-200">
            <span>ตอบแล้ว {answered}/9 ข้อ</span>
            {answered > 0 && <span className="font-bold text-white">คะแนน {currentScore}/27</span>}
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(answered / 9) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3">
        <p className="text-sm text-purple-700 font-medium">
          ใน <strong>2 สัปดาห์ที่ผ่านมา</strong> รวมวันนี้ ท่านมีอาการเหล่านี้บ่อยแค่ไหน
        </p>
      </div>

      {/* Scale guide */}
      <div className="bg-white rounded-xl border border-slate-100 px-3 py-2 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {NINE_LABELS.map((l, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mx-auto text-sm font-black text-purple-700">{i}</div>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight whitespace-pre-line">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {NINE_Q.map((q, i) => {
          const picked = answers[i]
          const isLast = i === 8
          return (
            <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border ${isLast ? 'border-red-200' : 'border-slate-100'}`}>
              <div className="flex gap-2 mb-3">
                <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${isLast ? 'bg-red-500' : 'bg-purple-500'}`}>
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(v => (
                  <button key={v}
                    onClick={() => onChange(i, v)}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      picked === v
                        ? isLast ? 'bg-red-500 text-white shadow-md' : 'bg-purple-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
              {picked >= 0 && (
                <p className={`text-[10px] font-semibold mt-1.5 text-right ${isLast ? 'text-red-500' : 'text-purple-600'}`}>
                  {NINE_LABELS[picked].replace('\n', ' ')}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={onSubmit} disabled={!allAnswered}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] ${
          allAnswered ? 'bg-purple-600 hover:bg-purple-700 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}>
        ดูผลการประเมิน 9Q
      </button>
    </div>
  )
}

// ── 8Q Screen ─────────────────────────────────────────────────────────────
function EightQScreen({ answers, onChange, onSubChange, onSubmit }) {
  const allAnswered = answers.every((a, i) => {
    if (a.yes === null) return false
    if (i === 2 && a.yes && a.canControl === null) return false
    return true
  })
  const score = calc8QScore(answers)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 md:pb-8 space-y-5">
      <div className="bg-red-600 rounded-3xl p-5 text-white">
        <p className="text-red-100 text-xs">ขั้นตอนที่ 3/3</p>
        <h2 className="font-black text-lg mt-0.5">แบบประเมินการฆ่าตัวตาย 8 คำถาม</h2>
        <p className="text-red-100 text-xs mt-1">(8Q) · กรมสุขภาพจิต กระทรวงสาธารณสุข</p>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700 font-medium">
          ใน <strong>1 เดือนที่ผ่านมา</strong> รวมวันนี้ (ยกเว้น ข้อ 8)
        </p>
      </div>

      <div className="space-y-4">
        {EIGHT_Q.map((item, i) => {
          const a = answers[i]
          const pickedYes = a.yes
          return (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-red-100">
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1">
                    {item.lifetime && <p className="text-[10px] text-slate-400 font-semibold mb-0.5">📅 ตลอดชีวิตที่ผ่านมา</p>}
                    <p className="text-sm text-slate-700 leading-relaxed">{item.q}</p>
                    <p className="text-[10px] text-red-400 mt-0.5">มี = {item.pts} คะแนน{item.hasSub ? ' (อาจมีคะแนนเพิ่ม)' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {[{ val: true, label: 'มี', cls: 'bg-red-500' }, { val: false, label: 'ไม่มี', cls: 'bg-slate-400' }].map(opt => (
                    <button key={String(opt.val)}
                      onClick={() => onChange(i, opt.val)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        pickedYes === opt.val ? `${opt.cls} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sub-question for Q3 */}
              {i === 2 && pickedYes === true && (
                <div className="border-t border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-semibold text-red-600 mb-2 leading-relaxed">
                    ↳ ท่านสามารถควบคุมความอยากฆ่าตัวตายที่ท่านคิดอยู่นั้นได้ หรือบอกได้ไหมว่าคงจะไม่ทำตามความคิดนั้นในขณะนี้?
                  </p>
                  <p className="text-[10px] text-red-400 mb-2">ควบคุมไม่ได้ = +8 คะแนน</p>
                  <div className="flex gap-3">
                    {[{ val: true, label: 'ได้ (0)', cls: 'bg-emerald-500' }, { val: false, label: 'ไม่ได้ (+8)', cls: 'bg-red-600' }].map(opt => (
                      <button key={String(opt.val)}
                        onClick={() => onSubChange(opt.val)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                          a.canControl === opt.val ? `${opt.cls} text-white shadow-md` : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allAnswered && (
        <div className="bg-white rounded-2xl border border-red-200 p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500">คะแนนความเสี่ยงรวม</p>
            <p className="text-3xl font-black text-red-600 mt-0.5">{score} <span className="text-base font-normal text-slate-400">คะแนน</span></p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${get8QLevel(score).bg} ${get8QLevel(score).color} border ${get8QLevel(score).border}`}>
            {get8QLevel(score).label}
          </span>
        </div>
      )}

      <button onClick={onSubmit} disabled={!allAnswered}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] ${
          allAnswered ? 'bg-red-600 hover:bg-red-700 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}>
        ดูผลการประเมิน 8Q
      </button>
    </div>
  )
}

// ── Result Screen ─────────────────────────────────────────────────────────
function ResultScreen({ twoQ, nineQ, eightQ, onReset }) {
  const twoQPositive = twoQ.some(a => a === true)
  const nineQScore  = nineQ ? nineQ.reduce((s, v) => s + Math.max(0, v), 0) : null
  const eightQScore = eightQ ? calc8QScore(eightQ) : null
  const nineLevel   = nineQScore !== null ? get9QLevel(nineQScore) : null
  const eightLevel  = eightQScore !== null ? get8QLevel(eightQScore) : null

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-10 space-y-5">
      <h1 className="text-xl font-extrabold text-slate-800">ผลการคัดกรองสุขภาพจิต</h1>

      {/* 2Q Result */}
      <div className={`rounded-2xl border p-4 ${twoQPositive ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm">2Q</div>
          <div>
            <p className="text-xs text-slate-500">แบบคัดกรองโรคซึมเศร้า</p>
            <p className={`font-bold text-sm ${twoQPositive ? 'text-red-700' : 'text-emerald-700'}`}>
              {twoQPositive ? '⚠️ มีความเสี่ยง → ประเมินต่อด้วย 9Q' : '✅ ปกติ — ไม่พบความเสี่ยง'}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          {TWO_Q.map((q, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <span className={`font-bold flex-shrink-0 ${twoQ[i] ? 'text-red-500' : 'text-emerald-500'}`}>{twoQ[i] ? 'มี' : 'ไม่มี'}</span>
              <span className="leading-relaxed">{q.slice(0, 40)}...</span>
            </div>
          ))}
        </div>
      </div>

      {/* 9Q Result */}
      {nineLevel && (
        <div className={`rounded-2xl border ${nineLevel.border} ${nineLevel.bg} p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-sm">9Q</div>
            <div>
              <p className="text-xs text-slate-500">แบบประเมินโรคซึมเศร้า</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800">{nineQScore}</span>
                <span className="text-xs text-slate-400">/ 27 คะแนน</span>
              </div>
            </div>
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-xl ${nineLevel.bg} ${nineLevel.color} border ${nineLevel.border}`}>
              {nineLevel.emoji} {nineLevel.label}
            </span>
          </div>
          <div className="mt-2 bg-white/60 rounded-xl p-3 space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 mb-1.5">เกณฑ์การแปรผล</p>
            {[
              { r: '< 7',   l: 'ไม่มีอาการหรือน้อยมาก', active: nineQScore !== null && nineQScore < 7 },
              { r: '7-12',  l: 'อาการน้อย',             active: nineQScore !== null && nineQScore >= 7  && nineQScore <= 12 },
              { r: '13-18', l: 'อาการปานกลาง',          active: nineQScore !== null && nineQScore >= 13 && nineQScore <= 18 },
              { r: '≥ 19',  l: 'อาการรุนแรง',           active: nineQScore !== null && nineQScore >= 19 },
            ].map(row => (
              <div key={row.r} className={`flex gap-2 text-xs py-0.5 rounded ${row.active ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                <span className="w-10 flex-shrink-0">{row.r}</span>
                <span>{row.active ? '▶ ' : ''}{row.l}</span>
              </div>
            ))}
          </div>
          {nineQScore !== null && nineQScore >= 7 && (
            <p className="text-xs text-purple-600 font-semibold mt-2">
              📌 คะแนน ≥ 7 → ประเมินแนวโน้มการฆ่าตัวตายด้วย 8Q
            </p>
          )}
        </div>
      )}

      {/* 8Q Result */}
      {eightLevel && (
        <div className={`rounded-2xl border ${eightLevel.border} ${eightLevel.bg} p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-black text-sm">8Q</div>
            <div>
              <p className="text-xs text-slate-500">แบบประเมินการฆ่าตัวตาย</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800">{eightQScore}</span>
                <span className="text-xs text-slate-400">คะแนน</span>
              </div>
            </div>
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-xl ${eightLevel.bg} ${eightLevel.color} border ${eightLevel.border}`}>
              {eightLevel.emoji} {eightLevel.label}
            </span>
          </div>
          <div className="mt-2 bg-white/60 rounded-xl p-3 space-y-1">
            {[
              { r: '0',    l: 'ไม่มีแนวโน้ม',        active: eightQScore === 0 },
              { r: '1-8',  l: 'แนวโน้มน้อย',         active: eightQScore !== null && eightQScore >= 1  && eightQScore <= 8 },
              { r: '9-16', l: 'แนวโน้มปานกลาง',      active: eightQScore !== null && eightQScore >= 9  && eightQScore <= 16 },
              { r: '≥ 17', l: 'แนวโน้มรุนแรง 🚨',    active: eightQScore !== null && eightQScore >= 17 },
            ].map(row => (
              <div key={row.r} className={`flex gap-2 text-xs py-0.5 rounded ${row.active ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                <span className="w-10 flex-shrink-0">{row.r}</span>
                <span>{row.active ? '▶ ' : ''}{row.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent alert */}
      {eightLevel?.urgent && (
        <div className="bg-red-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-yellow-300" />
            <p className="font-black text-base">ต้องส่งต่อโรงพยาบาลมีจิตแพทย์ด่วน!</p>
          </div>
          <p className="text-red-100 text-sm leading-relaxed mb-4">
            คะแนน 8Q ≥ 17 แสดงถึงความเสี่ยงสูงมาก กรุณาประสานส่งต่อผู้รับการประเมินไปพบจิตแพทย์โดยทันที
          </p>
          <a href="tel:1323" className="flex items-center justify-center gap-2 bg-white text-red-600 font-bold text-base py-3 rounded-xl">
            <Phone size={18} />
            โทร 1323 สายด่วนกรมสุขภาพจิต
          </a>
        </div>
      )}

      {/* Non-urgent guidance */}
      {eightLevel && !eightLevel.urgent && eightQScore !== null && eightQScore > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3">
          <Phone size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700">แนะนำปรึกษาผู้เชี่ยวชาญ</p>
            <p className="text-xs text-orange-600 mt-0.5">สายด่วนกรมสุขภาพจิต <strong>1323</strong> ตลอด 24 ชั่วโมง</p>
          </div>
        </div>
      )}

      {/* Source */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          📚 <span className="font-semibold text-slate-600">แหล่งอ้างอิง:</span> แบบคัดกรอง 2Q, 9Q, 8Q กรมสุขภาพจิต กระทรวงสาธารณสุข · ลิขสิทธิ์เป็นของกรมสุขภาพจิต
        </p>
      </div>

      <button onClick={onReset}
        className="w-full py-3.5 rounded-2xl font-semibold text-white bg-slate-600 hover:bg-slate-700 transition-colors">
        เริ่มการคัดกรองใหม่
      </button>
    </div>
  )
}

// ── Main Crisis component ─────────────────────────────────────────────────
export default function Crisis() {
  const [phase, setPhase] = useState('guide') // guide | 2q | 9q | 8q | result

  const [twoQAnswers,  setTwoQAnswers]  = useState([null, null])
  const [nineQAnswers, setNineQAnswers] = useState(Array(9).fill(-1))
  const [eightQAnswers, setEightQAnswers] = useState(
    Array(8).fill(null).map(() => ({ yes: null, canControl: null }))
  )

  const [usedNineQ,  setUsedNineQ]  = useState(false)
  const [usedEightQ, setUsedEightQ] = useState(false)

  function handle2QChange(i, val) {
    setTwoQAnswers(prev => prev.map((a, idx) => idx === i ? val : a))
  }

  function handle2QSubmit() {
    setUsedNineQ(false)
    setUsedEightQ(false)
    const positive = twoQAnswers.some(a => a === true)
    if (positive) {
      setPhase('9q')
    } else {
      setPhase('result')
    }
  }

  function handle9QChange(i, val) {
    setNineQAnswers(prev => prev.map((a, idx) => idx === i ? val : a))
  }

  function handle9QSubmit() {
    setUsedNineQ(true)
    const score = nineQAnswers.reduce((s, v) => s + Math.max(0, v), 0)
    if (score >= 7) {
      setPhase('8q')
    } else {
      setPhase('result')
    }
  }

  function handle8QChange(i, val) {
    setEightQAnswers(prev => prev.map((a, idx) => {
      if (idx !== i) return a
      const reset = i === 2 ? { ...a, yes: val, canControl: val ? a.canControl : null } : { ...a, yes: val }
      return reset
    }))
  }

  function handle8QSubChange(val) {
    setEightQAnswers(prev => prev.map((a, idx) => idx === 2 ? { ...a, canControl: val } : a))
  }

  function handle8QSubmit() {
    setUsedEightQ(true)
    setPhase('result')
  }

  function handleReset() {
    setPhase('guide')
    setTwoQAnswers([null, null])
    setNineQAnswers(Array(9).fill(-1))
    setEightQAnswers(Array(8).fill(null).map(() => ({ yes: null, canControl: null })))
    setUsedNineQ(false)
    setUsedEightQ(false)
  }

  return (
    <div>
      {phase === 'guide' && (
        <GuideScreen onStart={() => setPhase('2q')} />
      )}
      {phase === '2q' && (
        <TwoQScreen
          answers={twoQAnswers}
          onChange={handle2QChange}
          onSubmit={handle2QSubmit}
        />
      )}
      {phase === '9q' && (
        <NineQScreen
          answers={nineQAnswers}
          onChange={handle9QChange}
          onSubmit={handle9QSubmit}
        />
      )}
      {phase === '8q' && (
        <EightQScreen
          answers={eightQAnswers}
          onChange={handle8QChange}
          onSubChange={handle8QSubChange}
          onSubmit={handle8QSubmit}
        />
      )}
      {phase === 'result' && (
        <ResultScreen
          twoQ={twoQAnswers}
          nineQ={usedNineQ ? nineQAnswers : null}
          eightQ={usedEightQ ? eightQAnswers : null}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
