import React, { useState, useEffect } from 'react'
import { Scale, RefreshCw, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { calcBmiScore, getBmiCategory } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'

const BMI_ADVICE = {
  underweight: {
    title: 'น้ำหนักน้อยกว่าเกณฑ์ — ต้องการความใส่ใจ',
    icon: '⚠️',
    headerBg: 'bg-blue-600',
    cardBg: 'bg-blue-50',
    border: 'border-blue-200',
    sections: [
      {
        icon: '🍱', title: 'อาหารและโภชนาการ',
        bg: 'bg-white', border: 'border-blue-100',
        items: [
          'เพิ่มแคลอรี่จากอาหารคุณภาพ เช่น ถั่ว อะโวคาโด ข้าวโอ๊ต งา',
          'กินมื้อย่อย 3–5 ครั้ง/วัน เพิ่มเติมจากมื้อหลัก',
          'เน้นโปรตีนสูง เช่น ไข่ นม ปลา เนื้อไม่ติดมัน ถั่วเหลือง',
          'เพิ่มไขมันดี เช่น น้ำมันมะกอก ปลาแซลมอน เมล็ดฟักทอง',
        ],
      },
      {
        icon: '💪', title: 'การออกกำลังกาย',
        bg: 'bg-white', border: 'border-blue-100',
        items: [
          'ฝึก Resistance Training / ยกน้ำหนักเบา 2–3 ครั้ง/สัปดาห์ เพิ่มมวลกล้ามเนื้อ',
          'หลีกเลี่ยง Cardio หนักๆ ที่เผาผลาญแคลอรี่มากเกินไป',
          'ออกกำลังกายหลังอาหาร 1 ชั่วโมง เพื่อให้ร่างกายดูดซึมได้ดี',
        ],
      },
      {
        icon: '👨‍⚕️', title: 'คำแนะนำทางการแพทย์',
        bg: 'bg-blue-100', border: 'border-blue-200',
        items: [
          'พบแพทย์เพื่อตรวจหาสาเหตุที่น้ำหนักต่ำกว่าเกณฑ์',
          'ตรวจค่าเลือด วิตามิน และธาตุอาหารที่จำเป็น',
          'ปรึกษานักโภชนาการเพื่อวางแผนอาหารเฉพาะบุคคล',
        ],
      },
    ],
    goal: 'เป้าหมาย: เพิ่มน้ำหนัก 0.3–0.5 kg/สัปดาห์ อย่างค่อยเป็นค่อยไป',
    goalColor: 'text-blue-700 bg-blue-100',
  },
  overweight: {
    title: 'น้ำหนักเกิน — สามารถปรับปรุงได้',
    icon: '💛',
    headerBg: 'bg-orange-500',
    cardBg: 'bg-orange-50',
    border: 'border-orange-200',
    sections: [
      {
        icon: '🥗', title: 'ปรับอาหาร',
        bg: 'bg-white', border: 'border-orange-100',
        items: [
          'ลดแป้งขัดสี น้ำตาล ของทอด และเครื่องดื่มหวาน',
          'เพิ่มผัก โปรตีน และใยอาหาร ทำให้อิ่มนานขึ้น',
          'ดื่มน้ำเปล่า 1–2 แก้วก่อนอาหาร 15 นาที',
          'กินช้าๆ เคี้ยวให้ละเอียด 20–30 ครั้ง/คำ',
        ],
      },
      {
        icon: '🏃', title: 'การออกกำลังกาย',
        bg: 'bg-white', border: 'border-orange-100',
        items: [
          'Cardio 150 นาที/สัปดาห์ เช่น เดินเร็ว วิ่ง ปั่นจักรยาน',
          'เพิ่ม Strength Training 2 ครั้ง/สัปดาห์ ช่วยเผาผลาญระยะยาว',
          'เพิ่มกิจกรรมในชีวิตประจำวัน เช่น เดินขึ้นบันได จอดรถห่างขึ้น',
        ],
      },
      {
        icon: '📊', title: 'ติดตามผล',
        bg: 'bg-white', border: 'border-orange-100',
        items: [
          'บันทึกอาหารที่กินทุกวัน ช่วยให้เห็นพฤติกรรมชัดเจนขึ้น',
          'ชั่งน้ำหนักทุกสัปดาห์ในเวลาเดียวกัน เช้าหลังตื่นนอน',
          'วัด Waist Circumference ร่วมด้วย (ควร < 80 cm หญิง / < 90 cm ชาย)',
        ],
      },
    ],
    goal: 'เป้าหมาย: ลดน้ำหนัก 0.5 kg/สัปดาห์ ด้วยการปรับพฤติกรรม',
    goalColor: 'text-orange-700 bg-orange-100',
  },
  obese: {
    title: 'โรคอ้วน — ต้องการการดูแลเร่งด่วน',
    icon: '🚨',
    headerBg: 'bg-red-600',
    cardBg: 'bg-red-50',
    border: 'border-red-200',
    sections: [
      {
        icon: '🥗', title: 'ปรับอาหารทันที',
        bg: 'bg-white', border: 'border-red-100',
        items: [
          'ลดแคลอรี่ลง 300–500 kcal/วัน (ไม่ควรอดอาหารอย่างสิ้นเชิง)',
          'หลีกเลี่ยงอาหารทอด น้ำตาล แป้งขัดสี และเครื่องดื่มหวานทุกชนิด',
          'เพิ่มผักใบเขียว โปรตีนไม่ติดมัน และใยอาหาร',
          'กินอาหารเช้าทุกวัน ป้องกันการกินมากเกินในมื้อถัดไป',
        ],
      },
      {
        icon: '🚶', title: 'ออกกำลังกายแบบปลอดภัย',
        bg: 'bg-white', border: 'border-red-100',
        items: [
          'เริ่มด้วยการเดิน 20–30 นาที/วัน ลดแรงกระแทกต่อข้อเข่า',
          'ว่ายน้ำหรือปั่นจักรยาน เป็นตัวเลือกที่ดีมากสำหรับผู้มีน้ำหนักมาก',
          'ค่อยๆ เพิ่มความเข้มข้น อย่าหักโหมในช่วงแรก',
        ],
      },
      {
        icon: '🏥', title: 'ต้องพบแพทย์ (สำคัญมาก)',
        bg: 'bg-red-100', border: 'border-red-300',
        items: [
          'ตรวจคัดกรองเบาหวาน ความดันโลหิตสูง และไขมันในเลือด',
          'ปรึกษาแพทย์ก่อนเริ่มโปรแกรมลดน้ำหนักทุกครั้ง',
          'อาจต้องร่วมกับนักโภชนาการและนักกายภาพบำบัด',
          'ในบางกรณีแพทย์อาจพิจารณาการรักษาเพิ่มเติม',
        ],
      },
    ],
    goal: 'เป้าหมาย: ลดน้ำหนัก 5–10% ภายใน 6 เดือน ลดความเสี่ยงโรคเรื้อรังได้มาก',
    goalColor: 'text-red-700 bg-red-100',
  },
}

function BmiRecommendations({ bmi }) {
  const [open, setOpen] = useState(true)
  const type = bmi >= 30 ? 'obese' : bmi >= 25 ? 'overweight' : bmi < 18.5 ? 'underweight' : null
  if (!type) return null
  const advice = BMI_ADVICE[type]

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

function getNextMonthDate() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
    .toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BMI() {
  const { saveBmi, bmiData } = useHealth()
  const [height, setHeight] = useState(165)
  const [weight, setWeight] = useState(60)
  const [result, setResult] = useState(null)
  const [pointsEarned, setPointsEarned] = useState(null) // null=ยังไม่คำนวณ true/false=ผลล่าสุด

  useEffect(() => {
    if (bmiData) setResult(bmiData)
  }, [])

  const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  const alreadyEarnedThisMonth = bmiData?.lastBmiPointsMonth === currentMonthKey

  function calculate() {
    const h = height
    const w = weight
    const bmiVal = +(w / Math.pow(h / 100, 2)).toFixed(1)
    const cat = getBmiCategory(bmiVal)
    const score = calcBmiScore(bmiVal)
    const res = { bmi: bmiVal, category: cat.label, advice: cat.advice, color: cat.color, bg: cat.bg, score, height: h, weight: w }
    setResult(res)
    const earned = saveBmi(res)
    setPointsEarned(earned)
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

      {/* Input Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            ส่วนสูง (cm)
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min={100} max={220}
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
            น้ำหนัก (kg)
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min={30} max={150}
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

        {/* monthly points status */}
        {alreadyEarnedThisMonth ? (
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500">
            <Clock size={16} className="text-slate-400 flex-shrink-0" />
            <span>ได้รับแต้มจาก BMI ในเดือนนี้แล้ว — รับได้อีกครั้ง <span className="font-semibold text-slate-700">{getNextMonthDate()}</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
            <Star size={16} className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
            <span>คำนวณครั้งนี้จะได้รับ <span className="font-bold">+15 แต้ม</span> (1 ครั้ง/เดือน)</span>
          </div>
        )}

        <button onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors">
          <Scale size={18} />
          คำนวณ BMI
        </button>
      </div>

      {/* Points banner */}
      {pointsEarned === true && (
        <div className="flex items-center gap-3 bg-yellow-400 rounded-2xl px-4 py-3 shadow-md shadow-yellow-200 animate-bounce">
          <Star size={22} className="text-yellow-900 fill-yellow-700 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-900">ได้รับ +15 แต้ม!</p>
            <p className="text-yellow-800 text-xs">รางวัลการคำนวณ BMI ประจำเดือน</p>
          </div>
        </div>
      )}
      {pointsEarned === false && (
        <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-4 py-3 text-slate-500 text-sm">
          <Clock size={18} className="flex-shrink-0" />
          <span>ไม่ได้รับแต้มเพิ่ม — สามารถรับได้อีกครั้ง <span className="font-semibold text-slate-700">{getNextMonthDate()}</span></span>
        </div>
      )}

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

          <BmiRecommendations bmi={result.bmi} />

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
