import React, { useState, useRef, useMemo } from 'react'
import {
  Camera, Settings, X, Trash2, ChevronLeft, ChevronRight,
  Flame, Zap, Droplets, Search, Plus, Leaf, Edit3, BookOpen
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const CIRCLE_R = 62
const CIRC = 2 * Math.PI * CIRCLE_R

const FOOD_DB = [
  // ── ข้าว/เส้น ──
  { id:'r01', cat:'ข้าว/เส้น', name:'ข้าวสวย',          qty:'1 ทัพพี',    cal:130, pro:2.7, carb:28.7, fat:0.3, fib:0.4 },
  { id:'r02', cat:'ข้าว/เส้น', name:'ข้าวผัด',           qty:'1 จาน',      cal:400, pro:12,  carb:55,   fat:15,  fib:1   },
  { id:'r03', cat:'ข้าว/เส้น', name:'ข้าวมันไก่',        qty:'1 จาน',      cal:450, pro:28,  carb:55,   fat:12,  fib:0.5 },
  { id:'r04', cat:'ข้าว/เส้น', name:'ข้าวหน้าหมูกรอบ',  qty:'1 จาน',      cal:520, pro:22,  carb:60,   fat:20,  fib:0.5 },
  { id:'r05', cat:'ข้าว/เส้น', name:'ข้าวขาหมู',         qty:'1 จาน',      cal:580, pro:30,  carb:60,   fat:22,  fib:1   },
  { id:'r06', cat:'ข้าว/เส้น', name:'ข้าวต้มหมู',        qty:'1 ชาม',      cal:180, pro:9,   carb:28,   fat:4,   fib:0.5 },
  { id:'r07', cat:'ข้าว/เส้น', name:'ข้าวหมูแดง',        qty:'1 จาน',      cal:490, pro:26,  carb:62,   fat:14,  fib:0.5 },
  { id:'r08', cat:'ข้าว/เส้น', name:'โจ๊กหมู',           qty:'1 ชาม',      cal:200, pro:12,  carb:30,   fat:5,   fib:0.5 },
  { id:'r09', cat:'ข้าว/เส้น', name:'ข้าวกระเพราไข่ดาว', qty:'1 จาน',      cal:475, pro:22,  carb:55,   fat:20,  fib:1   },
  { id:'r10', cat:'ข้าว/เส้น', name:'ก๋วยเตี๋ยวน้ำ',     qty:'1 ชาม',      cal:280, pro:15,  carb:45,   fat:5,   fib:1   },
  { id:'r11', cat:'ข้าว/เส้น', name:'ก๋วยเตี๋ยวแห้ง',    qty:'1 จาน',      cal:360, pro:18,  carb:50,   fat:10,  fib:1   },
  { id:'r12', cat:'ข้าว/เส้น', name:'ผัดไทย',            qty:'1 จาน',      cal:480, pro:18,  carb:60,   fat:18,  fib:2   },
  { id:'r13', cat:'ข้าว/เส้น', name:'ผัดซีอิ๊ว',         qty:'1 จาน',      cal:420, pro:20,  carb:55,   fat:15,  fib:2   },
  { id:'r14', cat:'ข้าว/เส้น', name:'มาม่า',             qty:'1 ซอง',      cal:340, pro:9,   carb:50,   fat:12,  fib:2   },
  { id:'r15', cat:'ข้าว/เส้น', name:'บะหมี่น้ำ',         qty:'1 ชาม',      cal:310, pro:16,  carb:48,   fat:6,   fib:1   },
  // ── กับข้าว ──
  { id:'k01', cat:'กับข้าว', name:'ผัดกะเพราหมูสับ',     qty:'1 ที่',      cal:380, pro:25, carb:15, fat:25, fib:1   },
  { id:'k02', cat:'กับข้าว', name:'ต้มยำกุ้ง',           qty:'1 ถ้วย',     cal:150, pro:18, carb:8,  fat:5,  fib:1   },
  { id:'k03', cat:'กับข้าว', name:'แกงเขียวหวานไก่',     qty:'1 ถ้วย',     cal:250, pro:20, carb:8,  fat:16, fib:1   },
  { id:'k04', cat:'กับข้าว', name:'ไข่ดาว',              qty:'1 ฟอง',      cal:90,  pro:6,  carb:0,  fat:7,  fib:0   },
  { id:'k05', cat:'กับข้าว', name:'ไข่ต้ม',              qty:'1 ฟอง',      cal:77,  pro:6.3,carb:0.6,fat:5.3,fib:0  },
  { id:'k06', cat:'กับข้าว', name:'ผักบุ้งผัดน้ำมันหอย', qty:'1 จาน',      cal:120, pro:3,  carb:8,  fat:8,  fib:2   },
  { id:'k07', cat:'กับข้าว', name:'ปลาทอด',              qty:'1 ตัว',      cal:200, pro:22, carb:8,  fat:9,  fib:0   },
  { id:'k08', cat:'กับข้าว', name:'ต้มข่าไก่',            qty:'1 ถ้วย',     cal:220, pro:18, carb:6,  fat:14, fib:0.5 },
  { id:'k09', cat:'กับข้าว', name:'ไก่ทอด',              qty:'1 ชิ้น',     cal:220, pro:20, carb:10, fat:12, fib:0   },
  { id:'k10', cat:'กับข้าว', name:'ยำวุ้นเส้น',           qty:'1 จาน',      cal:180, pro:12, carb:22, fat:5,  fib:1   },
  { id:'k11', cat:'กับข้าว', name:'ส้มตำ',               qty:'1 จาน',      cal:120, pro:5,  carb:18, fat:3,  fib:2   },
  { id:'k12', cat:'กับข้าว', name:'ลาบหมู',              qty:'1 จาน',      cal:220, pro:20, carb:10, fat:10, fib:1   },
  { id:'k13', cat:'กับข้าว', name:'แกงจืดเต้าหู้',       qty:'1 ถ้วย',     cal:130, pro:10, carb:8,  fat:6,  fib:0.5 },
  { id:'k14', cat:'กับข้าว', name:'ผัดเผ็ดหมู',          qty:'1 จาน',      cal:310, pro:22, carb:12, fat:18, fib:1   },
  { id:'k15', cat:'กับข้าว', name:'หมูสะเต๊ะ',           qty:'5 ไม้',      cal:240, pro:20, carb:12, fat:12, fib:0.5 },
  { id:'k16', cat:'กับข้าว', name:'เกาเหลาหมู',          qty:'1 ถ้วย',     cal:180, pro:15, carb:12, fat:7,  fib:0.5 },
  { id:'k17', cat:'กับข้าว', name:'หอยทอด',              qty:'1 จาน',      cal:350, pro:12, carb:40, fat:16, fib:1   },
  { id:'k18', cat:'กับข้าว', name:'พะแนงไก่',            qty:'1 ถ้วย',     cal:280, pro:22, carb:8,  fat:18, fib:0.5 },
  // ── อาหารเช้า ──
  { id:'m01', cat:'อาหารเช้า', name:'ซีเรียลนม',          qty:'1 ถ้วย',     cal:250, pro:8,  carb:45, fat:4,  fib:3   },
  { id:'m02', cat:'อาหารเช้า', name:'โอ๊ตมีล',            qty:'1 ถ้วย',     cal:150, pro:5,  carb:27, fat:2.5,fib:4   },
  { id:'m03', cat:'อาหารเช้า', name:'แพนเค้ก',            qty:'2 แผ่น',     cal:300, pro:7,  carb:45, fat:10, fib:1   },
  { id:'m04', cat:'อาหารเช้า', name:'ขนมปังทาเนยแยม',     qty:'2 แผ่น',     cal:280, pro:5,  carb:42, fat:10, fib:1   },
  { id:'m05', cat:'อาหารเช้า', name:'ไข่กระทะ',           qty:'1 จาน',      cal:220, pro:14, carb:5,  fat:16, fib:0   },
  { id:'m06', cat:'อาหารเช้า', name:'แซนด์วิชไข่',        qty:'1 ชิ้น',     cal:320, pro:15, carb:35, fat:13, fib:2   },
  { id:'m07', cat:'อาหารเช้า', name:'โยเกิร์ตรสธรรมชาติ', qty:'1 ถ้วย (200g)',cal:120,pro:10, carb:16, fat:2,  fib:0   },
  { id:'m08', cat:'อาหารเช้า', name:'กราโนล่า',           qty:'1/2 ถ้วย (50g)',cal:220,pro:5, carb:35, fat:8,  fib:3   },
  // ── ขนม/ของว่าง ──
  { id:'s01', cat:'ขนม/ของว่าง', name:'ขนมปังปิ้งเนย',    qty:'2 แผ่น',     cal:250, pro:5,  carb:35, fat:11, fib:1   },
  { id:'s02', cat:'ขนม/ของว่าง', name:'ทอดมัน',           qty:'5 ชิ้น',     cal:200, pro:10, carb:15, fat:11, fib:0.5 },
  { id:'s03', cat:'ขนม/ของว่าง', name:'ปอเปี๊ยะ',         qty:'2 ชิ้น',     cal:180, pro:6,  carb:22, fat:8,  fib:1   },
  { id:'s04', cat:'ขนม/ของว่าง', name:'มันฝรั่งทอด',      qty:'1 ซอง (30g)',cal:155, pro:2,  carb:20, fat:8,  fib:1.5 },
  { id:'s05', cat:'ขนม/ของว่าง', name:'โดนัท',            qty:'1 ชิ้น',     cal:270, pro:4,  carb:35, fat:13, fib:1   },
  { id:'s06', cat:'ขนม/ของว่าง', name:'ซาลาเปาไส้หมู',   qty:'1 ลูก',      cal:230, pro:8,  carb:35, fat:7,  fib:1   },
  { id:'s07', cat:'ขนม/ของว่าง', name:'ขนมจีบ',           qty:'3 ชิ้น',     cal:200, pro:10, carb:22, fat:8,  fib:0.5 },
  { id:'s08', cat:'ขนม/ของว่าง', name:'บิสกิต/คุกกี้',   qty:'3 ชิ้น (30g)',cal:150,pro:2,  carb:22, fat:6,  fib:0.5 },
  { id:'s09', cat:'ขนม/ของว่าง', name:'ป็อปคอร์น',        qty:'1 ถุง (25g)',cal:90,  pro:2,  carb:15, fat:3,  fib:1.5 },
  { id:'s10', cat:'ขนม/ของว่าง', name:'ข้าวเกรียบ',       qty:'1 ซอง (30g)',cal:130, pro:1,  carb:23, fat:4,  fib:0.5 },
  { id:'s11', cat:'ขนม/ของว่าง', name:'ลูกชิ้นปิ้ง',      qty:'5 ลูก',      cal:180, pro:12, carb:12, fat:8,  fib:0   },
  { id:'s12', cat:'ขนม/ของว่าง', name:'ไก่ย่าง',          qty:'1 ชิ้น',     cal:250, pro:28, carb:5,  fat:13, fib:0   },
  // ── เครื่องดื่ม ──
  { id:'d01', cat:'เครื่องดื่ม', name:'ชาเย็น',            qty:'1 แก้ว',     cal:180, pro:1,  carb:40, fat:3,  fib:0   },
  { id:'d02', cat:'เครื่องดื่ม', name:'กาแฟเย็น',          qty:'1 แก้ว',     cal:150, pro:2,  carb:30, fat:3,  fib:0   },
  { id:'d03', cat:'เครื่องดื่ม', name:'น้ำส้ม',             qty:'1 แก้ว',     cal:110, pro:2,  carb:26, fat:0,  fib:0.5 },
  { id:'d04', cat:'เครื่องดื่ม', name:'นมสด',               qty:'1 กล่อง',    cal:155, pro:8,  carb:12, fat:8,  fib:0   },
  { id:'d05', cat:'เครื่องดื่ม', name:'โกโก้เย็น',          qty:'1 แก้ว',     cal:200, pro:4,  carb:38, fat:5,  fib:1   },
  { id:'d06', cat:'เครื่องดื่ม', name:'ชานมไข่มุก',         qty:'1 แก้ว (500ml)',cal:350,pro:4,carb:65, fat:8,  fib:0   },
  { id:'d07', cat:'เครื่องดื่ม', name:'น้ำมะพร้าว',         qty:'1 ลูก',      cal:45,  pro:0.5,carb:10, fat:0.5,fib:0   },
  { id:'d08', cat:'เครื่องดื่ม', name:'น้ำเต้าหู้',         qty:'1 แก้ว',     cal:80,  pro:7,  carb:8,  fat:2,  fib:1   },
  { id:'d09', cat:'เครื่องดื่ม', name:'สมูทตี้ผลไม้',       qty:'1 แก้ว',     cal:180, pro:2,  carb:40, fat:1,  fib:3   },
  { id:'d10', cat:'เครื่องดื่ม', name:'เครื่องดื่มกีฬา',    qty:'1 ขวด (500ml)',cal:130,pro:0,carb:34, fat:0,  fib:0   },
  { id:'d11', cat:'เครื่องดื่ม', name:'เบียร์',             qty:'1 กระป๋อง',  cal:150, pro:1,  carb:13, fat:0,  fib:0   },
  { id:'d12', cat:'เครื่องดื่ม', name:'น้ำผลไม้กล่อง',     qty:'1 กล่อง (200ml)',cal:90,pro:0.5,carb:22,fat:0, fib:0.5 },
  // ── ผลไม้ ──
  { id:'f01', cat:'ผลไม้', name:'กล้วย',       qty:'1 ผล',           cal:105, pro:1.3, carb:27,  fat:0.3, fib:3   },
  { id:'f02', cat:'ผลไม้', name:'แอปเปิ้ล',    qty:'1 ผลกลาง',      cal:95,  pro:0.5, carb:25,  fat:0.3, fib:4.4 },
  { id:'f03', cat:'ผลไม้', name:'แตงโม',       qty:'2 ชิ้น (200g)',  cal:60,  pro:1.2, carb:15,  fat:0.2, fib:0.8 },
  { id:'f04', cat:'ผลไม้', name:'มะม่วง',      qty:'1/2 ผล',         cal:100, pro:0.8, carb:25,  fat:0.4, fib:1.8 },
  { id:'f05', cat:'ผลไม้', name:'ส้ม',         qty:'1 ผล',           cal:62,  pro:1.2, carb:15,  fat:0.2, fib:3.1 },
  { id:'f06', cat:'ผลไม้', name:'สับปะรด',     qty:'1 ถ้วย (165g)',  cal:82,  pro:0.9, carb:22,  fat:0.2, fib:2.3 },
  { id:'f07', cat:'ผลไม้', name:'ลำไย',        qty:'10 ผล',          cal:82,  pro:1.3, carb:21,  fat:0.1, fib:1.1 },
  { id:'f08', cat:'ผลไม้', name:'มังคุด',      qty:'3 ลูก',          cal:90,  pro:0.5, carb:22,  fat:0.3, fib:1.8 },
  { id:'f09', cat:'ผลไม้', name:'ทุเรียน',     qty:'1 เม็ด (100g)',  cal:147, pro:1.5, carb:27,  fat:5,   fib:3.8 },
  { id:'f10', cat:'ผลไม้', name:'แก้วมังกร',   qty:'1/2 ผล',         cal:60,  pro:1.2, carb:13,  fat:0,   fib:3   },
  { id:'f11', cat:'ผลไม้', name:'องุ่น',       qty:'1 ถ้วย (150g)',  cal:104, pro:1.1, carb:27,  fat:0.2, fib:1.4 },
  { id:'f12', cat:'ผลไม้', name:'สตรอว์เบอร์รี่',qty:'1 ถ้วย (150g)',cal:48,  pro:1,   carb:11.5,fat:0.5, fib:3   },
  // ── ฟาสต์ฟู้ด ──
  { id:'q01', cat:'ฟาสต์ฟู้ด', name:'แฮมเบอร์เกอร์',   qty:'1 ชิ้น',     cal:350, pro:17, carb:40, fat:14, fib:2 },
  { id:'q02', cat:'ฟาสต์ฟู้ด', name:'พิซซ่า',          qty:'1 ชิ้น',     cal:280, pro:12, carb:35, fat:10, fib:2 },
  { id:'q03', cat:'ฟาสต์ฟู้ด', name:'ไก่ทอด KFC',      qty:'1 ชิ้น',     cal:320, pro:22, carb:15, fat:19, fib:0 },
  { id:'q04', cat:'ฟาสต์ฟู้ด', name:'เฟรนช์ฟรายส์',   qty:'1 ที่กลาง',  cal:340, pro:4,  carb:44, fat:17, fib:4 },
  { id:'q05', cat:'ฟาสต์ฟู้ด', name:'ฮอทด็อก',         qty:'1 ชิ้น',     cal:280, pro:10, carb:30, fat:13, fib:1 },
  { id:'q06', cat:'ฟาสต์ฟู้ด', name:'นักเก็ตไก่',      qty:'6 ชิ้น',     cal:280, pro:15, carb:18, fat:17, fib:0 },
  { id:'q07', cat:'ฟาสต์ฟู้ด', name:'ซาลัดผัก',        qty:'1 จาน',      cal:80,  pro:3,  carb:10, fat:3,  fib:4 },
  { id:'q08', cat:'ฟาสต์ฟู้ด', name:'ข้าวกล่องสะดวกซื้อ',qty:'1 กล่อง',   cal:500, pro:18, carb:65, fat:18, fib:1 },
  // ── โปรตีน/สุขภาพ ──
  { id:'p01', cat:'โปรตีน/สุขภาพ', name:'อกไก่ต้ม',       qty:'100g',       cal:165, pro:31, carb:0,  fat:3.6,fib:0   },
  { id:'p02', cat:'โปรตีน/สุขภาพ', name:'ปลาทูนากระป๋อง', qty:'1 กระป๋อง', cal:130, pro:28, carb:0,  fat:1,  fib:0   },
  { id:'p03', cat:'โปรตีน/สุขภาพ', name:'เต้าหู้แข็ง',    qty:'100g',       cal:76,  pro:8,  carb:2,  fat:4,  fib:0.3 },
  { id:'p04', cat:'โปรตีน/สุขภาพ', name:'ไข่ขาวต้ม',      qty:'3 ฟอง',      cal:51,  pro:11, carb:0.7,fat:0.2,fib:0   },
  { id:'p05', cat:'โปรตีน/สุขภาพ', name:'เวย์โปรตีน',     qty:'1 สกู๊ป',    cal:120, pro:24, carb:3,  fat:1.5,fib:0   },
  { id:'p06', cat:'โปรตีน/สุขภาพ', name:'ถั่วเหลืองต้ม',  qty:'1/2 ถ้วย',   cal:148, pro:15, carb:8,  fat:8,  fib:5   },
  { id:'p07', cat:'โปรตีน/สุขภาพ', name:'อัลมอนด์',       qty:'1 ช้อนกอบ (30g)',cal:164,pro:6,carb:6,  fat:14, fib:3.5 },
  { id:'p08', cat:'โปรตีน/สุขภาพ', name:'กรีกโยเกิร์ต',   qty:'1 ถ้วย (200g)',cal:130,pro:17,carb:9,  fat:2,  fib:0   },
  // ── ขนมหวาน ──
  { id:'w01', cat:'ขนมหวาน', name:'ข้าวเหนียวมะม่วง',     qty:'1 ที่',      cal:420, pro:6,  carb:85, fat:8,  fib:2   },
  { id:'w02', cat:'ขนมหวาน', name:'บัวลอย',               qty:'1 ถ้วย',     cal:250, pro:3,  carb:45, fat:8,  fib:0.5 },
  { id:'w03', cat:'ขนมหวาน', name:'ไอศกรีม',              qty:'1 ลูก (100g)',cal:207,pro:3.5,carb:24, fat:11, fib:0   },
  { id:'w04', cat:'ขนมหวาน', name:'เค้กช็อกโกแลต',        qty:'1 ชิ้น',     cal:350, pro:5,  carb:50, fat:15, fib:2   },
  { id:'w05', cat:'ขนมหวาน', name:'ทับทิมกรอบ',           qty:'1 ถ้วย',     cal:180, pro:1,  carb:42, fat:1,  fib:0.5 },
  { id:'w06', cat:'ขนมหวาน', name:'วุ้นมะพร้าว',          qty:'1 ถ้วย',     cal:120, pro:0,  carb:30, fat:0,  fib:0.5 },
  { id:'w07', cat:'ขนมหวาน', name:'ลอดช่อง',              qty:'1 ถ้วย',     cal:200, pro:1,  carb:48, fat:2,  fib:0.5 },
]

const CATS = [...new Set(FOOD_DB.map(f => f.cat))]

function CalorieRing({ value, goal }) {
  const pct = Math.min(value / Math.max(goal, 1), 1)
  const dash = pct * CIRC
  const stroke = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#2563eb'
  return (
    <svg width="156" height="156" viewBox="0 0 156 156">
      <circle cx="78" cy="78" r={CIRCLE_R} fill="none" stroke="#dbeafe" strokeWidth="12" />
      <circle cx="78" cy="78" r={CIRCLE_R} fill="none" stroke={stroke} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={`${dash} ${CIRC}`}
        transform="rotate(-90 78 78)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  )
}

const TODAY = () => new Date().toISOString().split('T')[0]
const BLANK = { foodName: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' }

export default function NubCal() {
  const { calorieLog, addCalorieEntry, deleteCalorieEntry } = useHealth()

  const [viewDate, setViewDate] = useState(TODAY())
  const [showCamera, setShowCamera] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [imageType, setImageType] = useState('image/jpeg')
  const [editResult, setEditResult] = useState(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('nubcal_key') || '')
  const [goalInput, setGoalInput] = useState(() => localStorage.getItem('nubcal_goal') || '2000')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nubcal_key') || '')
  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem('nubcal_goal') || '2000'))
  const fileRef = useRef(null)

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCat, setActiveCat] = useState('')
  const [manualEntry, setManualEntry] = useState(BLANK)

  const entries  = calorieLog[viewDate] || []
  const totalCal  = entries.reduce((s, e) => s + (e.calories || 0), 0)
  const totalPro  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
  const totalCarb = entries.reduce((s, e) => s + (e.carbs    || 0), 0)
  const totalFat  = entries.reduce((s, e) => s + (e.fat      || 0), 0)
  const totalFib  = entries.reduce((s, e) => s + (e.fiber    || 0), 0)
  const isToday   = viewDate === TODAY()

  const filteredFoods = useMemo(() => {
    let list = FOOD_DB
    if (activeCat) list = list.filter(f => f.cat === activeCat)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q))
    }
    return list
  }, [searchQuery, activeCat])

  function shiftDate(delta) {
    const d = new Date(viewDate)
    d.setDate(d.getDate() + delta)
    setViewDate(d.toISOString().split('T')[0])
  }

  function formatDate(str) {
    const d = new Date(str + 'T00:00:00')
    const days   = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์']
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const type = file.type || 'image/jpeg'
    setImageType(type)
    const reader = new FileReader()
    reader.onload = ev => {
      setImagePreview(ev.target.result)
      setImageBase64(ev.target.result.split(',')[1])
      setEditResult(null); setAnalyzed(false); setError('')
      setShowCamera(true); setShowAddSheet(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function analyzeImage() {
    if (!imageBase64) return
    if (!apiKey) { setError('กรุณาตั้งค่า API Key ก่อนใช้งาน (กดไอคอนเฟืองด้านบนขวา)'); return }
    setAnalyzing(true); setError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: imageType, data: imageBase64 } },
              { type: 'text', text: `วิเคราะห์อาหารในภาพนี้และประมาณค่าโภชนาการต่อ 1 ที่เสิร์ฟ ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:\n{"foodName":"ชื่ออาหาร (ภาษาไทย)","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"description":"คำอธิบายสั้น ๆ"}\nถ้าไม่พบอาหารในภาพให้ตอบ: {"error":"ไม่พบอาหารในภาพ"}\ncalories=kcal, ตัวเลขอื่นเป็นกรัม ห้ามใส่หน่วยในตัวเลข` },
            ],
          }],
        }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error?.message || `API Error ${res.status}`) }
      const data = await res.json()
      const text = data.content[0].text.trim()
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) throw new Error('ไม่สามารถอ่านผลได้')
      const parsed = JSON.parse(m[0])
      if (parsed.error) throw new Error(parsed.error)
      setEditResult({ ...parsed }); setAnalyzed(true)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setAnalyzing(false)
    }
  }

  function saveEntry() {
    if (!editResult) return
    addCalorieEntry(viewDate, {
      id: Date.now(), image: imagePreview,
      foodName: editResult.foodName || 'ไม่ทราบชื่ออาหาร',
      calories: Number(editResult.calories) || 0,
      protein:  Number(editResult.protein)  || 0,
      carbs:    Number(editResult.carbs)    || 0,
      fat:      Number(editResult.fat)      || 0,
      fiber:    Number(editResult.fiber)    || 0,
      description: editResult.description || '',
      timestamp: new Date().toISOString(),
    })
    closeModal()
  }

  function closeModal() {
    setShowCamera(false); setImagePreview(null); setImageBase64(null)
    setEditResult(null); setAnalyzed(false); setError('')
  }

  function addFromDB(food) {
    addCalorieEntry(viewDate, {
      id: Date.now(), foodName: food.name,
      calories: food.cal, protein: food.pro, carbs: food.carb,
      fat: food.fat, fiber: food.fib, description: food.qty,
      timestamp: new Date().toISOString(),
    })
    setShowSearch(false); setSearchQuery(''); setActiveCat('')
  }

  function saveManualEntry() {
    if (!manualEntry.foodName.trim()) return
    addCalorieEntry(viewDate, {
      id: Date.now(), foodName: manualEntry.foodName,
      calories: Number(manualEntry.calories) || 0,
      protein:  Number(manualEntry.protein)  || 0,
      carbs:    Number(manualEntry.carbs)    || 0,
      fat:      Number(manualEntry.fat)      || 0,
      fiber:    Number(manualEntry.fiber)    || 0,
      timestamp: new Date().toISOString(),
    })
    setManualEntry(BLANK); setShowManual(false)
  }

  function saveSettings() {
    localStorage.setItem('nubcal_key', apiKeyInput)
    localStorage.setItem('nubcal_goal', goalInput)
    setApiKey(apiKeyInput); setGoal(parseInt(goalInput) || 2000); setShowSettings(false)
  }

  const nutrientBars = [
    { label:'โปรตีน',  val:totalPro,  max:60,  color:'bg-blue-500',   track:'bg-blue-100',   icon:<Zap      size={11} className="text-blue-500"   /> },
    { label:'คาร์บ',   val:totalCarb, max:250, color:'bg-yellow-400', track:'bg-yellow-100', icon:<Flame    size={11} className="text-yellow-500" /> },
    { label:'ไขมัน',  val:totalFat,  max:65,  color:'bg-orange-400', track:'bg-orange-100', icon:<Droplets size={11} className="text-orange-400" /> },
    { label:'ใยอาหาร', val:totalFib,  max:25,  color:'bg-green-500',  track:'bg-green-100',  icon:<Leaf     size={11} className="text-green-500"  /> },
  ]

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-blue-700 tracking-tight">nubcal</h1>
          <p className="text-xs text-slate-400">ติดตามแคลอรีและสารอาหาร</p>
        </div>
        <button onClick={() => { setApiKeyInput(apiKey); setGoalInput(String(goal)); setShowSettings(true) }}
          className="p-2 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Date nav */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-700">{formatDate(viewDate)}</p>
            {isToday && <span className="text-xs text-blue-500 font-medium">วันนี้</span>}
          </div>
          <button onClick={() => shiftDate(1)} disabled={isToday}
            className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 disabled:opacity-25 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700">สรุปโภชนาการ</h2>
            <span className="text-xs text-slate-400 bg-blue-50 px-2 py-1 rounded-full">เป้า {goal.toLocaleString()} kcal</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <CalorieRing value={totalCal} goal={goal} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800 leading-none">{totalCal.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">kcal</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
              {nutrientBars.map(({ label, val, max, color, track, icon }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1">{icon}{label}</span>
                    <span className="font-medium">{Math.round(val * 10) / 10}g<span className="text-slate-300 font-normal">/{max}</span></span>
                  </div>
                  <div className={`h-1.5 ${track} rounded-full overflow-hidden`}>
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(val / max * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs pt-0.5">
                {totalCal <= goal
                  ? <span className="text-slate-400">เหลือ <span className="text-blue-600 font-semibold">{(goal - totalCal).toLocaleString()}</span> kcal</span>
                  : <span className="text-red-500 font-medium">เกินเป้า {(totalCal - goal).toLocaleString()} kcal</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Add button */}
        {isToday && (
          <button onClick={() => setShowAddSheet(true)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-white text-base shadow-md shadow-blue-200 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Plus size={20} />
            เพิ่มรายการอาหาร
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        {/* Food log */}
        {entries.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <Flame size={40} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">ยังไม่มีรายการอาหาร</p>
            {isToday && <p className="text-xs mt-1">กดปุ่มด้านบนเพื่อเพิ่มอาหาร</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm p-3 flex gap-3 items-start">
                {entry.image
                  ? <img src={entry.image} alt={entry.foodName} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  : <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>🍽️</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{entry.foodName}</p>
                    <button onClick={() => deleteCalorieEntry(viewDate, entry.id)}
                      className="p-1 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-blue-600 font-bold text-base mt-0.5">{entry.calories} <span className="text-xs font-normal">kcal</span></p>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {[
                      ['P', entry.protein, 'text-blue-500'],
                      ['C', entry.carbs, 'text-yellow-600'],
                      ['F', entry.fat, 'text-orange-500'],
                      ...(entry.fiber > 0 ? [['ใย', entry.fiber, 'text-green-600']] : [])
                    ].map(([l, v, cls]) => (
                      <span key={l} className={`text-[11px] font-semibold ${cls}`}>{l} {Math.round(v * 10) / 10}g</span>
                    ))}
                  </div>
                  {entry.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{entry.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Sheet ── */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAddSheet(false)}>
          <div className="bg-white rounded-t-3xl w-full p-4 space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1" />
            <h3 className="font-bold text-slate-800 text-center pb-1">เพิ่มรายการอาหาร</h3>
            {[
              { icon:<Camera   size={22} className="text-blue-600"  />, bg:'#eff6ff', title:'ถ่ายรูป / เลือกภาพ',    desc:'วิเคราะห์โภชนาการด้วย AI',         action:() => fileRef.current?.click() },
              { icon:<BookOpen size={22} className="text-amber-600" />, bg:'#fffbeb', title:'ค้นหาจากฐานข้อมูล',   desc:`อาหารไทย ${FOOD_DB.length} รายการ`,  action:() => { setShowAddSheet(false); setShowSearch(true) } },
              { icon:<Edit3    size={22} className="text-green-600" />, bg:'#f0fdf4', title:'บันทึกเอง',             desc:'ระบุชื่ออาหารและสารอาหารเอง',       action:() => { setShowAddSheet(false); setShowManual(true) } },
            ].map(({ icon, bg, title, desc, action }) => (
              <button key={title} onClick={action}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-95 transition-all text-left"
                style={{ background: bg, border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/80">{icon}</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
            <button onClick={() => setShowAddSheet(false)}
              className="w-full py-3 rounded-2xl text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* ── Search Modal ── */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">ค้นหาอาหาร</h3>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setActiveCat('') }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input placeholder="ค้นหาอาหาร..." autoFocus
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide flex-shrink-0">
              {['', ...CATS].map(c => (
                <button key={c || 'all'} onClick={() => setActiveCat(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${activeCat === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'}`}>
                  {c || 'ทั้งหมด'}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
              {filteredFoods.length === 0
                ? <p className="text-center text-slate-400 text-sm py-8">ไม่พบรายการ</p>
                : filteredFoods.map(food => (
                  <button key={food.id} onClick={() => addFromDB(food)}
                    className="w-full bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl p-3.5 text-left flex items-center justify-between gap-3 transition-all active:scale-95">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{food.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{food.qty} · {food.cat}</p>
                      <div className="flex gap-2 mt-1.5">
                        {[['P', food.pro,'text-blue-500'], ['C', food.carb,'text-yellow-600'], ['F', food.fat,'text-orange-500']].map(([l, v, cls]) => (
                          <span key={l} className={`text-[10px] font-bold ${cls}`}>{l} {v}g</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-600 font-extrabold text-lg leading-none">{food.cal}</p>
                      <p className="text-[10px] text-slate-400">kcal</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Manual Entry Modal ── */}
      {showManual && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">บันทึกเอง</h3>
              <button onClick={() => setShowManual(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">ชื่ออาหาร *</label>
                <input placeholder="เช่น ข้าวผัดหมู"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={manualEntry.foodName} onChange={e => setManualEntry(p => ({ ...p, foodName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">🔥 แคลอรี่ (kcal)</label>
                <input type="number" min="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={manualEntry.calories} onChange={e => setManualEntry(p => ({ ...p, calories: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['💪 โปรตีน (g)', 'protein'], ['🌾 คาร์โบไฮเดรต (g)', 'carbs'], ['🫙 ไขมัน (g)', 'fat'], ['🥦 ใยอาหาร (g)', 'fiber']].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                    <input type="number" min="0"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                      value={manualEntry[key]} onChange={e => setManualEntry(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <button onClick={saveManualEntry} disabled={!manualEntry.foodName.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                บันทึกลงประวัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera / Analysis Modal ── */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">วิเคราะห์อาหาร</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {imagePreview && <img src={imagePreview} alt="อาหาร" className="w-full h-52 object-cover rounded-2xl" />}
              {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}
              {!analyzed && (
                <button onClick={analyzeImage} disabled={analyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-colors">
                  {analyzing
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> กำลังวิเคราะห์...</>
                    : '🔍 วิเคราะห์สารอาหาร'}
                </button>
              )}
              {editResult && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 text-sm">ผลการวิเคราะห์ (แก้ไขได้)</h4>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">ชื่ออาหาร</label>
                    <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                      value={editResult.foodName || ''} onChange={e => setEditResult(p => ({ ...p, foodName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[['🔥 แคลอรี่ (kcal)', 'calories'], ['💪 โปรตีน (g)', 'protein'], ['🌾 คาร์โบไฮเดรต (g)', 'carbs'], ['🫙 ไขมัน (g)', 'fat']].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                        <input type="number" min="0"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                          value={editResult[key] ?? ''} onChange={e => setEditResult(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  {editResult.description && <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">{editResult.description}</p>}
                  <button onClick={saveEntry} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors">
                    บันทึกลงประวัติ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">ตั้งค่า nubcal</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Anthropic API Key</label>
                <input type="password" placeholder="sk-ant-api03-..." autoComplete="off"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} />
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">ใช้สำหรับวิเคราะห์ภาพอาหารด้วย AI • API Key เก็บในเครื่องของคุณเท่านั้น</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">เป้าหมายแคลอรีต่อวัน (kcal)</label>
                <input type="number" min="500" max="9999"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={goalInput} onChange={e => setGoalInput(e.target.value)} />
              </div>
              <button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors">
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
