import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// ── วิธีตั้งค่า Firebase ──────────────────────────────────────
// 1. ไปที่ https://console.firebase.google.com
// 2. กด "Add project" สร้าง project ใหม่
// 3. เข้า project → Project Settings → "Your apps" → กด </> (Web)
// 4. ลงทะเบียน app แล้วคัดลอก firebaseConfig มาวางแทน YOUR_... ด้านล่าง
// 5. เปิด Firestore: ไปที่ Build → Firestore Database → Create database
//    (เลือก Start in test mode สำหรับช่วงเริ่มต้น)
// ─────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

export const firebaseReady = !firebaseConfig.apiKey.startsWith('YOUR_')

let _db = null

if (firebaseReady) {
  try {
    const app = initializeApp(firebaseConfig)
    _db = getFirestore(app)
  } catch (e) {
    console.error('[Firebase] init failed:', e)
  }
} else {
  console.warn('[Firebase] ยังไม่ได้ตั้งค่า — กรุณาแก้ไข src/config/firebase.js')
}

export const db = _db
