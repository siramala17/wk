import React, { useState, useEffect } from 'react'
import { Scale, ArrowRight, RefreshCw } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { calcBmiScore, getBmiCategory } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'

function BmiGauge({ bmi }) {
  const zones = [
    { label: 'ผอม', range: [0, 18.5], color: '#60A5FA' },
    { label: 'ปกติ', range: [18.5, 23], color: '#34D399' },
    { label: 'เกินเล็กน้อย', range: [23, 25], color: '#FBBF24' },
    { label: 'น้ำหนักเกิน', range: [25, 30], color: '#F97316' },
    { label: 'อ้วน', range: [30, 40], color: '#EF4444' },
  ]
  const clampedBmi = Math.max(10, Math.min(40, bmi))
  const pct = ((clampedBmi - 10) / 30) * 100

  return (
    <div className="mt-4">
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {zones.map(z => {
          const w = ((z.range[1] - z.range[0]) / 30) * 100
          return (
            <div key={z.label} className="h-full rounded-sm" style={{ width: `${w}%`, backgroundColor: z.color }} />
          )
        })}
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
          <span key={z.label} className="text-center">{z.label}</span>
        ))}
      </div>
    </div>
  )
}

function IdealWeightCard({ height }) {
  const minWeight = (18.5 * Math.pow(height / 100, 2)).toFixed(1)
  const maxWeight = (22.9 * Math.pow(height / 100, 2)).toFixed(1)
  return (
    <div className="bg-blue-50 rounded-2xl p-4">
      <p className="text-sm font-semibold text-blue-800 mb-1">⚖️ น้ำหนักในช่วงปกติสำหรับคุณ</p>
      <p className="text-xl font-black text-blue-700">{minWeight} – {maxWeight} kg</p>
      <p className="text-xs text-blue-500 mt-1">สำหรับความสูง {height} cm (BMI 18.5–22.9)</p>
    </div>
  )
}

export default function BMI() {
  const { saveBmi, bmiData } = useHealth()
  const [height, setHeight] = useState(165)
  const [weight, setWeight] = useState(60)
  const [result, setResult] = useState(null)
  const [unit, setUnit] = useState('metric')

  useEffect(() => {
    if (bmiData) setResult(bmiData)
  }, [])

  function calculate() {
    const h = unit === 'metric' ? height : height * 2.54
    const w = unit === 'metric' ? weight : weight * 0.453592
    const bmiVal = +(w / Math.pow(h / 100, 2)).toFixed(1)
    const cat = getBmiCategory(bmiVal)
    const score = calcBmiScore(bmiVal)
    const res = { bmi: bmiVal, category: cat.label, advice: cat.advice, color: cat.color, bg: cat.bg, score, height: h, weight: w }
    setResult(res)
    saveBmi(res)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
          <Scale size={22} className="text-yellow-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">คำนวณ BMI</h1>
          <p className="text-xs text-slate-500">ดัชนีมวลกาย (Body Mass Index)</p>
        </div>
      </div>

      {/* Unit Toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button onClick={() => setUnit('metric')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${unit === 'metric' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'}`}>
          เมตริก (kg/cm)
        </button>
        <button onClick={() => setUnit('imperial')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${unit === 'imperial' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'}`}>
          อิมพีเรียล (lbs/in)
        </button>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            ส่วนสูง ({unit === 'metric' ? 'cm' : 'นิ้ว'})
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min={unit === 'metric' ? 100 : 40} max={unit === 'metric' ? 220 : 87}
              value={height} onChange={e => setHeight(+e.target.value)}
              className="flex-1 accent-blue-600"
            />
            <div className="w-20">
              <input type="number" value={height} onChange={e => setHeight(+e.target.value)}
                className="w-full text-center border-2 border-blue-100 rounded-xl py-2 font-bold text-blue-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            น้ำหนัก ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min={unit === 'metric' ? 30 : 66} max={unit === 'metric' ? 150 : 330}
              value={weight} onChange={e => setWeight(+e.target.value)}
              className="flex-1 accent-blue-600"
            />
            <div className="w-20">
              <input type="number" value={weight} onChange={e => setWeight(+e.target.value)}
                className="w-full text-center border-2 border-blue-100 rounded-xl py-2 font-bold text-blue-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors">
          <Scale size={18} />
          คำนวณ BMI
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-slide-up space-y-4">
          <div className={`${result.bg} rounded-3xl p-5`}>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <ScoreRing score={result.score} size={100} strokeWidth={9} color={result.color?.includes('emerald') ? '#10B981' : result.color?.includes('yellow') ? '#D97706' : result.color?.includes('red') ? '#DC2626' : '#F97316'} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{result.bmi}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">ผลการวิเคราะห์ BMI</p>
                <p className={`text-xl font-black ${result.color}`}>{result.category}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.advice}</p>
              </div>
            </div>
            <BmiGauge bmi={result.bmi} />
          </div>

          <IdealWeightCard height={result.height} />

          {/* BMI Reference Table */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <p className="text-sm font-bold text-slate-700 mb-3">📊 ตารางอ้างอิง BMI</p>
            <div className="space-y-2">
              {[
                { range: '< 18.5', label: 'น้ำหนักน้อยกว่าเกณฑ์', color: 'bg-blue-100 text-blue-700' },
                { range: '18.5 – 22.9', label: 'น้ำหนักปกติ', color: 'bg-emerald-100 text-emerald-700' },
                { range: '23 – 24.9', label: 'น้ำหนักเกินเล็กน้อย', color: 'bg-yellow-100 text-yellow-700' },
                { range: '25 – 29.9', label: 'น้ำหนักเกิน', color: 'bg-orange-100 text-orange-700' },
                { range: '≥ 30', label: 'โรคอ้วน', color: 'bg-red-100 text-red-700' },
              ].map(row => (
                <div key={row.range} className={`flex items-center justify-between px-3 py-2 rounded-xl ${row.range.includes(result.bmi.toString().split('.')[0]) || (result.bmi >= 30 && row.range.includes('30')) ? 'ring-2 ring-blue-400' : ''} ${row.color}`}>
                  <span className="font-semibold text-sm">{row.range}</span>
                  <span className="text-sm">{row.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setResult(null)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
            <RefreshCw size={16} />
            คำนวณใหม่
          </button>
        </div>
      )}
    </div>
  )
}
