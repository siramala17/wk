import { JSONBIN_KEY, SUBMISSIONS_URL, SURVEYS_URL, REDEMPTIONS_URL, REWARD_CATALOG_URL } from '../config/jsonbin'
import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc,
  query, where, getDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_KEY,
}

function resizeImage(dataUrl, size = 64, quality = 0.4) {
  if (!dataUrl) return Promise.resolve(null)
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      const s = Math.min(img.width, img.height)
      const sx = (img.width - s) / 2
      const sy = (img.height - s) / 2
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

// ── localStorage fallback (ใช้เมื่อ Firebase ยังไม่ตั้งค่า) ────

const LOCAL_USERS_KEY = 'hc_cloud_users'

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') } catch { return [] }
}

function saveLocalUsers(users) {
  try { localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users)) } catch {}
}

// ── Firestore Diagnostics ────────────────────────────────────

export async function testFirestoreAccess() {
  if (!db) return { ok: false, reason: 'no_db' }
  const testId = '__admin_test__'
  try {
    await setDoc(doc(db, 'users', testId), { _test: true, _at: new Date().toISOString() })
    await deleteDoc(doc(db, 'users', testId))
    return { ok: true }
  } catch (e) {
    const msg = e?.message || ''
    if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
      return { ok: false, reason: 'permission_denied', message: msg }
    }
    return { ok: false, reason: 'unknown', message: msg }
  }
}

// ── Users ────────────────────────────────────────────────────

export async function fetchCloudUsers() {
  if (!db) {
    const stored = getLocalUsers()
    try {
      const session = JSON.parse(localStorage.getItem('hc_user') || 'null')
      if (session?.id && !stored.some(u => String(u.id) === String(session.id))) {
        stored.push({ ...session, registeredAt: session.registeredAt || new Date().toISOString() })
      }
    } catch {}
    return stored.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''))
  }

  // ไม่ใช้ orderBy เพราะ Firestore จะข้าม document ที่ไม่มี field registeredAt
  const snap = await getDocs(collection(db, 'users'))
  const firestoreUsers = snap.docs.map(d => {
    const data = d.data()
    return { ...data, id: data.id ?? d.id }
  })

  // รวม user จาก localStorage ที่อาจยังไม่ sync ขึ้น Firestore
  const localUsers = getLocalUsers()
  for (const lu of localUsers) {
    if (!firestoreUsers.some(fu => String(fu.id) === String(lu.id))) {
      firestoreUsers.push(lu)
      pushUserToCloud(lu).catch(() => {})
    }
  }

  return firestoreUsers.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''))
}

export async function pushUserToCloud(user) {
  const { faceImage, ...meta } = user
  const avatar = await resizeImage(faceImage, 64, 0.4)
  const userRecord = { ...meta, avatar: avatar ?? null }

  // บันทึกลง localStorage เสมอเป็น backup (ทั้ง Firebase mode และ local mode)
  const existing = getLocalUsers()
  if (!existing.some(u => String(u.id) === String(meta.id))) {
    saveLocalUsers([...existing, userRecord])
  }

  if (!db) return

  await setDoc(doc(db, 'users', String(user.id)), {
    ...meta,
    firstName_lower: (meta.firstName || '').trim().toLowerCase(),
    avatar: avatar ?? null,
  })
}

export async function loginUserFromCloud(firstName, pin) {
  if (!db) {
    const users = getLocalUsers()
    const found = users.find(u =>
      (u.firstName || '').trim().toLowerCase() === firstName.trim().toLowerCase() &&
      u.pin === pin
    )
    if (!found) return null
    const { pin: _, ...safe } = found
    return safe
  }

  const q = query(
    collection(db, 'users'),
    where('firstName_lower', '==', firstName.trim().toLowerCase())
  )
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    const u = d.data()
    if (u.pin === pin) {
      const { pin: _, ...safe } = u
      return { ...safe, id: u.id ?? d.id }
    }
  }
  return null
}

export async function syncUserPointsToCloud(userId, points, streak) {
  if (!db) {
    saveLocalUsers(getLocalUsers().map(u =>
      String(u.id) === String(userId) ? { ...u, points, streak } : u
    ))
    return
  }
  try {
    await updateDoc(doc(db, 'users', String(userId)), { points, streak })
  } catch { /* silent — offline */ }
}

export async function updateUserAvatarInCloud(userId, faceImage) {
  const avatar = await resizeImage(faceImage, 64, 0.4)
  if (!avatar) return

  if (!db) {
    saveLocalUsers(getLocalUsers().map(u =>
      String(u.id) === String(userId) ? { ...u, avatar } : u
    ))
    return
  }
  await updateDoc(doc(db, 'users', String(userId)), { avatar })
}

export async function deleteCloudUser(userId) {
  if (!db) {
    saveLocalUsers(getLocalUsers().filter(u => String(u.id) !== String(userId)))
    return
  }
  await deleteDoc(doc(db, 'users', String(userId)))
}

// ── Activity Submissions ─────────────────────────────────────

export async function fetchSubmissions() {
  const res = await fetch(`${SUBMISSIONS_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  const data = await res.json()
  return data.record.submissions || []
}

export async function addSubmission(submission) {
  const photo = await resizeImage(submission.photo, 300, 0.5)
  const existing = await fetchSubmissions()
  const newEntry = { ...submission, photo, status: 'pending', submittedAt: new Date().toISOString() }
  const res = await fetch(SUBMISSIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ submissions: [...existing, newEntry] }),
  })
  if (!res.ok) throw new Error('submit failed')
  return newEntry
}

export async function updateSubmissionStatus(id, status, adminNote = '') {
  const existing = await fetchSubmissions()
  const updated = existing.map(s => {
    if (s.id !== id) return s
    return {
      ...s, status, adminNote,
      reviewedAt: new Date().toISOString(),
      ...(status === 'approved' ? { pointsValue: 5, pointsClaimed: false } : {}),
    }
  })
  const res = await fetch(SUBMISSIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ submissions: updated }),
  })
  if (!res.ok) throw new Error('update failed')
}

export async function deleteUserSubmissions(userId) {
  const existing = await fetchSubmissions()
  const updated = existing.filter(s => String(s.userId) !== String(userId))
  const res = await fetch(SUBMISSIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ submissions: updated }),
  })
  if (!res.ok) throw new Error('ลบภาพกิจกรรมไม่สำเร็จ')
}

// ── Surveys ──────────────────────────────────────────────────

export async function fetchSurveys() {
  const res = await fetch(`${SURVEYS_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch surveys failed')
  const data = await res.json()
  return data.record.surveys || []
}

export async function submitSurvey(survey) {
  const existing = await fetchSurveys()
  const res = await fetch(SURVEYS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ surveys: [...existing, survey] }),
  })
  if (!res.ok) throw new Error('submit survey failed')
}

export async function deleteSurvey(surveyId) {
  const existing = await fetchSurveys()
  const res = await fetch(SURVEYS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ surveys: existing.filter(s => s.id !== surveyId) }),
  })
  if (!res.ok) throw new Error('delete survey failed')
}

// ── Reward Catalog ────────────────────────────────────────────

export async function fetchRewardCatalog() {
  const res = await fetch(`${REWARD_CATALOG_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  return (await res.json()).record.rewards || []
}

async function saveRewardCatalog(rewards) {
  const res = await fetch(REWARD_CATALOG_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ rewards }),
  })
  if (!res.ok) throw new Error('save failed')
}

export async function addReward(reward) {
  const existing = await fetchRewardCatalog()
  await saveRewardCatalog([...existing, reward])
}

export async function updateReward(updated) {
  const existing = await fetchRewardCatalog()
  await saveRewardCatalog(existing.map(r => r.id === updated.id ? updated : r))
}

export async function deleteReward(id) {
  const existing = await fetchRewardCatalog()
  await saveRewardCatalog(existing.filter(r => r.id !== id))
}

// ── Redemptions ───────────────────────────────────────────────

export async function fetchRedemptions() {
  const res = await fetch(`${REDEMPTIONS_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  return (await res.json()).record.redemptions || []
}

export async function submitRedemption(item) {
  const existing = await fetchRedemptions()
  const res = await fetch(REDEMPTIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ redemptions: [...existing, item] }),
  })
  if (!res.ok) throw new Error('submit failed')
}

export async function updateRedemptionStatus(id, status, adminNote = '') {
  const existing = await fetchRedemptions()
  const updated = existing.map(r =>
    r.id !== id ? r : {
      ...r, status, adminNote, reviewedAt: new Date().toISOString(),
      ...(status === 'rejected' ? { refundPending: true, refundClaimed: false } : {}),
    }
  )
  const res = await fetch(REDEMPTIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ redemptions: updated }),
  })
  if (!res.ok) throw new Error('update failed')
}

export async function claimRedemptionRefunds(userId) {
  const all = await fetchRedemptions()
  const unclaimed = all.filter(
    r => String(r.userId) === String(userId) && r.status === 'rejected' && r.refundPending && !r.refundClaimed
  )
  if (unclaimed.length === 0) return 0
  const total = unclaimed.reduce((s, r) => s + (r.pointsCost || 0), 0)
  const now = new Date().toISOString()
  const updated = all.map(r =>
    unclaimed.some(u => u.id === r.id) ? { ...r, refundClaimed: true, refundClaimedAt: now } : r
  )
  await fetch(REDEMPTIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ redemptions: updated }),
  })
  return total
}

// ── Assessments ──────────────────────────────────────────────

export async function saveAssessmentToCloud(userId, userData, assessmentData) {
  if (!db) return
  const date = new Date().toISOString().split('T')[0]
  const docId = `${userId}_${date}`
  const thaiYear = (new Date().getFullYear() + 543).toString()
  await setDoc(doc(db, 'assessments', docId), {
    userId: String(userId),
    gradeLevel: userData.gradeLevel || '',
    age: userData.age || null,
    gender: userData.gender || '',
    overallScore: assessmentData.overallScore ?? 0,
    sleepScore: assessmentData.sleepScore ?? 0,
    waterScore: assessmentData.waterScore ?? 0,
    exerciseScore: assessmentData.exerciseScore ?? 0,
    digitalScore: assessmentData.digitalScore ?? 0,
    stressScore: assessmentData.stressScore ?? 0,
    date,
    year: thaiYear,
    submittedAt: new Date().toISOString(),
  })
}

export async function fetchAllAssessments() {
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, 'assessments'))
    return snap.docs.map(d => d.data())
  } catch { return [] }
}

// ── Real-time subscriptions ───────────────────────────────────

export function subscribeUsers(callback) {
  if (!db) {
    callback(getLocalUsers())
    return () => {}
  }
  return onSnapshot(collection(db, 'users'), snap => {
    const firestoreUsers = snap.docs.map(d => ({ ...d.data(), id: d.data().id ?? d.id }))
    const localUsers = getLocalUsers()
    for (const lu of localUsers) {
      if (!firestoreUsers.some(fu => String(fu.id) === String(lu.id))) {
        firestoreUsers.push(lu)
      }
    }
    callback(firestoreUsers)
  }, () => callback(getLocalUsers()))
}

export function subscribeAssessments(callback) {
  if (!db) {
    callback([])
    return () => {}
  }
  return onSnapshot(collection(db, 'assessments'), snap => {
    callback(snap.docs.map(d => d.data()))
  }, () => callback([]))
}

export async function claimApprovedPoints(userId) {
  const all = await fetchSubmissions()
  const unclaimed = all.filter(
    s => String(s.userId) === String(userId) && s.status === 'approved' && !s.pointsClaimed && (s.pointsValue || 0) > 0
  )
  if (unclaimed.length === 0) return 0

  const total = unclaimed.reduce((sum, s) => sum + (s.pointsValue || 5), 0)
  const now = new Date().toISOString()
  const updated = all.map(s =>
    unclaimed.some(u => u.id === s.id)
      ? { ...s, pointsClaimed: true, pointsClaimedAt: now }
      : s
  )
  await fetch(SUBMISSIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ submissions: updated }),
  })
  return total
}
