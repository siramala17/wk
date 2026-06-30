import React, { useState, useMemo } from 'react'
import { Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

// ── Sources ────────────────────────────────────────────────────
const SRC = {
  anamai:    { short: 'กรมอนามัย',     url: 'https://www.anamai.moph.go.th' },
  nutrition: { short: 'กองโภชนาการ',   url: 'https://nutrition.anamai.moph.go.th' },
  dmh:       { short: 'กรมสุขภาพจิต',  url: 'https://www.dmh.go.th' },
  ddc:       { short: 'กรมควบคุมโรค',  url: 'https://ddc.moph.go.th' },
  who:       { short: 'WHO Thailand',   url: 'https://www.who.int/thailand' },
}

// ── Categories ──────────────────────────────────────────────────
const CATS = [
  { id: 'all',       label: 'ทั้งหมด',      emoji: '📚', color: 'bg-slate-600' },
  { id: 'nutrition', label: 'โภชนาการ',     emoji: '🥗', color: 'bg-emerald-600' },
  { id: 'exercise',  label: 'ออกกำลังกาย', emoji: '🏃', color: 'bg-blue-600' },
  { id: 'mental',    label: 'สุขภาพจิต',   emoji: '🧠', color: 'bg-purple-600' },
  { id: 'disease',   label: 'ป้องกันโรค',  emoji: '🛡️', color: 'bg-red-600' },
  { id: 'sleep',     label: 'การนอนหลับ',  emoji: '💤', color: 'bg-indigo-600' },
  { id: 'weight',    label: 'น้ำหนัก/BMI', emoji: '⚖️', color: 'bg-orange-600' },
]

const CAT_GRAD = {
  nutrition: 'from-emerald-500 to-teal-400',
  exercise:  'from-blue-500 to-sky-400',
  mental:    'from-purple-500 to-violet-400',
  disease:   'from-red-500 to-rose-400',
  sleep:     'from-indigo-600 to-blue-400',
  weight:    'from-orange-500 to-amber-400',
}
const CAT_ACCENT = {
  nutrition: { num: 'bg-emerald-500', box: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  exercise:  { num: 'bg-blue-500',    box: 'bg-blue-50 border-blue-200 text-blue-800' },
  mental:    { num: 'bg-purple-500',  box: 'bg-purple-50 border-purple-200 text-purple-800' },
  disease:   { num: 'bg-red-500',     box: 'bg-red-50 border-red-200 text-red-800' },
  sleep:     { num: 'bg-indigo-600',  box: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  weight:    { num: 'bg-orange-500',  box: 'bg-orange-50 border-orange-200 text-orange-800' },
}

// ── Illustration Scene Component ────────────────────────────────
function IllustrationScene({ scene }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* decorative bg circles */}
      <div className="absolute top-3 right-5 w-16 h-16 rounded-full bg-white/10" />
      <div className="absolute bottom-3 left-5 w-12 h-12 rounded-full bg-white/10" />
      <div className="absolute top-2 left-10 w-8 h-8 rounded-full bg-white/10" />
      {/* floating sparkles */}
      <span className="absolute top-3 left-4 text-white/60 text-lg">✦</span>
      <span className="absolute bottom-4 right-6 text-white/60 text-sm">✦</span>
      <span className="absolute top-5 right-12 text-white/40 text-xs">●</span>
      {/* main scene */}
      <div className="relative z-10 flex items-end justify-center">
        {scene.map((item, i) => (
          <span key={i}
            style={{
              fontSize: item.size,
              lineHeight: 1,
              marginBottom: item.mb ?? 0,
              marginLeft: item.ml ?? 3,
              marginRight: item.mr ?? 3,
              display: 'inline-block',
            }}>
            {item.e}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Knowledge Articles ──────────────────────────────────────────
const ARTICLES = [
  // ══ โภชนาการ ══
  {
    id: 'n1', cat: 'nutrition',
    title: 'ธงโภชนาการสำหรับวัยรุ่น',
    subtitle: 'กินอาหาร 5 หมู่ให้ครบทุกวัน',
    scene: [
      { e: '🍚', size: 40, mb: 0 }, { e: '🥦', size: 46, mb: 4 },
      { e: '🍎', size: 50, mb: 6 }, { e: '🥩', size: 44, mb: 2 },
      { e: '🥛', size: 38, mb: 0 },
    ],
    tips: [
      { icon: '🍚', text: 'ข้าว/แป้ง 8–12 ทัพพี/วัน เน้นข้าวกล้อง ขนมปังโฮลวีต' },
      { icon: '🥦', text: 'ผัก 5–6 ทัพพี/วัน หลากสี ทั้งผักสดและผักปรุงสุก' },
      { icon: '🍎', text: 'ผลไม้ 4–5 ส่วน/วัน (กล้วย 1 ผล หรือส้ม 1 ผล = 1 ส่วน)' },
      { icon: '🥩', text: 'เนื้อสัตว์/ไข่/ถั่ว 6–12 ช้อนกินข้าว/วัน เน้นปลา ไข่ ถั่ว' },
      { icon: '🥛', text: 'นม 2–3 แก้ว/วัน เพื่อแคลเซียมสร้างกระดูกในวัยเจริญเติบโต' },
    ],
    warning: '⚠️ จำกัด น้ำตาล ≤6 ช้อนชา · โซเดียม ≤2,000 มก. · ไขมันทรานส์ = 0 ต่อวัน',
    src: [SRC.nutrition, SRC.anamai],
  },
  {
    id: 'n2', cat: 'nutrition',
    title: 'แร่ธาตุ-วิตามินสำคัญในวัยรุ่น',
    subtitle: 'สารอาหารที่จำเป็นต่อการเจริญเติบโต',
    scene: [
      { e: '🦷', size: 38, mb: 0 }, { e: '💪', size: 54, mb: 4 },
      { e: '☀️', size: 48, mb: 8 }, { e: '🐟', size: 44, mb: 2 },
    ],
    tips: [
      { icon: '🦷', text: 'แคลเซียม 1,000 มก./วัน จากนม ปลาเล็กปลาน้อย ผักใบเขียวเข้ม' },
      { icon: '🩸', text: 'ธาตุเหล็ก: ชาย 11 มก. / หญิง 15 มก./วัน จากตับ เลือดหมู เนื้อแดง' },
      { icon: '☀️', text: 'วิตามิน D 600 IU/วัน รับได้จากแสงแดด 15 นาที/วัน และอาหารทะเล' },
      { icon: '🧡', text: 'วิตามิน A 600–900 mcg/วัน จากตับ ไข่แดง ฟักทอง แครอต' },
      { icon: '🧠', text: 'ไอโอดีน 150 mcg/วัน จากอาหารทะเล และเกลือไอโอดีน' },
    ],
    src: [SRC.nutrition],
  },
  {
    id: 'n3', cat: 'nutrition',
    title: 'อาหารที่วัยรุ่นควรหลีกเลี่ยง',
    subtitle: 'ลดเสี่ยงโรคเรื้อรังตั้งแต่วันนี้',
    scene: [
      { e: '🚫', size: 36, mb: 8 }, { e: '🥤', size: 48, mb: 2 },
      { e: '🍟', size: 52, mb: 0 }, { e: '🧂', size: 38, mb: 2 },
    ],
    tips: [
      { icon: '🥤', text: 'น้ำอัดลม ชานม เครื่องดื่มชูกำลัง — น้ำตาลสูง เสี่ยงเบาหวาน ฟันผุ' },
      { icon: '🍟', text: 'ของทอด ฟาสต์ฟู้ด — ไขมันทรานส์สูง เสี่ยงไขมันในเลือดสูง โรคหัวใจ' },
      { icon: '🧂', text: 'มาม่า ขนมกรุบกรอบ ซีอิ๊ว — โซเดียมสูง เสี่ยงความดันโลหิตสูง' },
      { icon: '🍬', text: 'ลูกอม เยลลี่ เบเกอรี่หวาน — น้ำตาลเพิ่มพลังงานว่างเปล่า' },
    ],
    warning: '📊 วัยรุ่นไทย 36.9% ดื่มน้ำหวาน/น้ำอัดลมทุกวัน (กรมอนามัย 2566)',
    src: [SRC.anamai, SRC.ddc],
  },

  // ══ ออกกำลังกาย ══
  {
    id: 'e1', cat: 'exercise',
    title: 'เกณฑ์การออกกำลังกาย WHO วัยรุ่น',
    subtitle: 'เคลื่อนไหวให้ครบ ร่างกายแข็งแรง',
    scene: [
      { e: '🏃‍♂️', size: 58, mb: 0 }, { e: '💨', size: 36, mb: 14 },
      { e: '⏱️', size: 36, mb: 20 }, { e: '🏁', size: 40, mb: 4 },
    ],
    tips: [
      { icon: '⏱️', text: 'กิจกรรมระดับปานกลาง–หนัก ≥60 นาทีต่อวัน เช่น วิ่ง ว่ายน้ำ ปั่นจักรยาน' },
      { icon: '💪', text: 'เสริมสร้างกล้ามเนื้อ ≥3 วัน/สัปดาห์ วิดพื้น ดึงข้อ ยกน้ำหนักเบา' },
      { icon: '🦴', text: 'เสริมความแข็งแรงกระดูก ≥3 วัน/สัปดาห์ กระโดด บาส วอลเลย์ กระโดดเชือก' },
      { icon: '📱', text: 'ลดพฤติกรรมนั่งนิ่ง ≤2 ชม./วัน ลุกยืดเหยียด 5 นาทีทุก 30 นาที' },
    ],
    warning: '💡 เพิ่มกิจกรรมทีละนิด: เดินขึ้นบันได ปั่นจักรยานไปโรงเรียน เล่นกีฬากับเพื่อน',
    src: [SRC.who, SRC.anamai],
  },
  {
    id: 'e2', cat: 'exercise',
    title: 'ประโยชน์ของการออกกำลังกาย',
    subtitle: 'ดีต่อร่างกาย จิตใจ และสมอง',
    scene: [
      { e: '❤️', size: 38, mb: 18 }, { e: '🧠', size: 44, mb: 22 },
      { e: '💪', size: 56, mb: 0 }, { e: '😁', size: 42, mb: 12 },
      { e: '⚡', size: 34, mb: 24 },
    ],
    tips: [
      { icon: '🦴', text: 'กระดูกและกล้ามเนื้อ: สร้าง Bone Density สูงสุดช่วงวัยรุ่น ป้องกันกระดูกพรุน' },
      { icon: '❤️', text: 'หัวใจและหลอดเลือด: ลด LDL เพิ่ม HDL ลดเสี่ยงโรคหัวใจถึง 35%' },
      { icon: '😊', text: 'สุขภาพจิต: กระตุ้น Endorphin ลดความเครียด-วิตกกังวลได้ถึง 30%' },
      { icon: '🧠', text: 'สมองและการเรียน: เพิ่มความจำ สมาธิ IQ เลือดไหลเวียนไปสมองมากขึ้น' },
    ],
    src: [SRC.anamai, SRC.dmh],
  },

  // ══ สุขภาพจิต ══
  {
    id: 'm1', cat: 'mental',
    title: 'สัญญาณเตือนสุขภาพจิตวัยรุ่น',
    subtitle: 'รู้เร็ว ขอความช่วยเหลือทัน',
    scene: [
      { e: '💭', size: 38, mb: 20 }, { e: '😔', size: 54, mb: 0 },
      { e: '💭', size: 32, mb: 24 }, { e: '🆘', size: 38, mb: 14 },
    ],
    tips: [
      { icon: '😢', text: 'ซึมเศร้า: รู้สึกเศร้า ว่างเปล่า หมดความสนใจสิ่งที่เคยชอบ > 2 สัปดาห์' },
      { icon: '😰', text: 'วิตกกังวล: กังวลมากเกินเหตุ นอนไม่หลับ ใจสั่น ปวดท้องไม่มีสาเหตุ' },
      { icon: '😤', text: 'ความเครียด: ปวดหัว ท้องอืด หงุดหงิดง่าย ขาดสมาธิ อ่อนเพลีย' },
      { icon: '🚨', text: 'ควรพบผู้เชี่ยวชาญ: คิดทำร้ายตนเอง ทำกิจวัตรไม่ได้ หรือใช้สารเสพติด' },
    ],
    warning: '📞 สายด่วนสุขภาพจิต 1323 ตลอด 24 ชม. | ไม่มีค่าใช้จ่าย',
    src: [SRC.dmh],
  },
  {
    id: 'm2', cat: 'mental',
    title: 'ดูแลสุขภาพจิตด้วยตนเอง',
    subtitle: 'เทคนิคจากกรมสุขภาพจิต',
    scene: [
      { e: '🌸', size: 36, mb: 16 }, { e: '😊', size: 56, mb: 0 },
      { e: '🌱', size: 42, mb: 8 }, { e: '✨', size: 32, mb: 28 },
    ],
    tips: [
      { icon: '🌬️', text: 'หายใจลึก 4-7-8: หายใจเข้า 4 วิ กลั้น 7 วิ ออก 8 วิ ลดเครียดใน 60 วิ' },
      { icon: '🧘', text: 'Mindfulness 5–10 นาที/วัน: สังเกตความคิดและความรู้สึกโดยไม่ตัดสิน' },
      { icon: '🤝', text: 'เชื่อมสัมพันธ์: คุยกับคนที่ไว้ใจอย่างน้อย 1 คน/วัน ระบายสิ่งที่กังวล' },
      { icon: '📱', text: 'จำกัดโซเชียลมีเดีย < 2 ชม./วัน ใช้ > 3 ชม./วัน เพิ่มเสี่ยงซึมเศร้า 1.6 เท่า' },
      { icon: '🎨', text: 'กิจกรรมสร้างสรรค์: เขียน วาด เล่นดนตรี ทำอาหาร ลด Cortisol ได้ดี' },
    ],
    src: [SRC.dmh],
  },

  // ══ ป้องกันโรค ══
  {
    id: 'd1', cat: 'disease',
    title: 'วัคซีนที่วัยรุ่นควรได้รับ',
    subtitle: 'ป้องกันก่อน ดีกว่ารักษาทีหลัง',
    scene: [
      { e: '🛡️', size: 52, mb: 2 }, { e: '💉', size: 48, mb: 4 },
      { e: '✅', size: 36, mb: 16 }, { e: '🦠', size: 32, mb: 12, ml: 0 },
    ],
    tips: [
      { icon: '💉', text: 'HPV 2 เข็ม อายุ 11–12 ปี ป้องกันมะเร็งปากมดลูก มะเร็งช่องปาก' },
      { icon: '💊', text: 'dTpa (บูสเตอร์) 1 เข็ม อายุ 11–12 ปี คอตีบ บาดทะยัก ไอกรน' },
      { icon: '🤧', text: 'ไข้หวัดใหญ่ ฉีดทุกปี ช่วง ต.ค.–พ.ย. โดยเฉพาะผู้มีโรคเรื้อรัง' },
      { icon: '🫀', text: 'ไวรัสตับอักเสบ บี (HBV) 3 เข็ม ถ้ายังไม่ครบ ป้องกันมะเร็งตับ' },
    ],
    warning: '📋 ตรวจสมุดวัคซีนเด็ก และสอบถามแพทย์/พยาบาลว่าต้องฉีดอะไรเพิ่มเติม',
    src: [SRC.ddc],
  },
  {
    id: 'd2', cat: 'disease',
    title: 'ป้องกันโรค NCDs ตั้งแต่วัยรุ่น',
    subtitle: 'โรคไม่ติดต่อเรื้อรังเริ่มสะสมตั้งแต่เด็ก',
    scene: [
      { e: '🫀', size: 52, mb: 4 }, { e: '⚠️', size: 38, mb: 18 },
      { e: '🩺', size: 48, mb: 2 }, { e: '💊', size: 36, mb: 10 },
    ],
    tips: [
      { icon: '🍬', text: 'เบาหวานชนิด 2 พบเพิ่ม 4 เท่าในวัยรุ่นอ้วน ลดน้ำตาล ออกกำลังกาย' },
      { icon: '🩸', text: 'ความดันโลหิตสูง 1 ใน 7 ของวัยรุ่นไทยมีความดันสูง ลดโซเดียม เลิกเครียด' },
      { icon: '🫀', text: 'ไขมันในเลือดสูง เริ่มสะสมตั้งแต่วัยเด็ก หลีกเลี่ยงไขมันทรานส์' },
      { icon: '🚬', text: 'มะเร็ง: ไม่สูบบุหรี่ ไม่ดื่มแอลกอฮอล์ ฉีดวัคซีน HPV ครบ' },
    ],
    warning: '🇹🇭 คนไทยเสียชีวิตจากโรค NCDs 74% — ส่วนใหญ่ป้องกันได้ด้วยพฤติกรรมสุขภาพ',
    src: [SRC.ddc, SRC.anamai],
  },

  // ══ การนอนหลับ ══
  {
    id: 's1', cat: 'sleep',
    title: 'ชั่วโมงนอนที่เหมาะสมแต่ละวัย',
    subtitle: 'WHO แนะนำปริมาณการนอนหลับ',
    scene: [
      { e: '🌙', size: 40, mb: 22 }, { e: '😴', size: 58, mb: 0 },
      { e: '⭐', size: 32, mb: 28 }, { e: '✨', size: 28, mb: 32 },
    ],
    tips: [
      { icon: '👦', text: 'เด็ก 6–12 ปี: 9–12 ชม./คืน เพื่อพัฒนาการสมองและร่างกายที่สมบูรณ์' },
      { icon: '🧑', text: 'วัยรุ่น 13–18 ปี: 8–10 ชม./คืน เข้านอน 22:00–23:00 ตื่น 6:00–7:00' },
      { icon: '🧑‍💼', text: 'ผู้ใหญ่ 18+ ปี: 7–9 ชม./คืน น้อยกว่า 6 ชม. เพิ่มเสี่ยงโรคหัวใจ เบาหวาน' },
      { icon: '📵', text: 'ปิดหน้าจอก่อนนอน ≥1 ชม. แสงสีฟ้ายับยั้ง Melatonin ทำให้หลับยาก' },
    ],
    warning: '⚠️ วัยรุ่นไทย 69% นอนน้อยกว่า 8 ชม./คืน (กรมสุขภาพจิต 2565)',
    src: [SRC.dmh, SRC.who],
  },
  {
    id: 's2', cat: 'sleep',
    title: 'ผลเสียของการนอนน้อย',
    subtitle: 'นอนพอ = เรียนดี อารมณ์ดี ไม่อ้วน',
    scene: [
      { e: '😵', size: 52, mb: 0 }, { e: '📚', size: 40, mb: 8 },
      { e: '😤', size: 44, mb: 4 }, { e: '⬆️', size: 32, mb: 18 },
    ],
    tips: [
      { icon: '🧠', text: 'สมองและการเรียน: ความจำลด 40% สมาธิสั้น ตัดสินใจช้า คะแนนสอบตก' },
      { icon: '😡', text: 'อารมณ์: หงุดหงิดง่าย วิตกกังวล ทะเลาะกับคนรอบข้างบ่อยขึ้น' },
      { icon: '⚖️', text: 'น้ำหนักตัว: กระตุ้นฮอร์โมนหิว Ghrelin +24% อ้วนง่ายขึ้น กินมากขึ้น' },
      { icon: '🤒', text: 'ภูมิคุ้มกัน: ป่วยง่ายขึ้น 3 เท่า การนอนหลับกระตุ้นการสร้าง T-cell' },
    ],
    warning: '💡 เคล็ดลับ: เข้านอนเวลาเดิมทุกวัน · ห้องเย็น 18–22°C · ปิดม่าน · ไม่ดูจอก่อนนอน',
    src: [SRC.dmh, SRC.anamai],
  },

  // ══ น้ำหนัก/BMI ══
  {
    id: 'w1', cat: 'weight',
    title: 'เกณฑ์ BMI คนไทย (WHO Asia-Pacific)',
    subtitle: 'ค่า BMI ที่เหมาะสมสำหรับคนเอเชีย',
    scene: [
      { e: '⚖️', size: 56, mb: 0 }, { e: '📊', size: 40, mb: 10 },
      { e: '😊', size: 44, mb: 6 }, { e: '🎯', size: 36, mb: 14 },
    ],
    tips: [
      { icon: '⬇️', text: 'BMI < 18.5 — น้ำหนักต่ำกว่าเกณฑ์: เสี่ยงขาดสารอาหาร กล้ามเนื้อน้อย' },
      { icon: '✅', text: 'BMI 18.5–22.9 — น้ำหนักปกติ: เกณฑ์มาตรฐาน WHO Asia-Pacific 2000' },
      { icon: '⚠️', text: 'BMI 23–24.9 — เริ่มเกิน: เสี่ยงโรค เกณฑ์คนเอเชียต่ำกว่าตะวันตก' },
      { icon: '🔴', text: 'BMI 25–29.9 — อ้วน 1: เสี่ยงเบาหวาน ความดัน ไขมันในเลือดสูง' },
      { icon: '🆘', text: 'BMI ≥30 — อ้วน 2+: ต้องการดูแลโดยทีมแพทย์และโภชนากร' },
    ],
    warning: '🇹🇭 วัยรุ่นไทยอ้วน 13.6% (ชาย) · 9.6% (หญิง) (กรมอนามัย 2566)',
    src: [SRC.anamai, SRC.who],
  },
  {
    id: 'w2', cat: 'weight',
    title: 'ควบคุมน้ำหนักอย่างถูกต้องในวัยรุ่น',
    subtitle: 'ลดน้ำหนักที่ดี ≠ อดอาหาร',
    scene: [
      { e: '🥗', size: 44, mb: 4 }, { e: '🏃‍♀️', size: 56, mb: 0 },
      { e: '💪', size: 40, mb: 10 }, { e: '😁', size: 38, mb: 14 },
    ],
    tips: [
      { icon: '🎯', text: 'เป้าหมายปลอดภัย: ลด 0.5 kg/สัปดาห์ ลดเร็วเกินทำกล้ามเนื้อหด กระดูกบาง' },
      { icon: '🚫', text: 'ห้ามอดอาหาร: ต้องได้ ≥1,200–1,500 kcal/วัน ลดแค่ 300–500 kcal จากน้ำตาล' },
      { icon: '🥦', text: 'ปรับอาหาร: เพิ่มผัก โปรตีน ใยอาหาร ลดน้ำตาลและไขมัน ไม่ตัดหมู่อาหาร' },
      { icon: '🏋️', text: 'ออกกำลังกาย ≥60 นาที/วัน ผสมแอโรบิค + เวตเทรนนิ่ง รักษา Metabolic Rate' },
      { icon: '😴', text: 'นอนหลับ 8–10 ชม. ลด Ghrelin เพิ่ม Leptin ควบคุมความหิวได้ดีขึ้น' },
    ],
    warning: '🚫 ไม่แนะนำ: ยาลดน้ำหนัก · ยาระบาย · อาเจียนหลังกิน · งดอาหารนานกว่า 5 ชม.',
    src: [SRC.anamai, SRC.nutrition],
  },
]

// ── Tip Row ─────────────────────────────────────────────────────
function TipRow({ tip, num, accent }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-5 h-5 rounded-full ${accent.num} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
        <span className="text-[9px] font-black text-white">{num}</span>
      </div>
      <div className="flex items-start gap-1.5 flex-1 min-w-0">
        <span className="text-base flex-shrink-0 -mt-0.5">{tip.icon}</span>
        <p className="text-[12px] text-slate-700 leading-relaxed">{tip.text}</p>
      </div>
    </div>
  )
}

// ── Card Component ──────────────────────────────────────────────
function KnowledgeCard({ article }) {
  const [open, setOpen] = useState(false)
  const cat    = CATS.find(c => c.id === article.cat)
  const grad   = CAT_GRAD[article.cat]
  const accent = CAT_ACCENT[article.cat]
  const topTips  = article.tips.slice(0, 3)
  const moreTips = article.tips.slice(3)

  return (
    <div className="rounded-3xl overflow-hidden shadow-md bg-white border border-slate-100">

      {/* ── Illustration Banner ── */}
      <div className={`relative bg-gradient-to-br ${grad} overflow-hidden`} style={{ height: 160 }}>
        <IllustrationScene scene={article.scene} />
        {/* category badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
          <span className="text-sm">{cat.emoji}</span>
          <span className="text-[11px] font-bold text-slate-700">{cat.label}</span>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="px-4 pt-3.5 pb-1">
        <h3 className="font-black text-slate-800 text-[15px] leading-snug">{article.title}</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{article.subtitle}</p>
      </div>

      {/* ── Tips ── */}
      <div className="px-4 pt-2 space-y-2.5">
        {topTips.map((tip, i) => (
          <TipRow key={i} tip={tip} num={i + 1} accent={accent} />
        ))}
        {moreTips.length > 0 && (
          <>
            {open && moreTips.map((tip, i) => (
              <TipRow key={i + 3} tip={tip} num={i + 4} accent={accent} />
            ))}
            <button onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors pb-0.5">
              {open
                ? <><ChevronUp size={13} /> ย่อ</>
                : <><ChevronDown size={13} /> ดูเพิ่มอีก {moreTips.length} ข้อ</>}
            </button>
          </>
        )}
      </div>

      {/* ── Warning / Info Box ── */}
      {article.warning
        ? <div className={`mx-4 mt-2.5 mb-3 rounded-2xl border px-3 py-2.5 ${accent.box}`}>
            <p className="text-[11px] leading-relaxed font-medium">{article.warning}</p>
          </div>
        : <div className="pb-3" />
      }

      {/* ── Sources ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3.5 border-t border-slate-100 pt-2.5">
        <span className="text-[9px] text-slate-400 font-semibold tracking-wide uppercase">อ้างอิง</span>
        {article.src.map(s => (
          <a key={s.short} href={s.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-teal-600 font-semibold transition-colors underline underline-offset-2">
            {s.short} <ExternalLink size={9} />
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────
export default function Knowledge() {
  const [activeCat, setActiveCat] = useState('all')
  const [query, setQuery]         = useState('')

  const filtered = useMemo(() => {
    let list = activeCat === 'all' ? ARTICLES : ARTICLES.filter(a => a.cat === activeCat)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.tips.some(t => t.text.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeCat, query])

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

      {/* Header */}
      <div className="rounded-3xl p-5 text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7490, #0891b2, #06b6d4)' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
        <img src="/char-girl-run.png" alt="" style={{ position:'absolute', right:0, bottom:0, height:145, width:'auto', opacity:.9, pointerEvents:'none', userSelect:'none' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl">
            📚
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">คลังความรู้สุขภาพ</h1>
            <p className="text-cyan-200 text-xs mt-0.5">อินโฟกราฟิกพร้อมคำแนะนำ จากหน่วยงานสาธารณสุขไทย</p>
            <p className="text-cyan-300 text-[10px] mt-0.5">กรมอนามัย · กรมควบคุมโรค · กรมสุขภาพจิต · WHO</p>
          </div>
        </div>
        {/* Search */}
        <div className="relative mt-4 flex items-center bg-white/20 rounded-2xl px-3 py-2.5 gap-2">
          <Search size={14} className="text-white/70 flex-shrink-0" />
          <input type="text" placeholder="ค้นหา เช่น แคลเซียม วัคซีน นอนหลับ..."
            value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-xs placeholder-white/60 outline-none" />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/70 hover:text-white text-sm font-bold">✕</button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeCat === c.id
                ? `${c.color} text-white shadow-md scale-105`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-400 px-1">
        {filtered.length === ARTICLES.length
          ? `${ARTICLES.length} บทความ`
          : `พบ ${filtered.length} จาก ${ARTICLES.length} บทความ`}
        {query && <span className="text-teal-600 font-semibold"> · "{query}"</span>}
      </p>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(a => <KnowledgeCard key={a.id} article={a} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl">🔍</div>
          <p className="font-bold text-sm mt-3">ไม่พบบทความที่ค้นหา</p>
          <button onClick={() => { setQuery(''); setActiveCat('all') }}
            className="mt-3 text-xs text-teal-600 font-bold hover:text-teal-700">ล้างตัวกรอง</button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          📎 ข้อมูลอ้างอิงจาก กรมอนามัย · กรมสุขภาพจิต · กรมควบคุมโรค กระทรวงสาธารณสุข และ WHO Thailand
          · ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำวินิจฉัยทางการแพทย์ · หากมีอาการผิดปกติควรปรึกษาแพทย์
        </p>
      </div>
    </div>
  )
}
