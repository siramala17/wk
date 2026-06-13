import { getToken } from 'firebase/messaging'
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'
import { getMsg, db } from '../config/firebase'

// ── VAPID Key ──────────────────────────────────────────────────
export const VAPID_KEY = 'BHMZKl5kmxZ9xGE0H_6Bf-USsHJOzs_HzfU9WFNyQQ8XHhz_mghKQmqhoAv8FrXWeisN65I-9bT87QXORNnkm4Y'

// ── Service Account (อ่านจาก env var — ไม่เก็บใน code) ────────
const SA_EMAIL   = import.meta.env.VITE_FCM_CLIENT_EMAIL || ''
const SA_KEY_RAW = import.meta.env.VITE_FCM_PRIVATE_KEY  || ''
// แปลง \n ที่เป็น literal string ให้เป็น newline จริงๆ
const SA_KEY = SA_KEY_RAW.replace(/\\n/g, '\n')

export const fcmReady = !!SA_EMAIL && !!SA_KEY_RAW

// ── JWT → OAuth2 access token ──────────────────────────────────
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const b64url = obj =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const header  = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: SA_EMAIL, sub: SA_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  }

  const signingInput = `${b64url(header)}.${b64url(payload)}`

  const pem = SA_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')
  const binaryKey = Uint8Array.from(atob(pem), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  )
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const jwt = `${signingInput}.${sigB64}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const { access_token } = await res.json()
  return access_token
}

// ── ขอ permission + บันทึก FCM token ──────────────────────────
export async function requestPermissionAndSaveToken(userId) {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const messaging = getMsg()
    if (!messaging) return null

    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })

    if (token && db) {
      await setDoc(doc(db, 'fcm_tokens', String(userId)), {
        userId: String(userId), token,
        updatedAt: new Date().toISOString(),
      })
    }
    return token
  } catch (e) {
    console.warn('[FCM] token error:', e)
    return null
  }
}

// ── ส่ง push ไปทุกอุปกรณ์ ──────────────────────────────────────
export async function sendPushToAll({ title, body, icon = '/icon.svg' }) {
  if (!db || !fcmReady) return { sent: 0, errors: 0, total: 0 }

  const snap = await getDocs(collection(db, 'fcm_tokens'))
  const tokens = snap.docs.map(d => d.data().token).filter(Boolean)
  if (tokens.length === 0) return { sent: 0, errors: 0, total: 0 }

  const accessToken = await getAccessToken()
  const url = `https://fcm.googleapis.com/v1/projects/health-app-330d6/messages:send`

  let sent = 0, errors = 0
  await Promise.all(tokens.map(async token => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            webpush: { notification: { icon, requireInteraction: false } },
          },
        }),
      })
      if (res.ok) sent++; else errors++
    } catch { errors++ }
  }))

  return { sent, errors, total: tokens.length }
}
