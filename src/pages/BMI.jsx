import React, { useState, useEffect } from 'react'
import { Scale, RefreshCw, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { calcBmiScore, getBmiCategory } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'

function getBmiAdvice(lang) {
  if (lang === 'en') {
    return {
      underweight: {
        title: 'Underweight — Needs Attention',
        icon: '⚠️', headerBg: 'bg-blue-600', cardBg: 'bg-blue-50', border: 'border-blue-200',
        sections: [
          { icon: '🍱', title: 'Nutrition', bg: 'bg-white', border: 'border-blue-100', items: ['Add quality calories: nuts, avocado, oats, sesame', 'Eat 3–5 small meals/day in addition to main meals', 'Focus on high protein: eggs, dairy, fish, lean meat, soy', 'Add healthy fats: olive oil, salmon, pumpkin seeds'] },
          { icon: '💪', title: 'Exercise', bg: 'bg-white', border: 'border-blue-100', items: ['Resistance / light weight training 2–3x/week to build muscle', 'Avoid heavy cardio that burns too many calories', 'Exercise 1 hour after meals for better nutrient absorption'] },
          { icon: '👨‍⚕️', title: 'Medical Advice', bg: 'bg-blue-100', border: 'border-blue-200', items: ['See a doctor to investigate the cause of low weight', 'Check blood work, vitamins, and essential nutrients', 'Consult a nutritionist for a personalized meal plan'] },
        ],
        goal: 'Goal: Gain 0.3–0.5 kg/week gradually',
        goalColor: 'text-blue-700 bg-blue-100',
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
      icon: '⚠️', headerBg: 'bg-blue-600', cardBg: 'bg-blue-50', border: 'border-blue-200',
      sections: [
        { icon: '🍱', title: 'อาหารและโภชนาการ', bg: 'bg-white', border: 'border-blue-100', items: ['เพิ่มแคลอรี่จากอาหารคุณภาพ เช่น ถั่ว อะโวคาโด ข้าวโอ๊ต งา', 'กินมื้อย่อย 3–5 ครั้ง/วัน เพิ่มเติมจากมื้อหลัก', 'เน้นโปรตีนสูง เช่น ไข่ นม ปลา เนื้อไม่ติดมัน ถั่วเหลือง', 'เพิ่มไขมันดี เช่น น้ำมันมะกอก ปลาแซลมอน เมล็ดฟักทอง'] },
        { icon: '💪', title: 'การออกกำลังกาย', bg: 'bg-white', border: 'border-blue-100', items: ['ฝึก Resistance Training / ยกน้ำหนักเบา 2–3 ครั้ง/สัปดาห์ เพิ่มมวลกล้ามเนื้อ', 'หลีกเลี่ยง Cardio หนักๆ ที่เผาผลาญแคลอรี่มากเกินไป', 'ออกกำลังกายหลังอาหาร 1 ชั่วโมง เพื่อให้ร่างกายดูดซึมได้ดี'] },
        { icon: '👨‍⚕️', title: 'คำแนะนำทางการแพทย์', bg: 'bg-blue-100', border: 'border-blue-200', items: ['พบแพทย์เพื่อตรวจหาสาเหตุที่น้ำหนักต่ำกว่าเกณฑ์', 'ตรวจค่าเลือด วิตามิน และธาตุอาหารที่จำเป็น', 'ปรึกษานักโภชนาการเพื่อวางแผนอาหารเฉพาะบุคคล'] },
      ],
      goal: 'เป้าหมาย: เพิ่มน้ำหนัก 0.3–0.5 kg/สัปดาห์ อย่างค่อยเป็นค่อยไป',
      goalColor: 'text-blue-700 bg-blue-100',
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
  const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F97316', '#EF4444']
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
    <div className="bg-blue-50 rounded-2xl p-4">
      <p className="text-sm font-semibold text-blue-800 mb-1">{b.idealTitle}</p>
      <p className="text-xl font-black text-blue-700">{minWeight} – {maxWeight} kg</p>
      <p className="text-xs text-blue-500 mt-1">{b.idealFor.replace('{h}', height)}</p>
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
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">{b.heightLabel}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={100} max={220} value={height} onChange={e => setHeight(+e.target.value)} className="flex-1 accent-blue-600" />
            <div className="w-20">
              <input type="number" value={height} onChange={e => setHeight(+e.target.value)}
                className="w-full text-center border-2 border-blue-100 rounded-xl py-2 font-bold text-blue-700 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">{b.weightLabel}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={30} max={150} value={weight} onChange={e => setWeight(+e.target.value)} className="flex-1 accent-blue-600" />
            <div className="w-20">
              <input type="number" value={weight} onChange={e => setWeight(+e.target.value)}
                className="w-full text-center border-2 border-blue-100 rounded-xl py-2 font-bold text-blue-700 focus:outline-none focus:border-blue-500" />
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors">
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

          {/* BMI Reference Table */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <p className="text-sm font-bold text-slate-700 mb-3">{b.tableTitle}</p>
            <div className="space-y-2">
              {[
                { range: '< 18.5',      color: 'bg-blue-100 text-blue-700'    },
                { range: '18.5 – 22.9', color: 'bg-emerald-100 text-emerald-700' },
                { range: '23 – 24.9',   color: 'bg-yellow-100 text-yellow-700'  },
                { range: '25 – 29.9',   color: 'bg-orange-100 text-orange-700'  },
                { range: '≥ 30',        color: 'bg-red-100 text-red-700'       },
              ].map((row, i) => (
                <div key={row.range} className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                  row.range.includes(result.bmi.toString().split('.')[0]) || (result.bmi >= 30 && row.range.includes('30'))
                    ? 'ring-2 ring-blue-400' : ''
                } ${row.color}`}>
                  <span className="font-semibold text-sm">{row.range}</span>
                  <span className="text-sm">{b.tableRows[i].label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setResult(null)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
            <RefreshCw size={16} />
            {b.recalc}
          </button>
        </div>
      )}
    </div>
  )
}
