import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyBlrOVyRiz_zFCBpDD9_ENlsqvsN6T9AKE',
  authDomain: 'health-app-330d6.firebaseapp.com',
  projectId: 'health-app-330d6',
  storageBucket: 'health-app-330d6.firebasestorage.app',
  messagingSenderId: '96567771742',
  appId: '1:96567771742:web:f42979f875fbd9782eaacf',
  measurementId: 'G-8HK77JRBF1',
}

export const firebaseReady = true

let _db = null
let _messaging = null

try {
  const app = initializeApp(firebaseConfig)
  _db = getFirestore(app)
  isSupported().then(ok => {
    if (ok) _messaging = getMessaging(app)
  }).catch(() => {})
} catch (e) {
  console.error('[Firebase] init failed:', e)
}

export const db = _db
export const getMsg = () => _messaging
