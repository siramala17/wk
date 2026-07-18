export function calcSleepScore(hours, bedtime) {
  let s = 100
  if (hours < 5) s -= 50
  else if (hours < 6) s -= 35
  else if (hours < 7) s -= 20
  else if (hours > 10) s -= 15
  const h = parseInt(bedtime.split(':')[0])
  if (h >= 1 && h < 5) s -= 30
  else if (h === 0) s -= 25
  else if (h === 23) s -= 15
  else if (h === 22) s -= 5
  return Math.max(0, Math.min(100, s))
}

export function calcScreenScore(hours) {
  if (hours <= 2) return 100
  if (hours <= 3) return 85
  if (hours <= 5) return 65
  if (hours <= 7) return 45
  if (hours <= 10) return 25
  return 10
}

export function calcStressScore(level) {
  return Math.max(0, Math.round(100 - (level - 1) * 10.5))
}

export function calcExerciseScore(days, minutes) {
  const total = days * minutes
  if (total >= 150) return 100
  if (total >= 120) return 85
  if (total >= 75) return 70
  if (total >= 30) return 50
  if (days > 0) return 30
  return 0
}

export function calcBmiScore(bmi) {
  if (bmi >= 18.5 && bmi < 23) return 100
  if (bmi >= 23 && bmi < 25) return 85
  if (bmi >= 17 && bmi < 18.5) return 75
  if (bmi >= 25 && bmi < 27.5) return 65
  if (bmi >= 15 && bmi < 17) return 50
  if (bmi >= 27.5 && bmi < 30) return 45
  return 25
}

export function calcOverallScore(scores) {
  const w = { sleep: 0.30, screen: 0.15, stress: 0.30, exercise: 0.25 }
  return Math.round(
    scores.sleep * w.sleep +
    scores.screen * w.screen +
    scores.stress * w.stress +
    scores.exercise * w.exercise
  )
}

export function getHealthLevel(score) {
  if (score >= 80) return { label: 'สุขภาพดีเยี่ยม', emoji: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: '#10B981', bar: 'from-emerald-400 to-emerald-600' }
  if (score >= 65) return { label: 'สุขภาพดี', emoji: '😊', color: 'text-blue-600', bg: 'bg-blue-50', ring: '#2563EB', bar: 'from-blue-400 to-blue-600' }
  if (score >= 50) return { label: 'พอใช้ได้', emoji: '😐', color: 'text-yellow-600', bg: 'bg-yellow-50', ring: '#D97706', bar: 'from-yellow-400 to-amber-500' }
  if (score >= 35) return { label: 'ควรปรับปรุง', emoji: '😟', color: 'text-orange-600', bg: 'bg-orange-50', ring: '#EA580C', bar: 'from-orange-400 to-red-500' }
  return { label: 'ต้องดูแลด่วน', emoji: '😰', color: 'text-red-600', bg: 'bg-red-50', ring: '#DC2626', bar: 'from-red-400 to-red-700' }
}

export function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'น้ำหนักน้อยกว่าเกณฑ์', color: 'text-blue-600', bg: 'bg-blue-100', advice: 'ควรเพิ่มการรับประทานอาหารที่มีคุณค่าทางโภชนาการ' }
  if (bmi < 23) return { label: 'น้ำหนักปกติ', color: 'text-emerald-600', bg: 'bg-emerald-100', advice: 'ดีมาก! รักษาน้ำหนักและออกกำลังกายสม่ำเสมอ' }
  if (bmi < 25) return { label: 'น้ำหนักเกินเล็กน้อย', color: 'text-yellow-600', bg: 'bg-yellow-100', advice: 'ควรดูแลอาหารและเพิ่มการออกกำลังกาย' }
  if (bmi < 30) return { label: 'น้ำหนักเกิน', color: 'text-orange-600', bg: 'bg-orange-100', advice: 'แนะนำปรึกษาแพทย์และปรับพฤติกรรมการกิน' }
  return { label: 'โรคอ้วน', color: 'text-red-600', bg: 'bg-red-100', advice: 'ควรพบแพทย์เพื่อรับคำแนะนำด้านสุขภาพโดยด่วน' }
}

// เกณฑ์ผ่าน ≥70 คะแนน ตามมาตรฐานกระทรวงสาธารณสุขไทย (3อ.2ส.)
const MOPH_PASS = 70

function mophPriority(score) {
  if (score < 40) return { label: 'สูง', color: 'bg-red-100 text-red-700' }
  if (score < 60) return { label: 'กลาง', color: 'bg-yellow-100 text-yellow-700' }
  return { label: 'ต่ำ', color: 'bg-blue-100 text-blue-700' }
}

export function generateRecommendations(a) {
  const recs = []

  // มิติ 1: โภชนาการ — อ้างอิงกรมอนามัย กระทรวงสาธารณสุข
  if ((a.nutritionScore ?? 0) < MOPH_PASS) {
    const p = mophPriority(a.nutritionScore)
    recs.push({
      id: 'nutrition',
      category: 'โภชนาการ',
      icon: '🍱',
      priority: p.label,
      priorityColor: p.color,
      score: a.nutritionScore,
      aiInsight: a.nutritionScore < 40
        ? 'พฤติกรรมการกินต้องปรับปรุงด่วน กรมอนามัยแนะนำให้กินอาหารครบ 5 หมู่ ผัก ≥5 ส่วน/วัน ผลไม้ ≥3 ส่วน/วัน และลดน้ำตาล-โซเดียม'
        : 'โภชนาการยังต่ำกว่าเกณฑ์ กรมอนามัยกำหนดให้วัยรุ่นกินอาหารครบ 5 หมู่ ผักผลไม้หลากสี และดื่มนม 2–3 แก้วต่อวัน',
      tips: [
        { id: 'n1', text: 'กินผัก ≥5 ส่วน และผลไม้ ≥3 ส่วนทุกวัน (เกณฑ์กรมอนามัย)' },
        { id: 'n2', text: 'ดื่มนมวัว 2–3 แก้ว/วัน เพื่อรับแคลเซียม 800–1,000 mg ตามที่วัยรุ่นต้องการ' },
        { id: 'n3', text: 'ลดอาหารหวาน มัน เค็ม — น้ำตาล <25g/วัน โซเดียม <2,000mg/วัน' },
        { id: 'n4', text: 'เลือกปรุงอาหารแบบต้ม นึ่ง ย่าง แทนทอด และดื่มน้ำเปล่า 8–10 แก้ว/วัน' },
      ],
    })
  }

  // มิติ 2: การออกกำลังกาย — อ้างอิง WHO 2020 + กรมอนามัย (วัยรุ่น ≥60 นาที/วัน)
  if ((a.exerciseScore ?? 0) < MOPH_PASS) {
    const p = mophPriority(a.exerciseScore)
    recs.push({
      id: 'exercise',
      category: 'การออกกำลังกาย',
      icon: '🏃',
      priority: p.label,
      priorityColor: p.color,
      score: a.exerciseScore,
      aiInsight: a.exerciseScore < 40
        ? 'การเคลื่อนไหวร่างกายน้อยมาก ตาม WHO (2020) และกรมอนามัย วัยรุ่นควรออกกำลังกายระดับปานกลาง–หนัก ≥60 นาที/วัน ทุกวัน'
        : 'การออกกำลังกายยังต่ำกว่าเกณฑ์ WHO กำหนดให้วัยรุ่น (5–17 ปี) ออกกำลังกาย ≥60 นาที/วัน และเสริมกล้ามเนื้อ ≥3 วัน/สัปดาห์',
      tips: [
        { id: 'e1', text: 'ออกกำลังกายระดับปานกลาง–หนัก ≥60 นาทีทุกวัน (เกณฑ์ WHO + กรมอนามัย)' },
        { id: 'e2', text: 'เสริมสร้างกล้ามเนื้อ (วิดพื้น สควอท) อย่างน้อย 3 วัน/สัปดาห์' },
        { id: 'e3', text: 'หลีกเลี่ยงการนั่งต่อเนื่องเกิน 1 ชั่วโมง ลุกยืดเส้นหรือเดินทุกชั่วโมง' },
        { id: 'e4', text: 'เลือกกิจกรรมที่สนุก เช่น เต้น ว่ายน้ำ บาสเกตบอล ฟุตบอล เพื่อความต่อเนื่อง' },
      ],
    })
  }

  // มิติ 3: สุขภาพจิต-อารมณ์ — อ้างอิงกรมสุขภาพจิต กระทรวงสาธารณสุข
  if ((a.stressScore ?? 0) < MOPH_PASS) {
    const p = mophPriority(a.stressScore)
    recs.push({
      id: 'stress',
      category: 'สุขภาพจิต-อารมณ์',
      icon: '🧘',
      priority: p.label,
      priorityColor: p.color,
      score: a.stressScore,
      aiInsight: a.stressScore < 40
        ? 'สุขภาพจิตต้องดูแลเร่งด่วน กรมสุขภาพจิตแนะนำให้พูดคุยกับผู้เชี่ยวชาญ โทรสายด่วน 1323 ตลอด 24 ชั่วโมง'
        : 'มีสัญญาณความเครียดหรืออารมณ์แปรปรวน กรมสุขภาพจิตแนะนำฝึกสติ พักผ่อนเพียงพอ และพูดคุยกับคนที่ไว้ใจ',
      tips: [
        { id: 'st1', text: 'ฝึกหายใจลึก 4-7-8 หรือสมาธิ 10 นาที/วัน ลดฮอร์โมนความเครียด Cortisol' },
        { id: 'st2', text: 'นอนหลับ 8–10 ชั่วโมง/คืน (เกณฑ์กรมสุขภาพจิตสำหรับวัยรุ่น) และวางโทรศัพท์ก่อนนอน' },
        { id: 'st3', text: 'พูดคุยกับผู้ปกครอง เพื่อนสนิท หรือครูแนะแนวเมื่อรู้สึกหนักใจ' },
        { id: 'st4', text: 'หากเครียดต่อเนื่องหรือมีความคิดทางลบ โทรสายด่วนกรมสุขภาพจิต 1323' },
      ],
    })
  }

  return recs
}

export function getUserLevel(points) {
  const level = Math.floor(points / 100) + 1
  const progress = points % 100
  return { level, progress, nextLevel: 100 - progress }
}

export function getBadges(user, assessment, bmi) {
  const badges = []
  if (user.streak >= 1) badges.push({ id: 'b1', name: 'นักเริ่มต้น', emoji: '🌱', desc: 'ทำแบบประเมินครั้งแรก', earned: true })
  if (user.streak >= 3) badges.push({ id: 'b2', name: 'ต่อเนื่อง 3 วัน', emoji: '🔥', desc: 'ทำแบบประเมิน 3 วันติดต่อ', earned: true })
  if (user.streak >= 7) badges.push({ id: 'b3', name: 'นักสร้างนิสัย', emoji: '💪', desc: 'ทำแบบประเมิน 7 วันติดต่อ', earned: true })
  else badges.push({ id: 'b3', name: 'นักสร้างนิสัย', emoji: '💪', desc: 'ทำแบบประเมิน 7 วันติดต่อ', earned: false })
  if (bmi) badges.push({ id: 'b4', name: 'รู้จักตัวเอง', emoji: '📏', desc: 'วัดค่า BMI แล้ว', earned: true })
  else badges.push({ id: 'b4', name: 'รู้จักตัวเอง', emoji: '📏', desc: 'วัดค่า BMI เพื่อรับ', earned: false })
  if (assessment && assessment.exerciseDays >= 5) badges.push({ id: 'b6', name: 'นักกีฬา', emoji: '🏅', desc: 'ออกกำลังกาย 5 วัน/สัปดาห์', earned: true })
  else badges.push({ id: 'b6', name: 'นักกีฬา', emoji: '🏅', desc: 'ออกกำลังกาย 5 วัน/สัปดาห์', earned: false })
  if (assessment && assessment.sleepHours >= 7 && assessment.sleepHours <= 9) badges.push({ id: 'b7', name: 'นักนอนดี', emoji: '😴', desc: 'นอนหลับ 7-9 ชั่วโมง', earned: true })
  else badges.push({ id: 'b7', name: 'นักนอนดี', emoji: '😴', desc: 'นอนหลับ 7-9 ชั่วโมง', earned: false })
  if (user.points >= 500) badges.push({ id: 'b8', name: 'นักสะสม', emoji: '🏆', desc: 'สะสมแต้มถึง 500', earned: true })
  else badges.push({ id: 'b8', name: 'นักสะสม', emoji: '🏆', desc: 'สะสมแต้มถึง 500', earned: false })
  return badges
}
