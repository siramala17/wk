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

export function calcWaterScore(glasses) {
  if (glasses >= 8) return 100
  if (glasses >= 7) return 88
  if (glasses >= 6) return 75
  if (glasses >= 5) return 60
  if (glasses >= 4) return 45
  if (glasses >= 2) return 28
  return 10
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
  const w = { sleep: 0.25, screen: 0.15, stress: 0.25, exercise: 0.20, water: 0.15 }
  return Math.round(
    scores.sleep * w.sleep +
    scores.screen * w.screen +
    scores.stress * w.stress +
    scores.exercise * w.exercise +
    scores.water * w.water
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

export function generateRecommendations(a) {
  const recs = []

  if (a.sleepScore < 65) {
    recs.push({
      id: 'sleep',
      category: 'การนอนหลับ',
      icon: '🌙',
      priority: a.sleepScore < 40 ? 'สูง' : 'กลาง',
      priorityColor: a.sleepScore < 40 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700',
      score: a.sleepScore,
      aiInsight: a.sleepHours < 6
        ? `คุณนอนเพียง ${a.sleepHours} ชั่วโมง ซึ่งน้อยกว่ามาตรฐาน 7-9 ชั่วโมง ส่งผลต่อสมาธิและภูมิคุ้มกัน`
        : 'เวลานอนดึกเกินไปรบกวนนาฬิกาชีวิต ทำให้ตื่นเช้าลำบากและเหนื่อยล้า',
      tips: [
        { id: 's1', text: 'กำหนดเวลานอนและตื่นให้สม่ำเสมอทุกวัน แม้วันหยุด' },
        { id: 's2', text: 'วางโทรศัพท์อย่างน้อย 1 ชั่วโมงก่อนนอน' },
        { id: 's3', text: 'ทำห้องนอนให้เย็น มืด และเงียบสงบ' },
        { id: 's4', text: 'ดื่มชาคาโมไมล์หรืออาบน้ำอุ่นก่อนนอน' },
      ],
    })
  }

  if (a.screenScore < 65) {
    recs.push({
      id: 'screen',
      category: 'เวลาหน้าจอ',
      icon: '📱',
      priority: a.screenHours > 8 ? 'สูง' : 'กลาง',
      priorityColor: a.screenHours > 8 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700',
      score: a.screenScore,
      aiInsight: `ใช้หน้าจอ ${a.screenHours} ชั่วโมง/วัน ส่งผลต่อดวงตา การนอน และสุขภาพจิต`,
      tips: [
        { id: 'sc1', text: 'ใช้กฎ 20-20-20: ทุก 20 นาที มองจุดห่าง 20 ฟุต นาน 20 วินาที' },
        { id: 'sc2', text: 'ตั้งขีดจำกัดเวลาใช้งานแอปในโทรศัพท์' },
        { id: 'sc3', text: 'ใช้โหมด Night Mode หลัง 2 ทุ่มเป็นต้นไป' },
        { id: 'sc4', text: 'ทำกิจกรรมที่ไม่ใช้หน้าจอ เช่น วาดรูป อ่านหนังสือ เดินเล่น' },
      ],
    })
  }

  if (a.stressScore < 65) {
    recs.push({
      id: 'stress',
      category: 'ความเครียด',
      icon: '🧘',
      priority: a.stressLevel >= 8 ? 'สูง' : 'กลาง',
      priorityColor: a.stressLevel >= 8 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700',
      score: a.stressScore,
      aiInsight: `ระดับความเครียด ${a.stressLevel}/10 เสี่ยงต่อปัญหาสุขภาพกายและสุขภาพจิตระยะยาว`,
      tips: [
        { id: 'st1', text: 'ฝึกหายใจลึก 4-7-8: หายใจเข้า 4 วิ กลั้น 7 วิ ปล่อย 8 วิ' },
        { id: 'st2', text: 'เขียน Journal บันทึกสิ่งที่รู้สึกดีทุกวัน 3 อย่าง' },
        { id: 'st3', text: 'พูดคุยกับเพื่อนหรือคนที่ไว้ใจได้ ไม่เก็บความรู้สึก' },
        { id: 'st4', text: 'ลองฝึกสมาธิ 10 นาทีก่อนนอน' },
      ],
    })
  }

  if (a.exerciseScore < 65) {
    recs.push({
      id: 'exercise',
      category: 'การออกกำลังกาย',
      icon: '🏃',
      priority: a.exerciseDays === 0 ? 'สูง' : 'กลาง',
      priorityColor: a.exerciseDays === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700',
      score: a.exerciseScore,
      aiInsight: a.exerciseDays === 0
        ? 'ไม่ได้ออกกำลังกายเลยในสัปดาห์นี้ เสี่ยงต่อโรคไม่ติดต่อเรื้อรัง'
        : `ออกกำลังกาย ${a.exerciseDays} วัน/สัปดาห์ ยังน้อยกว่าคำแนะนำ 3-5 วัน`,
      tips: [
        { id: 'e1', text: 'เริ่มต้นเพียง 10 นาทีต่อวัน แล้วค่อยๆ เพิ่ม' },
        { id: 'e2', text: 'เลือกกิจกรรมที่สนุก เช่น เต้น ว่ายน้ำ ปั่นจักรยาน' },
        { id: 'e3', text: 'ชวนเพื่อนออกกำลังกายด้วยกัน จะสนุกและสม่ำเสมอกว่า' },
        { id: 'e4', text: 'ใช้บันไดแทนลิฟต์ และเดินมากขึ้นในชีวิตประจำวัน' },
      ],
    })
  }

  if (a.waterScore < 65) {
    recs.push({
      id: 'water',
      category: 'การดื่มน้ำ',
      icon: '💧',
      priority: a.waterGlasses < 4 ? 'สูง' : 'กลาง',
      priorityColor: a.waterGlasses < 4 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700',
      score: a.waterScore,
      aiInsight: `ดื่มน้ำเพียง ${a.waterGlasses} แก้ว/วัน ร่างกายต้องการ 8 แก้ว (2 ลิตร) เพื่อทำงานได้ดี`,
      tips: [
        { id: 'w1', text: 'ดื่มน้ำ 1 แก้วทันทีหลังตื่นนอนทุกเช้า' },
        { id: 'w2', text: 'พกขวดน้ำติดตัวตลอดวัน' },
        { id: 'w3', text: 'ตั้งนาฬิกาเตือนดื่มน้ำทุก 2 ชั่วโมง' },
        { id: 'w4', text: 'กินผลไม้ที่มีน้ำมาก เช่น แตงโม แตงกวา ส้ม' },
      ],
    })
  }

  if (a.nutritionScore < 65) {
    recs.push({
      id: 'nutrition',
      category: 'โภชนาการ',
      icon: '🥗',
      priority: a.nutritionScore < 40 ? 'สูง' : 'กลาง',
      priorityColor: a.nutritionScore < 40 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700',
      score: a.nutritionScore,
      aiInsight: 'พฤติกรรมโภชนาการยังต้องปรับปรุง ควรรับประทานผักผลไม้และอาหารครบ 5 หมู่ให้เพียงพอทุกวัน',
      tips: [
        { id: 'n1', text: 'รับประทานผักอย่างน้อย 3 ส่วนและผลไม้ 2 ส่วนทุกวัน' },
        { id: 'n2', text: 'เลือกวิธีปรุงอาหารแบบต้ม นึ่ง หรือย่าง แทนการทอด' },
        { id: 'n3', text: 'ดื่มนมวันละ 1–2 แก้วเพื่อให้ได้แคลเซียมเพียงพอ' },
        { id: 'n4', text: 'อ่านฉลากโภชนาการก่อนซื้อ หลีกเลี่ยงอาหารที่มีน้ำตาลหรือโซเดียมสูง' },
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
  if (assessment && assessment.waterGlasses >= 8) badges.push({ id: 'b5', name: 'นักดื่มน้ำ', emoji: '💧', desc: 'ดื่มน้ำครบ 8 แก้ว', earned: true })
  else badges.push({ id: 'b5', name: 'นักดื่มน้ำ', emoji: '💧', desc: 'ดื่มน้ำครบ 8 แก้ว', earned: false })
  if (assessment && assessment.exerciseDays >= 5) badges.push({ id: 'b6', name: 'นักกีฬา', emoji: '🏅', desc: 'ออกกำลังกาย 5 วัน/สัปดาห์', earned: true })
  else badges.push({ id: 'b6', name: 'นักกีฬา', emoji: '🏅', desc: 'ออกกำลังกาย 5 วัน/สัปดาห์', earned: false })
  if (assessment && assessment.sleepHours >= 7 && assessment.sleepHours <= 9) badges.push({ id: 'b7', name: 'นักนอนดี', emoji: '😴', desc: 'นอนหลับ 7-9 ชั่วโมง', earned: true })
  else badges.push({ id: 'b7', name: 'นักนอนดี', emoji: '😴', desc: 'นอนหลับ 7-9 ชั่วโมง', earned: false })
  if (user.points >= 500) badges.push({ id: 'b8', name: 'นักสะสม', emoji: '🏆', desc: 'สะสมแต้มถึง 500', earned: true })
  else badges.push({ id: 'b8', name: 'นักสะสม', emoji: '🏆', desc: 'สะสมแต้มถึง 500', earned: false })
  return badges
}
