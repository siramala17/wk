import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import ScoreRing from '../components/ScoreRing'

// ข้อคำถามและการตั้งค่า
const DOMAINS = [
  {
    key: 'sleep', label: 'การนอนหลับ', emoji: '🌙',
    color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', ring: '#3B82F6',
    questions: [
      { id: 1, text: 'คุณเข้านอนและตื่นนอนเป็นเวลาเดียวกันทุกวัน (รวมวันหยุดด้วย)', reverse: false },
      { id: 2, text: 'คุณนอนหลับได้สนิทต่อเนื่องยาวนาน 6-8 ชั่วโมงต่อคืน', reverse: false },
      { id: 3, text: 'คุณตื่นนอนตอนเช้าแล้วรู้สึกสดชื่น ไม่เพลียหรืออยากนอนต่อ', reverse: false },
      { id: 4, text: 'คุณสะดุ้งตื่นกลางดึก หรือหลับๆ ตื่นๆ บ่อยครั้ง', reverse: true },
    ],
  },
  {
    key: 'water', label: 'การดื่มน้ำ', emoji: '💧',
    color: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', ring: '#06B6D4',
    questions: [
      { id: 5, text: 'คุณดื่มน้ำเปล่าสะอาดได้อย่างน้อยวันละ 8 แก้ว (ประมาณ 2 ลิตร)', reverse: false },
      { id: 6, text: 'คุณจิบน้ำสม่ำเสมอตลอดทั้งวัน โดยไม่รอให้รู้สึกกระหายน้ำก่อน', reverse: false },
      { id: 7, text: 'คุณดื่มเครื่องดื่มหวาน ชานม หรือน้ำอัดลมแทนน้ำเปล่า', reverse: true },
      { id: 8, text: 'คุณดื่มกาแฟ เครื่องดื่มชูกำลัง หรือชาเข้มข้น เกิน 2 แก้วต่อวัน', reverse: true },
    ],
  },
  {
    key: 'exercise', label: 'การออกกำลังกาย', emoji: '🏃',
    color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: '#10B981',
    questions: [
      { id: 9,  text: 'คุณออกกำลังกายระดับปานกลาง (เดินเร็ว วิ่ง ปั่นจักรยาน) รวมกันอย่างน้อย 150 นาที/สัปดาห์', reverse: false },
      { id: 10, text: 'คุณมีการยืดเหยียดกล้ามเนื้อ หรือออกกำลังกายแรงต้าน (ยกน้ำหนัก/เวท) บ้างในแต่ละสัปดาห์', reverse: false },
      { id: 11, text: 'คุณใช้เวลาขยับร่างกาย เดิน หรือทำงานบ้าน แทนการนั่งอยู่กับที่นานๆ', reverse: false },
      { id: 12, text: 'คุณนั่งทำงานหรืออยู่กับที่ติดต่อกันเกิน 2 ชั่วโมงโดยไม่ลุกขยับเลย', reverse: true },
    ],
  },
  {
    key: 'digital', label: 'การใช้สื่อดิจิทัล', emoji: '📱',
    color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', ring: '#8B5CF6',
    questions: [
      { id: 13, text: 'คุณใช้เวลาอยู่หน้าจอสมาร์ทโฟน/คอมพิวเตอร์ เพื่อความบันเทิงเกิน 4 ชั่วโมงต่อวัน', reverse: true },
      { id: 14, text: 'คุณเปิดดูโทรศัพท์มือถือ ทันทีที่ตื่นนอนและก่อนหลับตานอน', reverse: true },
      { id: 15, text: 'คุณสามารถวางมือถือหรือหยุดเช็กโซเชียลมีเดียได้ โดยไม่รู้สึกกระวนกระวายใจ', reverse: false },
      { id: 16, text: 'คุณรู้สึกว่าแสงหน้าจอหรือการเสพข่าวสารทำให้คุณปวดตาหรือปวดหัว', reverse: true },
    ],
  },
  {
    key: 'stress', label: 'ความเครียดและการจัดการ', emoji: '🧘',
    color: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', ring: '#F59E0B',
    questions: [
      { id: 17, text: 'คุณรู้สึกกดดัน วิตกกังวล หรือหงุดหงิดง่ายจากเรื่องงาน/เรียน/ส่วนตัว', reverse: true },
      { id: 18, text: 'คุณมีอาการทางกายจากความเครียด เช่น ปวดบ่าไหล่ นอนไม่หลับ หรือกรดไหลย้อน', reverse: true },
      { id: 19, text: 'คุณมีวิธีจัดการความเครียดที่ดี เช่น ทำงานอดิเรก นั่งสมาธิ หรือคุยกับคนที่สบายใจ', reverse: false },
      { id: 20, text: 'คุณเลือกใช้วิธีกินของหวาน/ของทอด หรือสูบบุหรี่/ดื่มสุราเพื่อระบายความเครียด', reverse: true },
    ],
  },
]

const SCALE = [
  { value: 1, label: 'ไม่เคยเลย' },
  { value: 2, label: 'นานๆ ครั้ง' },
  { value: 3, label: 'บางครั้ง' },
  { value: 4, label: 'บ่อยครั้ง' },
  { value: 5, label: 'ประจำ' },
]

// คะแนนกลับลบ: 5→1, 4→2, 3→3, 2→4, 1→5
function applyScore(raw, reverse) {
  return reverse ? (6 - raw) : raw
}

function calcDomainScore(answers, domain) {
  const raw = domain.questions.reduce((s, q) => s + applyScore(answers[q.id] ?? 3, q.reverse), 0)
  // raw 4-20 → 0-100
  return Math.round(((raw - 4) / 16) * 100)
}

function calcTotal(answers) {
  return DOMAINS.reduce((s, d) => {
    return s + d.questions.reduce((ds, q) => ds + applyScore(answers[q.id] ?? 3, q.reverse), 0)
  }, 0)
}

function getLevel(total) {
  if (total >= 81) return { label: 'ดีเยี่ยม', emoji: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: '#10B981', desc: 'คุณมีวิถีชีวิตที่สมดุลมาก ร่างกายและจิตใจได้รับดูแลอย่างถูกต้อง' }
  if (total >= 51) return { label: 'ปานกลาง', emoji: '😊', color: 'text-yellow-600', bg: 'bg-yellow-50', ring: '#F59E0B', desc: 'พฤติกรรมสุขภาพอยู่ในเกณฑ์ยอมรับได้ แต่มีบางจุดที่ควรปรับปรุง' }
  return { label: 'ต้องปรับปรุงด่วน', emoji: '⚠️', color: 'text-red-600', bg: 'bg-red-50', ring: '#EF4444', desc: 'พฤติกรรมเสี่ยงต่อการเกิดโรคเรื้อรัง ควรเริ่มปรับเปลี่ยนพฤติกรรมทีละด้าน' }
}

// ── หน้าผลลัพธ์ ──
function ResultScreen({ answers, pointsEarned, alreadyToday, onShare }) {
  const total = calcTotal(answers)
  const level = getLevel(total)

  const domainScores = DOMAINS.map(d => ({
    ...d,
    score: calcDomainScore(answers, d),
  }))

  return (
    <div className="space-y-5">
      {/* คะแนนรวม */}
      <div className={`${level.bg} rounded-3xl p-6 text-center`}>
        <p className="text-4xl mb-2">{level.emoji}</p>
        <p className="text-sm text-slate-500 mb-2">คะแนนสุขภาพรวม (เต็ม 100)</p>
        <div className="flex items-center justify-center mb-3 relative">
          <ScoreRing score={total} size={130} strokeWidth={10} color={level.ring} />
          <div className="absolute text-center">
            <span className={`text-4xl font-black ${level.color}`}>{total}</span>
          </div>
        </div>
        <p className={`text-lg font-bold ${level.color}`}>{level.label}</p>
        <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
      </div>

      {/* แต้มสะสม */}
      {alreadyToday ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-slate-600">ประเมินแล้ววันนี้</p>
            <p className="text-xs text-slate-400">ข้อมูลถูกอัปเดตแล้ว แต้มจะได้รับวันละ 1 ครั้ง</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-semibold text-yellow-700">ได้รับ {pointsEarned} แต้ม!</p>
            <p className="text-xs text-yellow-500">ประเมินอีกครั้งได้พรุ่งนี้</p>
          </div>
        </div>
      )}

      {/* คะแนนรายด้าน */}
      <div>
        <h3 className="font-bold text-slate-700 text-sm mb-2">คะแนนรายด้าน</h3>
        <div className="space-y-2">
          {domainScores.map(d => (
            <div key={d.key} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-lg">{d.emoji}</span>
              <span className="text-sm font-medium text-slate-700 flex-1">{d.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${d.score}%`, background: d.ring }} />
                </div>
                <span className="text-sm font-bold w-8 text-right" style={{ color: d.ring }}>{d.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onShare}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-xl py-3 transition-colors">
        แชร์ผลลัพธ์ 🎉
      </button>
    </div>
  )
}

// ── หน้าแบบประเมินหลัก ──
export default function Assessment() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [earnInfo, setEarnInfo] = useState({ pointsEarned: 0, alreadyToday: false })
  const { saveAssessment, history } = useHealth()
  const navigate = useNavigate()

  const domain = DOMAINS[step]
  const progress = ((step) / DOMAINS.length) * 100
  const allAnswered = domain.questions.every(q => answers[q.id] !== undefined)

  function handleAnswer(qId, value) {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  function handleNext() {
    if (step < DOMAINS.length - 1) {
      setStep(s => s + 1)
      window.scrollTo(0, 0)
    } else {
      // คำนวณคะแนนทุกด้าน
      const sleepScore   = calcDomainScore(answers, DOMAINS[0])
      const waterScore   = calcDomainScore(answers, DOMAINS[1])
      const exerciseScore = calcDomainScore(answers, DOMAINS[2])
      const digitalScore  = calcDomainScore(answers, DOMAINS[3])
      const stressScore   = calcDomainScore(answers, DOMAINS[4])
      const overallScore  = calcTotal(answers)

      const assessment = {
        sleepScore, waterScore, exerciseScore, digitalScore, stressScore,
        overallScore,
        answers,
      }
      const info = saveAssessment(assessment)
      setEarnInfo(info)
      setResult(assessment)
      window.scrollTo(0, 0)
    }
  }

  function handleShare() {
    const total = calcTotal(answers)
    const level = getLevel(total)
    const text = `🏥 ผลประเมินพฤติกรรมสุขภาพของฉัน\n${level.emoji} คะแนนรวม: ${total}/100 — ${level.label}\n🌙 การนอนหลับ: ${calcDomainScore(answers, DOMAINS[0])}\n💧 การดื่มน้ำ: ${calcDomainScore(answers, DOMAINS[1])}\n🏃 การออกกำลังกาย: ${calcDomainScore(answers, DOMAINS[2])}\n📱 สื่อดิจิทัล: ${calcDomainScore(answers, DOMAINS[3])}\n🧘 ความเครียด: ${calcDomainScore(answers, DOMAINS[4])}`
    if (navigator.share) {
      navigator.share({ title: 'ผลสุขภาพของฉัน', text })
    } else {
      navigator.clipboard.writeText(text).then(() => alert('คัดลอกข้อความแล้ว!'))
    }
  }

  // หน้าผลลัพธ์
  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800">ผลการประเมิน</h1>
          <button onClick={() => navigate('/recommendations')} className="text-sm text-blue-600 font-medium">
            ดูคำแนะนำ →
          </button>
        </div>
        <ResultScreen
          answers={result.answers}
          pointsEarned={earnInfo.pointsEarned}
          alreadyToday={earnInfo.alreadyToday}
          onShare={handleShare}
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">

      {/* progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>ด้านที่ {step + 1} จาก {DOMAINS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>

        {/* domain indicators */}
        <div className="flex gap-1.5 mt-2.5">
          {DOMAINS.map((d, i) => (
            <div key={d.key} className={`flex-1 h-1 rounded-full transition-colors ${
              i < step ? d.color : i === step ? `${d.color} opacity-70` : 'bg-slate-100'
            }`} />
          ))}
        </div>
      </div>

      {/* domain header */}
      <div className={`${domain.light} border ${domain.border} rounded-2xl px-4 py-3 flex items-center gap-3 mb-5`}>
        <div className={`w-11 h-11 ${domain.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
          {domain.emoji}
        </div>
        <div>
          <p className="text-xs text-slate-400">ด้านที่ {step + 1}</p>
          <p className={`font-bold ${domain.text}`}>{domain.label}</p>
        </div>
      </div>

      {/* คำอธิบายระดับ */}
      <div className="bg-slate-50 rounded-xl px-3 py-2 mb-4">
        <div className="flex justify-between text-[10px] text-slate-400">
          {SCALE.map(s => (
            <span key={s.value} className="text-center w-1/5">{s.value}<br/>{s.label}</span>
          ))}
        </div>
      </div>

      {/* คำถาม */}
      <div className="space-y-5">
        {domain.questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full ${domain.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {q.id}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed flex-1">{q.text}</p>
            </div>
            {q.reverse && (
              <p className="text-[10px] text-orange-400 flex items-center gap-1 mb-2">
                <AlertCircle size={10} /> ข้อนี้ยิ่งตอบสูง = พฤติกรรมเสี่ยงมากกว่า
              </p>
            )}
            <div className="flex gap-2">
              {SCALE.map(s => {
                const selected = answers[q.id] === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => handleAnswer(q.id, s.value)}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      selected
                        ? `${domain.color} text-white shadow-md`
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {s.value}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ปุ่มนำทาง */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex gap-3 md:static md:border-none md:bg-transparent md:mt-6 md:px-0">
        {step > 0 && (
          <button
            onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0) }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={18} /> ย้อนกลับ
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!allAnswered}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] ${
            allAnswered
              ? `${domain.color} text-white hover:opacity-90`
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {step === DOMAINS.length - 1 ? (
            <><Check size={18} /> ดูผลการประเมิน</>
          ) : (
            <>ถัดไป <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  )
}
