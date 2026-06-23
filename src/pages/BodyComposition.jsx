import React from 'react'
import { Scale, Droplets, Dumbbell, Zap, Activity } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

function calcBodyFat(weight, height, age, gender) {
  const bmi = weight / ((height / 100) ** 2)
  if (gender === 'ชาย' || gender === 'male') {
    return (1.20 * bmi) + (0.23 * age) - 16.2
  }
  return (1.20 * bmi) + (0.23 * age) - 5.4
}

function getBodyFatLevel(pct, gender) {
  const isMale = gender === 'ชาย' || gender === 'male'
  if (isMale) {
    if (pct < 6)  return { label: 'ต่ำเกินไป', color: '#ef4444', bg: '#fef2f2' }
    if (pct < 14) return { label: 'นักกีฬา',   color: '#10b981', bg: '#ecfdf5' }
    if (pct < 18) return { label: 'ฟิต',        color: '#6366f1', bg: '#eef2ff' }
    if (pct < 25) return { label: 'ปกติ',       color: '#f59e0b', bg: '#fffbeb' }
    return         { label: 'สูงเกินไป',         color: '#ef4444', bg: '#fef2f2' }
  }
  if (pct < 14) return { label: 'ต่ำเกินไป', color: '#ef4444', bg: '#fef2f2' }
  if (pct < 21) return { label: 'นักกีฬา',   color: '#10b981', bg: '#ecfdf5' }
  if (pct < 25) return { label: 'ฟิต',        color: '#6366f1', bg: '#eef2ff' }
  if (pct < 32) return { label: 'ปกติ',       color: '#f59e0b', bg: '#fffbeb' }
  return         { label: 'สูงเกินไป',         color: '#ef4444', bg: '#fef2f2' }
}

export default function BodyComposition() {
  const { user } = useHealth()

  const weight = parseFloat(user?.weight) || 60
  const height = parseFloat(user?.height) || 165
  const age    = parseInt(user?.age)      || 16
  const gender = user?.gender             || 'ชาย'

  const bmi       = weight / ((height / 100) ** 2)
  const fatPct    = Math.max(0, calcBodyFat(weight, height, age, gender))
  const musclePct = (gender === 'ชาย' || gender === 'male')
    ? Math.max(0, 100 - fatPct - 15)
    : Math.max(0, 100 - fatPct - 20)
  const waterPct  = (gender === 'ชาย' || gender === 'male') ? 60 : 55
  const bmr       = (gender === 'ชาย' || gender === 'male')
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

  const fatLevel   = getBodyFatLevel(fatPct, gender)
  const fatMass    = (fatPct / 100) * weight
  const muscleMass = (musclePct / 100) * weight

  const metrics = [
    { icon: Activity, label: 'ไขมันในร่างกาย', value: fatPct.toFixed(1),    unit: '%',    max: 40,  color: '#f43f5e', bg: '#fff1f2' },
    { icon: Dumbbell, label: 'กล้ามเนื้อ',      value: musclePct.toFixed(1), unit: '%',    max: 80,  color: '#6366f1', bg: '#eef2ff' },
    { icon: Droplets, label: 'น้ำในร่างกาย',    value: waterPct.toFixed(0),  unit: '%',    max: 80,  color: '#22d3ee', bg: '#ecfeff' },
    { icon: Scale,    label: 'BMI',             value: bmi.toFixed(1),       unit: '',     max: 40,  color: '#f59e0b', bg: '#fffbeb' },
    { icon: Zap,      label: 'BMR',             value: Math.round(bmr),      unit: 'kcal', max: 3000,color: '#10b981', bg: '#ecfdf5' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-5 animate-fade-in">
      {/* Header */}
      <div
        className="rounded-3xl p-5 text-white mb-5 shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7490, #22d3ee)' }}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Scale size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black">Body Composition</h1>
            <p className="text-cyan-100 text-xs">องค์ประกอบร่างกาย</p>
          </div>
        </div>
        <div className="relative flex gap-4 text-sm">
          <div className="bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-cyan-100 text-xs">น้ำหนัก</span>
            <p className="font-bold">{weight} kg</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-cyan-100 text-xs">ส่วนสูง</span>
            <p className="font-bold">{height} cm</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-cyan-100 text-xs">อายุ</span>
            <p className="font-bold">{age} ปี</p>
          </div>
        </div>
      </div>

      {/* Fat level badge */}
      <div
        className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
        style={{ background: fatLevel.bg, border: `1.5px solid ${fatLevel.color}30` }}
      >
        <div>
          <p className="text-xs text-slate-500 font-medium">ระดับไขมัน</p>
          <p className="text-lg font-black" style={{ color: fatLevel.color }}>{fatLevel.label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">ไขมัน / กล้ามเนื้อ</p>
          <p className="font-bold text-sm text-slate-700">
            {fatMass.toFixed(1)} kg / {muscleMass.toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Body bar */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
        <p className="text-xs font-bold text-slate-500 mb-2">สัดส่วนร่างกาย</p>
        <div className="flex rounded-xl overflow-hidden h-5">
          <div style={{ width: `${fatPct}%`, background: '#f43f5e' }} />
          <div style={{ width: `${musclePct}%`, background: '#6366f1' }} />
          <div style={{ width: `${Math.min(waterPct, 100 - fatPct - musclePct)}%`, background: '#22d3ee' }} />
          <div className="flex-1 bg-slate-100" />
        </div>
        <div className="flex gap-4 mt-2">
          {[
            { label: 'ไขมัน', color: '#f43f5e' },
            { label: 'กล้ามเนื้อ', color: '#6366f1' },
            { label: 'น้ำ', color: '#22d3ee' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ icon: Icon, label, value, unit, max, color, bg }) => {
          const pct = Math.min(100, Math.round((parseFloat(value) / max) * 100))
          return (
            <div
              key={label}
              className="rounded-2xl p-3.5 relative overflow-hidden"
              style={{ background: 'white', border: `1.5px solid ${color}25`, boxShadow: `0 4px 16px ${color}15` }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: color, opacity: 0.07 }} />
              <div className="relative flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span className="text-[11px] font-black" style={{ color }}>{value} {unit}</span>
              </div>
              <p className="relative text-[11px] text-slate-500 mb-1.5 font-semibold">{label}</p>
              <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-4">
        * ค่าเหล่านี้เป็นการประมาณการจากสูตรสากล (Deurenberg formula)
      </p>
    </div>
  )
}
