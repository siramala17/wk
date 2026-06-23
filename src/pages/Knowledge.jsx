import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const sections = [
  {
    id: 'intro',
    emoji: '🛹',
    title: 'เคล็ดลับสุขภาพดีสมวัยรุ่น',
    color: 'from-teal-400 to-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    content: (
      <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
        <p>
          <span className="font-bold text-teal-600">วัยรุ่น</span> เป็นช่วงที่มีการเจริญเติบโตอย่างรวดเร็ว ร่างกายจะมีการเปลี่ยนแปลงหลายด้าน
          เด็กผู้หญิงจะเริ่มมีเอว สะโพก หน้าอก และรักสวยรักงาม ส่วนเด็กผู้ชายจะเริ่มรู้สึกถึงกล้ามเนื้อที่แข็งแรง
          และต้องการการยอมรับจากเพื่อน ๆ
        </p>
        <p>ปัจจัยที่สำคัญต่อสุขภาพในช่วงวัยนี้มีอยู่ <span className="font-bold text-pink-600">3 สิ่ง</span> คือ</p>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: 'อ. อาหาร', emoji: '🥗', color: 'bg-green-100 text-green-700' },
            { label: 'อ. ออกกำลังกาย', emoji: '🏃', color: 'bg-indigo-100 text-indigo-700' },
            { label: 'อ. อารมณ์', emoji: '😊', color: 'bg-pink-100 text-pink-700' },
          ].map(item => (
            <div key={item.label} className={`${item.color} rounded-2xl p-3 text-center font-bold text-xs`}>
              <div className="text-3xl mb-1">{item.emoji}</div>
              {item.label}
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs">ที่ควรดูแลให้เด็กวัยรุ่นมีภาวะที่สมดุล</p>
      </div>
    ),
  },
  {
    id: 'food',
    emoji: '🥗',
    title: 'สุขภาพดีสมวัยด้วย อ. อาหาร',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    content: (
      <div className="space-y-5 text-sm text-slate-700">
        <p className="leading-relaxed">
          <span className="font-bold text-green-600">วัยรุ่น</span>เป็นวัยที่ต้องระวังเรื่องการกินอาหาร เพราะสามารถเลือกกินด้วยตนเองได้อย่างอิสระ
          และมักเลือกแต่อาหารที่ได้รับความนิยม ตามแฟชั่น วัยนี้จึงควรสร้างนิสัยการกินที่ดีตั้งแต่เนิ่น ๆ
        </p>

        {/* ตารางพลังงาน */}
        <div>
          <h3 className="font-bold text-green-700 mb-2">ปริมาณอาหารที่ควรได้รับ</h3>
          <div className="overflow-x-auto rounded-xl border border-green-200">
            <table className="w-full text-xs text-center">
              <thead>
                <tr className="bg-green-100">
                  <th className="px-2 py-2 text-left text-green-800">กลุ่มอาหาร</th>
                  <th className="px-2 py-2 text-green-800">หน่วย</th>
                  <th className="px-2 py-2 text-pink-700">ชาย/หญิง 9-13 ปี หญิง 14-18 ปี<br/><span className="font-bold">1,600 แคล</span></th>
                  <th className="px-2 py-2 text-indigo-700">ชาย 14-18 ปี<br/><span className="font-bold">2,000 แคล</span></th>
                  <th className="px-2 py-2 text-purple-700">นักกีฬา<br/><span className="font-bold">2,400 แคล</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['ข้าว แป้ง', 'ทัพพี', '8', '10', '12'],
                  ['ผัก', 'ทัพพี', '4', '5', '6'],
                  ['ผลไม้', 'ส่วน', '4', '4', '5'],
                  ['เนื้อสัตว์', 'ช้อนกินข้าว', '6', '9', '12'],
                  ['นม', 'แก้ว', '2', '2', '2'],
                  ['น้ำมัน', 'ช้อนชา', '5', '7', '9'],
                  ['น้ำตาล', 'ช้อนชา', '4', '6', '6'],
                  ['เกลือ', 'ช้อนชา', <span className="text-red-500 text-[10px]">≤ 1 ช้อนชา/วัน</span>, '', ''],
                ].map(([food, unit, a, b, c]) => (
                  <tr key={food} className="border-t border-green-100 even:bg-green-50/50">
                    <td className="px-2 py-1.5 text-left font-medium">{food}</td>
                    <td className="px-2 py-1.5 text-slate-500">{unit}</td>
                    <td className="px-2 py-1.5">{a}</td>
                    <td className="px-2 py-1.5">{b}</td>
                    <td className="px-2 py-1.5">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* สารอาหารเด่น */}
        <div>
          <h3 className="font-bold text-green-700 mb-2">สารอาหารเด่นที่วัยรุ่นต้องการ</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🌾', name: 'คาร์โบไฮเดรต', desc: '55-60% ของพลังงานทั้งหมด ได้แก่ ข้าว แป้ง เผือก มัน ข้าวโพด', color: 'bg-yellow-50 border-yellow-200' },
              { icon: '🥩', name: 'โปรตีน', desc: '1.0-1.2 ก./กก. น้ำหนักตัว ได้แก่ เนื้อสัตว์ ปลา ไข่ นม ถั่ว', color: 'bg-red-50 border-red-200' },
              { icon: '🫒', name: 'ไขมัน', desc: '~30% ของพลังงาน ได้แก่ น้ำมันพืช น้ำมันปลา เนย งา', color: 'bg-amber-50 border-amber-200' },
              { icon: '🥛', name: 'แคลเซียม', desc: 'สร้างกระดูก เพิ่มความสูง ได้แก่ นม ปลาเล็ก กุ้ง ผักใบเขียว', color: 'bg-indigo-50 border-indigo-200' },
              { icon: '🫀', name: 'ธาตุเหล็ก', desc: 'องค์ประกอบเม็ดเลือดแดง ได้แก่ ตับ เลือด เนื้อแดง', color: 'bg-orange-50 border-orange-200' },
              { icon: '🥦', name: 'วิตามิน', desc: 'สำคัญต่อการสลายอาหาร มีในผัก ผลไม้ทุกชนิด', color: 'bg-emerald-50 border-emerald-200' },
              { icon: '💧', name: 'น้ำ', desc: 'ร่างกายต้องการ 8-10 แก้ว/วัน ช่วยรักษาสมดุลอุณหภูมิ', color: 'bg-cyan-50 border-cyan-200' },
              { icon: '🦴', name: 'ฟอสฟอรัส', desc: 'องค์ประกอบกระดูก ได้แก่ ถั่ว ไข่ ปลา เนื้อสัตว์ นม', color: 'bg-violet-50 border-violet-200' },
            ].map(item => (
              <div key={item.name} className={`${item.color} border rounded-xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-bold text-xs text-slate-700">{item.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4 อย่า 5 อยาก */}
        <div>
          <h3 className="font-bold text-green-700 mb-3">4 อย่า 5 อยาก สร้างนิสัยการกินที่ดี</h3>
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <p className="font-bold text-red-600 text-xs mb-2">🚫 4 อย่า</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {[
                  'กินอาหารที่มีไขมันสูง (โดนัท แครกเกอร์ คุกกี้ พาย ขนมที่ใช้มาร์การีน)',
                  'กินอาหารรสจัด เน้นอาหารรสจืด ลดเครื่องดื่มหวาน',
                  'กินอาหารที่ปนเปื้อน เน้นอาหารสุกใหม่ ร้านได้มาตรฐาน',
                  'ดื่มเครื่องดื่มแอลกอฮอล์ เน้นน้ำเปล่า 8-10 แก้ว/วัน',
                ].map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-red-500 flex-shrink-0">•</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
              <p className="font-bold text-green-600 text-xs mb-2">✅ 5 อยาก</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {[
                  'กินอาหารครบ 5 หมู่ หลากหลาย ไม่ซ้ำซาก ดูแลน้ำหนักสม่ำเสมอ',
                  'กินข้าวเป็นหลัก เน้นข้าวกล้อง ข้าวโพด ลูกเดือย ข้าวไม่ขัดสี',
                  'กินพืชผักและผลไม้ตามธรรมชาติให้มาก เพื่อได้ใยอาหาร',
                  'กินเนื้อสัตว์ไม่ติดมัน ไข่และถั่วเมล็ดแห้ง เน้นปลา',
                  'ดื่มนมที่เหมาะสมกับวัย เน้นนมรสธรรมชาติ (รสจืด)',
                ].map((t, i) => (
                  <li key={i} className="flex gap-2"><span className="text-green-500 flex-shrink-0">•</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'exercise',
    emoji: '🏃',
    title: 'สุขภาพดีสมวัยด้วย อ. ออกกำลังกาย',
    color: 'from-indigo-400 to-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <div className="bg-indigo-100 rounded-2xl p-4 text-center">
          <div className="text-5xl mb-1">⏱️</div>
          <p className="font-bold text-indigo-800 text-lg">อย่างน้อย 60 นาทีต่อวัน</p>
          <p className="text-indigo-600 text-xs mt-1">ขยับกาย เคลื่อนไหว ออกกำลังกายรวมกัน</p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          เริ่มจากพยายามลดเวลาที่ใช้ไปกับการนั่ง ๆ นอน ๆ เช่น ดูทีวี เล่นเกม ใช้คอมพิวเตอร์
          ให้ได้มากที่สุด แล้วเลือกออกกำลังกายประเภทเหล่านี้
        </p>

        <div className="space-y-3">
          {[
            {
              icon: '🚴',
              title: 'กิจกรรมแอโรบิค',
              color: 'bg-sky-50 border-sky-200',
              titleColor: 'text-sky-700',
              desc: 'กิจกรรมที่มีการเคลื่อนไหวร่างกายอย่างต่อเนื่องตั้งแต่ 10 นาทีขึ้นไป เน้นออกแรงกล้ามเนื้อมัดใหญ่',
              examples: 'เดินเร็ว วิ่ง ปั่นจักรยาน เล่นกีฬา ว่ายน้ำ',
            },
            {
              icon: '💪',
              title: 'กิจกรรมพัฒนากล้ามเนื้อ',
              color: 'bg-purple-50 border-purple-200',
              titleColor: 'text-purple-700',
              desc: 'พัฒนาความแข็งแรงและทนทาน ทำ 12-15 ครั้งต่อเซ็ต 2-3 รอบ อย่างน้อย 3 วัน/สัปดาห์ ส่งผลต่อการเจริญเติบโตและความสูง',
              examples: 'วิดพื้น ปีนป่าย ขว้างปา กระโดด ยกน้ำหนัก ดึงข้อ โหนบาร์',
            },
            {
              icon: '🦴',
              title: 'กิจกรรมพัฒนากระดูก',
              color: 'bg-orange-50 border-orange-200',
              titleColor: 'text-orange-700',
              desc: 'เสริมสร้างความแข็งแรงกระดูก เน้นกิจกรรมที่มีแรงกระแทกจากการกระโดด',
              examples: 'วิ่ง การเต้น กระโดดยาง บาสเกตบอล วอลเลย์บอล ฟุตบอล ตะกร้อ เทนนิส แบดมินตัน กระโดดเชือก',
            },
            {
              icon: '❤️',
              title: 'กิจกรรมเสริมสร้างระบบหายใจและไหลเวียนโลหิต',
              color: 'bg-red-50 border-red-200',
              titleColor: 'text-red-700',
              desc: 'เสริมสร้างระบบหัวใจและหลอดเลือด',
              examples: 'วิ่ง ว่ายน้ำ ฟุตซอล การเดินทางไกล เดินเร็ว บาสเกตบอล ปั่นจักรยาน',
            },
          ].map(item => (
            <div key={item.title} className={`${item.color} border rounded-2xl p-3`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{item.icon}</span>
                <p className={`font-bold text-xs ${item.titleColor}`}>{item.title}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-1">{item.desc}</p>
              <p className="text-[11px] text-slate-500"><span className="font-semibold">ตัวอย่าง:</span> {item.examples}</p>
            </div>
          ))}
        </div>

        {/* TIPS */}
        <div className="bg-teal-50 border-2 border-dashed border-teal-300 rounded-2xl p-4">
          <p className="font-bold text-teal-700 mb-2">💡 TIPS การออกกำลังกาย</p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {[
              'ต้องมีการอบอุ่นร่างกาย ยืดเหยียดกล้ามเนื้อ ก่อนและหลังออกกำลังกาย',
              'ควรเริ่มจากระดับเบาก่อน แล้วค่อย ๆ เพิ่มระดับเป็นปานกลางจนถึงหนัก',
              'พักดื่มน้ำทุก ๆ 15-20 นาที หรือจิบน้อย ๆ แต่บ่อยครั้ง',
            ].map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-teal-500">●</span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'emotion',
    emoji: '😊',
    title: 'สุขภาพดีสมวัยด้วย อ. อารมณ์',
    color: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p className="leading-relaxed text-xs">
          วัยรุ่นช่วงอายุตั้งแต่ 12 ปีขึ้นไป เป็นวัยที่จะมีการรับรู้อารมณ์ความรู้สึกของตัวเองได้ดีมากกว่าวัยเด็ก
          การเข้าใจและจัดการอารมณ์ได้อย่างเหมาะสม จะช่วยให้วัยรุ่นมีพัฒนาการทางจิตใจที่เข้มแข็ง
        </p>

        {/* ลักษณะอารมณ์วัยรุ่น */}
        <div className="bg-pink-100 border border-pink-200 rounded-2xl p-4">
          <p className="font-bold text-pink-700 text-xs mb-2">💭 รู้จักลักษณะอารมณ์ทั่วไปของวัยรุ่น</p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {[
              'อารมณ์เปลี่ยนแปลงขึ้น ๆ ลง ๆ เหมือนคนวัยทอง',
              'มีความวิตกกังวล กลัวการเป็นผู้ใหญ่',
              'ต้องการความรักความห่วงใยในรูปแบบที่ต่างจากเด็ก',
              'มีความรักและสนใจเพศตรงข้าม',
              'อยากเป็นอิสระ ทำอะไรได้ด้วยตัวเอง ไม่ชอบทำตามคำสั่ง',
              'อยากรู้อยากเห็น อยากลอง ชอบความตื่นเต้นท้าทาย',
              'ต้องการความถูกต้องและยุติธรรม',
              'ต้องการการยอมรับว่าเป็นส่วนหนึ่งของกลุ่ม',
            ].map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-pink-400">●</span>{t}</li>
            ))}
          </ul>
        </div>

        {/* 6 ขั้นตอนจัดการอารมณ์ */}
        <div>
          <p className="font-bold text-pink-700 mb-2">🧠 6 วิธีจัดการกับอารมณ์ของวัยรุ่น</p>
          <div className="space-y-2">
            {[
              {
                num: '1',
                title: 'สังเกตความรู้สึกของตัวเอง',
                desc: 'ลองสังเกตว่าเมื่อไรที่เรามีอารมณ์นี้ เช่น "วันนี้รู้สึกดีมากที่ครูชม" อาจใช้วิธีจดบันทึกไว้',
              },
              {
                num: '2',
                title: 'สังเกตอารมณ์ความรู้สึกและที่มา',
                desc: 'ขณะที่เรากำลังรู้สึก มีเหตุการณ์อะไรเกิดขึ้น และเราคิดอะไรในขณะนั้น',
              },
              {
                num: '3',
                title: 'ยอมรับและเข้าใจอารมณ์ที่เกิดขึ้น',
                desc: 'เมื่อเข้าใจและยอมรับอารมณ์ที่เกิดขึ้นได้ เราก็จะจัดการอารมณ์ตัวเองได้ดี',
              },
              {
                num: '4',
                title: 'เรียนรู้ผลกระทบจากการแสดงอารมณ์',
                desc: 'คนที่ฝึกควบคุมการแสดงออกของอารมณ์จะสามารถมองเห็นผลกระทบข้างหน้าได้',
              },
              {
                num: '5',
                title: 'ฝึกจัดการกับอารมณ์',
                desc: 'เช่น การระบายความรู้สึกกับคนใกล้ชิด การเบี่ยงเบนความสนใจ การออกกำลังกาย',
              },
              {
                num: '6',
                title: 'เปลี่ยนอารมณ์เป็นเรื่องเชิงบวก',
                desc: 'เช่น แต่งเพลง แต่งกลอน เขียนนิยาย เขียนบล็อก และกิจกรรมสร้างสรรค์อื่น ๆ',
              },
            ].map(item => (
              <div key={item.num} className="flex gap-3 bg-white border border-pink-100 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.num}
                </div>
                <div>
                  <p className="font-semibold text-xs text-pink-700">{item.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-purple-700">💜 จำไว้ว่า </span>
          การรับรู้และจัดการอารมณ์ของตนเองเป็นทักษะที่สามารถฝึกฝนได้
          โดยอาศัยความเข้าใจและการฝึกพัฒนาบ่อย ๆ
        </div>
      </div>
    ),
  },
]

function Section({ sec }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`${sec.bg} border ${sec.border} rounded-3xl overflow-hidden shadow-sm`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sec.color} flex items-center justify-center text-2xl flex-shrink-0 shadow`}>
          {sec.emoji}
        </div>
        <p className="flex-1 font-bold text-slate-800 text-sm leading-tight">{sec.title}</p>
        {open ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="bg-white/70 rounded-2xl p-4">
            {sec.content}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Knowledge() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

      {/* header */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-5xl">📚</div>
          <div>
            <p className="text-teal-100 text-xs">สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ</p>
            <h1 className="text-xl font-bold leading-tight mt-0.5">เคล็ดลับสุขภาพดี<br/>สมวัยรุ่น</h1>
            <p className="text-teal-200 text-xs mt-1">โดย สสส. • SOOK PUBLISHING</p>
          </div>
        </div>
      </div>

      {sections.map(sec => <Section key={sec.id} sec={sec} />)}

      {/* footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-600 mb-1">📖 แหล่งข้อมูลเพิ่มเติม</p>
        <p>ศูนย์เรียนรู้สุขภาวะ สสส. • แอปพลิเคชัน SOOK Library</p>
        <p>resource.thaihealth.or.th • โทร. 02-343-1500 กด 3</p>
      </div>
    </div>
  )
}
