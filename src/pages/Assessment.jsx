import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Moon, Smartphone, Brain, Dumbbell, Droplets } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import {
  calcSleepScore, calcScreenScore, calcStressScore,
  calcExerciseScore, calcWaterScore, calcOverallScore, getHealthLevel
} from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'

const STEPS = [
  { key: 'sleep', label: 'การนอนหลับ', icon: Moon, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { key: 'screen', label: 'เวลาหน้าจอ', icon: Smartphone, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { key: 'stress', label: 'ความเครียด', icon: Brain, color: 'bg-yellow-500', lightColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  { key: 'exercise', label: 'ออกกำลังกาย', icon: Dumbbell, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { key: 'water', label: 'การดื่มน้ำ', icon: Droplets, color: 'bg-cyan-500', lightColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
]

function Slider({ value, min, max, step = 1, onChange, label, leftLabel, rightLabel }) {
  return (
    <div>
      {label && <p className="text-sm text-slate-600 mb-3">{label}</p>}
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
      <div className="text-center mt-2">
        <span className="text-2xl font-black text-blue-700">{value}</span>
      </div>
    </div>
  )
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => (
        <button key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
            value === opt.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
          }`}
        >
          <span className="text-xl block mb-1">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StepSleep({ data, setData }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">เวลาเข้านอน</label>
        <input type="time" value={data.bedtime} onChange={e => setData(d => ({ ...d, bedtime: e.target.value }))}
          className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 text-lg font-semibold text-blue-700 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">เวลาตื่นนอน</label>
        <input type="time" value={data.wakeTime} onChange={e => setData(d => ({ ...d, wakeTime: e.target.value }))}
          className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 text-lg font-semibold text-blue-700 focus:outline-none focus:border-blue-500"
        />
      </div>
      <Slider value={data.sleepHours} min={3} max={12} step={0.5}
        label="จำนวนชั่วโมงที่นอนหลับจริง"
        leftLabel="3 ชม." rightLabel="12 ชม."
        onChange={v => setData(d => ({ ...d, sleepHours: v }))}
      />
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">คุณภาพการนอนหลับ</p>
        <OptionGrid value={data.sleepQuality} onChange={v => setData(d => ({ ...d, sleepQuality: v }))} options={[
          { value: 'great', emoji: '😴', label: 'หลับสนิท ตื่นมาสดชื่น' },
          { value: 'good', emoji: '🙂', label: 'หลับได้ดีพอใช้' },
          { value: 'fair', emoji: '😐', label: 'หลับๆ ตื่นๆ บ้าง' },
          { value: 'poor', emoji: '😫', label: 'นอนไม่หลับ ฝันร้าย' },
        ]} />
      </div>
    </div>
  )
}

function StepScreen({ data, setData }) {
  return (
    <div className="space-y-6">
      <Slider value={data.screenHours} min={0} max={16} step={0.5}
        label="จำนวนชั่วโมงที่ใช้หน้าจอต่อวัน (รวมทุกอุปกรณ์)"
        leftLabel="0 ชม." rightLabel="16 ชม."
        onChange={v => setData(d => ({ ...d, screenHours: v }))}
      />
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">ใช้หน้าจอทำอะไรมากที่สุด?</p>
        <OptionGrid value={data.screenUsage} onChange={v => setData(d => ({ ...d, screenUsage: v }))} options={[
          { value: 'social', emoji: '📱', label: 'โซเชียลมีเดีย' },
          { value: 'study', emoji: '📚', label: 'เรียน/ทำงาน' },
          { value: 'game', emoji: '🎮', label: 'เล่นเกม' },
          { value: 'video', emoji: '🎬', label: 'ดูวิดีโอ/ซีรีส์' },
        ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">ใช้โทรศัพท์บนเตียงก่อนนอน?</p>
        <OptionGrid value={data.phoneBeforeSleep} onChange={v => setData(d => ({ ...d, phoneBeforeSleep: v }))} options={[
          { value: 'never', emoji: '🚫', label: 'ไม่เลย' },
          { value: 'sometimes', emoji: '😊', label: 'บางครั้ง (< 30 นาที)' },
          { value: 'often', emoji: '😅', label: 'บ่อย (30-60 นาที)' },
          { value: 'always', emoji: '😱', label: 'ทุกคืน (> 1 ชม.)' },
        ]} />
      </div>
    </div>
  )
}

function StepStress({ data, setData }) {
  const stressEmoji = ['', '😌', '🙂', '😐', '😐', '😕', '😟', '😟', '😰', '😰', '😱']
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-5xl">{stressEmoji[data.stressLevel]}</span>
      </div>
      <Slider value={data.stressLevel} min={1} max={10}
        label="ระดับความเครียดของคุณในสัปดาห์นี้"
        leftLabel="ผ่อนคลายมาก" rightLabel="เครียดมาก"
        onChange={v => setData(d => ({ ...d, stressLevel: v }))}
      />
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">ความเครียดหลักมาจาก?</p>
        <OptionGrid value={data.stressCause} onChange={v => setData(d => ({ ...d, stressCause: v }))} options={[
          { value: 'school', emoji: '📖', label: 'การเรียน/งาน' },
          { value: 'social', emoji: '👫', label: 'ความสัมพันธ์' },
          { value: 'future', emoji: '🔮', label: 'อนาคต/ความไม่แน่นอน' },
          { value: 'other', emoji: '🌀', label: 'สาเหตุอื่นๆ' },
        ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">วิธีรับมือความเครียดของคุณ?</p>
        <OptionGrid value={data.copingMethod} onChange={v => setData(d => ({ ...d, copingMethod: v }))} options={[
          { value: 'exercise', emoji: '🏃', label: 'ออกกำลังกาย' },
          { value: 'talk', emoji: '💬', label: 'คุยกับคนอื่น' },
          { value: 'hobby', emoji: '🎨', label: 'ทำสิ่งที่ชอบ' },
          { value: 'nothing', emoji: '😶', label: 'ไม่มีวิธีรับมือ' },
        ]} />
      </div>
    </div>
  )
}

function StepExercise({ data, setData }) {
  return (
    <div className="space-y-6">
      <Slider value={data.exerciseDays} min={0} max={7}
        label="ออกกำลังกายกี่วันต่อสัปดาห์?"
        leftLabel="ไม่ได้เลย" rightLabel="ทุกวัน"
        onChange={v => setData(d => ({ ...d, exerciseDays: v }))}
      />
      <Slider value={data.exerciseMinutes} min={0} max={120} step={5}
        label="ระยะเวลาออกกำลังกายต่อครั้ง (นาที)"
        leftLabel="0 นาที" rightLabel="120 นาที"
        onChange={v => setData(d => ({ ...d, exerciseMinutes: v }))}
      />
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">กิจกรรมที่ทำบ่อยที่สุด</p>
        <OptionGrid value={data.exerciseType} onChange={v => setData(d => ({ ...d, exerciseType: v }))} options={[
          { value: 'walk', emoji: '🚶', label: 'เดิน/วิ่ง' },
          { value: 'gym', emoji: '🏋️', label: 'ยิม/ฝึกแรง' },
          { value: 'sport', emoji: '⚽', label: 'กีฬาทีม' },
          { value: 'yoga', emoji: '🧘', label: 'โยคะ/ว่ายน้ำ' },
        ]} />
      </div>
    </div>
  )
}

function StepWater({ data, setData }) {
  return (
    <div className="space-y-6">
      <Slider value={data.waterGlasses} min={0} max={15}
        label="จำนวนแก้วน้ำที่ดื่มต่อวัน (1 แก้ว ≈ 250 ml)"
        leftLabel="0 แก้ว" rightLabel="15 แก้ว"
        onChange={v => setData(d => ({ ...d, waterGlasses: v }))}
      />
      <div className="flex justify-center gap-1 flex-wrap py-2">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} className={`text-2xl transition-all duration-200 ${i < data.waterGlasses ? 'opacity-100' : 'opacity-20'}`}>💧</span>
        ))}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">เครื่องดื่มที่ชอบดื่มแทนน้ำเปล่า</p>
        <OptionGrid value={data.drinkType} onChange={v => setData(d => ({ ...d, drinkType: v }))} options={[
          { value: 'none', emoji: '💧', label: 'ดื่มน้ำเปล่าอย่างเดียว' },
          { value: 'juice', emoji: '🧃', label: 'น้ำผลไม้' },
          { value: 'soda', emoji: '🥤', label: 'น้ำอัดลม/น้ำหวาน' },
          { value: 'coffee', emoji: '☕', label: 'ชา/กาแฟ' },
        ]} />
      </div>
    </div>
  )
}

function ResultScreen({ result, onShare, pointsEarned, alreadyToday }) {
  const level = getHealthLevel(result.overallScore)
  const breakdown = [
    { label: 'การนอนหลับ', score: result.sleepScore, emoji: '🌙' },
    { label: 'เวลาหน้าจอ', score: result.screenScore, emoji: '📱' },
    { label: 'ความเครียด', score: result.stressScore, emoji: '🧘' },
    { label: 'ออกกำลังกาย', score: result.exerciseScore, emoji: '🏃' },
    { label: 'ดื่มน้ำ', score: result.waterScore, emoji: '💧' },
  ]
  return (
    <div className="space-y-5 animate-slide-up">
      <div className={`${level.bg} border border-opacity-30 rounded-3xl p-6 text-center`}>
        <p className="text-4xl mb-2">{level.emoji}</p>
        <p className="text-sm text-slate-500 mb-1">คะแนนสุขภาพโดยรวม</p>
        <div className="flex items-center justify-center mb-3">
          <ScoreRing score={result.overallScore} size={120} strokeWidth={10} color={level.ring} />
          <div className="absolute">
            <span className={`text-3xl font-black ${level.color}`}>{result.overallScore}</span>
          </div>
        </div>
        <p className={`text-lg font-bold ${level.color}`}>{level.label}</p>
      </div>

      {/* แต้มที่ได้รับ */}
      {alreadyToday ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-slate-600">ประเมินแล้ววันนี้</p>
            <p className="text-xs text-slate-400">ข้อมูลถูกอัปเดตแล้ว แต้มจะได้รับวันละ 1 ครั้งเท่านั้น</p>
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

      <div className="space-y-2">
        {breakdown.map(b => (
          <div key={b.label} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <span className="text-lg">{b.emoji}</span>
            <span className="text-sm font-medium text-slate-700 flex-1">{b.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                  style={{ width: `${b.score}%` }} />
              </div>
              <span className="text-sm font-bold text-blue-700 w-8 text-right">{b.score}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onShare}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-xl py-3 transition-colors">
          แชร์ผลลัพธ์ 🎉
        </button>
      </div>
    </div>
  )
}

const defaultData = {
  sleep: { bedtime: '23:00', wakeTime: '07:00', sleepHours: 7, sleepQuality: 'good' },
  screen: { screenHours: 5, screenUsage: 'social', phoneBeforeSleep: 'sometimes' },
  stress: { stressLevel: 5, stressCause: 'school', copingMethod: 'hobby' },
  exercise: { exerciseDays: 3, exerciseMinutes: 30, exerciseType: 'walk' },
  water: { waterGlasses: 6, drinkType: 'none' },
}

export default function Assessment() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(defaultData)
  const [result, setResult] = useState(null)
  const [earnInfo, setEarnInfo] = useState({ pointsEarned: 0, alreadyToday: false })
  const { saveAssessment } = useHealth()
  const navigate = useNavigate()

  const currentStep = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  function makeStepData(key) {
    return [data[key], v => setData(d => ({ ...d, [key]: typeof v === 'function' ? v(d[key]) : v }))];
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      const sl = calcSleepScore(data.sleep.sleepHours, data.sleep.bedtime)
      const sc = calcScreenScore(data.screen.screenHours)
      const st = calcStressScore(data.stress.stressLevel)
      const ex = calcExerciseScore(data.exercise.exerciseDays, data.exercise.exerciseMinutes)
      const wa = calcWaterScore(data.water.waterGlasses)
      const overall = calcOverallScore({ sleep: sl, screen: sc, stress: st, exercise: ex, water: wa })

      const assessment = {
        ...data.sleep, ...data.screen, ...data.stress, ...data.exercise, ...data.water,
        sleepScore: sl, screenScore: sc, stressScore: st, exerciseScore: ex, waterScore: wa,
        overallScore: overall,
      }
      const info = saveAssessment(assessment)
      setEarnInfo(info)
      setResult(assessment)
    }
  }

  function handleShare() {
    const text = `🏥 ผลสุขภาพของฉันวันนี้\n⭐ คะแนนรวม: ${result.overallScore}/100\n🌙 นอนหลับ: ${result.sleepScore}\n🏃 ออกกำลังกาย: ${result.exerciseScore}\n💧 ดื่มน้ำ: ${result.waterScore}\n\nมาประเมินสุขภาพด้วยกัน!`
    if (navigator.share) {
      navigator.share({ title: 'ผลสุขภาพของฉัน', text })
    } else {
      navigator.clipboard.writeText(text).then(() => alert('คัดลอกข้อความแล้ว!'))
    }
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800">ผลการประเมิน</h1>
          <button onClick={() => navigate('/recommendations')} className="text-sm text-blue-600 font-medium">ดูคำแนะนำ →</button>
        </div>
        <ResultScreen result={result} onShare={handleShare} pointsEarned={earnInfo.pointsEarned} alreadyToday={earnInfo.alreadyToday} />
      </div>
    )
  }

  const stepComponents = [
    <StepSleep data={data.sleep} setData={v => setData(d => ({ ...d, sleep: typeof v === 'function' ? v(d.sleep) : v }))} />,
    <StepScreen data={data.screen} setData={v => setData(d => ({ ...d, screen: typeof v === 'function' ? v(d.screen) : v }))} />,
    <StepStress data={data.stress} setData={v => setData(d => ({ ...d, stress: typeof v === 'function' ? v(d.stress) : v }))} />,
    <StepExercise data={data.exercise} setData={v => setData(d => ({ ...d, exercise: typeof v === 'function' ? v(d.exercise) : v }))} />,
    <StepWater data={data.water} setData={v => setData(d => ({ ...d, water: typeof v === 'function' ? v(d.water) : v }))} />,
  ]

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((s, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-blue-100'}`} />
          ))}
        </div>
        <p className="text-xs text-slate-400">ขั้นตอน {step + 1} จาก {STEPS.length}</p>
      </div>

      {/* Step Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden mb-4">
        <div className={`${currentStep.color} p-5`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <currentStep.icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs">ขั้นตอนที่ {step + 1}</p>
              <h2 className="text-white text-lg font-bold">{currentStep.label}</h2>
            </div>
          </div>
        </div>
        <div className="p-5">
          {stepComponents[step]}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
            <ChevronLeft size={18} />
            ย้อนกลับ
          </button>
        )}
        <button onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition-colors">
          {step < STEPS.length - 1 ? (
            <><span>ถัดไป</span><ChevronRight size={18} /></>
          ) : (
            <><Check size={18} /><span>ดูผลลัพธ์</span></>
          )}
        </button>
      </div>
    </div>
  )
}
