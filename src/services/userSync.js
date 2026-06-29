import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc,
  query, where, getDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'

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

export async function fetchUserById(userId) {
  if (!db) {
    const users = getLocalUsers()
    const found = users.find(u => String(u.id) === String(userId))
    if (!found) return null
    const { pin: _, ...safe } = found
    return safe
  }
  try {
    const snap = await getDoc(doc(db, 'users', String(userId)))
    if (!snap.exists()) return null
    const data = snap.data()
    const { pin: _, ...safe } = data
    return { ...safe, id: String(userId) }
  } catch { return null }
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
  if (!db) return []
  const snap = await getDocs(collection(db, 'submissions'))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function addSubmission(submission) {
  if (!db) throw new Error('Firestore ไม่พร้อมใช้งาน')
  const photo      = await resizeImage(submission.photo,      300, 0.5)
  const userAvatar = await resizeImage(submission.userAvatar, 64,  0.5)
  const id = String(submission.id || Date.now())
  const newEntry = { ...submission, id, userId: String(submission.userId), photo, userAvatar, status: 'pending', submittedAt: new Date().toISOString() }
  await setDoc(doc(db, 'submissions', id), newEntry)
  return newEntry
}

export async function updateSubmissionStatus(id, status, adminNote = '') {
  if (!db) return
  await updateDoc(doc(db, 'submissions', String(id)), {
    status,
    adminNote,
    reviewedAt: new Date().toISOString(),
    ...(status === 'approved' ? { pointsValue: 5, pointsClaimed: false } : {}),
  })
}

export async function deleteUserSubmissions(userId) {
  if (!db) return
  const snap = await getDocs(query(collection(db, 'submissions'), where('userId', '==', String(userId))))
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

// ── Surveys ──────────────────────────────────────────────────

export async function fetchSurveys() {
  if (!db) return []
  const snap = await getDocs(collection(db, 'surveys'))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function submitSurvey(survey) {
  if (!db) throw new Error('Firestore ไม่พร้อมใช้งาน')
  const id = String(survey.id || Date.now())
  await setDoc(doc(db, 'surveys', id), { ...survey, id })
}

export async function deleteSurvey(surveyId) {
  if (!db) return
  await deleteDoc(doc(db, 'surveys', String(surveyId)))
}

// ── Reward Catalog ────────────────────────────────────────────

export async function fetchRewardCatalog() {
  if (!db) return []
  const snap = await getDocs(collection(db, 'rewardCatalog'))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function addReward(reward) {
  if (!db) return
  await setDoc(doc(db, 'rewardCatalog', String(reward.id)), reward)
}

export async function updateReward(updated) {
  if (!db) return
  await setDoc(doc(db, 'rewardCatalog', String(updated.id)), updated)
}

export async function deleteReward(id) {
  if (!db) return
  await deleteDoc(doc(db, 'rewardCatalog', String(id)))
}

// ── Redemptions ───────────────────────────────────────────────

export async function fetchRedemptions() {
  if (!db) return []
  const snap = await getDocs(collection(db, 'redemptions'))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function submitRedemption(item) {
  if (!db) throw new Error('Firestore ไม่พร้อมใช้งาน')
  const id = String(item.id || Date.now())
  await setDoc(doc(db, 'redemptions', id), { ...item, id, userId: String(item.userId) })
}

export async function updateRedemptionStatus(id, status, adminNote = '') {
  if (!db) return
  await updateDoc(doc(db, 'redemptions', String(id)), {
    status,
    adminNote,
    reviewedAt: new Date().toISOString(),
    ...(status === 'rejected' ? { refundPending: true, refundClaimed: false } : {}),
  })
}

export async function claimRedemptionRefunds(userId) {
  if (!db) return 0
  const snap = await getDocs(query(collection(db, 'redemptions'), where('userId', '==', String(userId))))
  const unclaimed = snap.docs.filter(d => {
    const r = d.data()
    return r.status === 'rejected' && r.refundPending && !r.refundClaimed
  })
  if (unclaimed.length === 0) return 0
  const total = unclaimed.reduce((s, d) => s + (d.data().pointsCost || 0), 0)
  const now = new Date().toISOString()
  await Promise.all(unclaimed.map(d => updateDoc(d.ref, { refundClaimed: true, refundClaimedAt: now })))
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
    overallScore:   assessmentData.overallScore   ?? 0,
    sleepScore:     assessmentData.sleepScore     ?? 0,
    exerciseScore:  assessmentData.exerciseScore  ?? 0,
    digitalScore:   assessmentData.digitalScore   ?? 0,
    stressScore:    assessmentData.stressScore    ?? 0,
    nutritionScore: assessmentData.nutritionScore ?? 0,
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

// ── Body Compositions ─────────────────────────────────────────

export async function saveBodyComposition(userId, date, time, result) {
  if (!db) return
  const docId = `${userId}_${date}`
  await setDoc(doc(db, 'bodyCompositions', docId), {
    userId: String(userId),
    date,
    time: time || '00:00',
    result,
    savedAt: new Date().toISOString(),
  })
}

export async function fetchBodyCompositions(userId) {
  if (!db) return []
  try {
    const snap = await getDocs(query(collection(db, 'bodyCompositions'), where('userId', '==', String(userId))))
    return snap.docs.map(d => d.data()).sort((a, b) => b.date.localeCompare(a.date))
  } catch { return [] }
}

export async function deleteBodyComposition(userId, date) {
  if (!db) return
  const docId = `${userId}_${date}`
  await deleteDoc(doc(db, 'bodyCompositions', docId))
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

// ── Announcements ─────────────────────────────────────────────

const LOCAL_ANN_KEY = 'hc_announcements'

function getLocalAnn() {
  try { return JSON.parse(localStorage.getItem(LOCAL_ANN_KEY) || '[]') } catch { return [] }
}
function saveLocalAnn(items) {
  try { localStorage.setItem(LOCAL_ANN_KEY, JSON.stringify(items)) } catch {}
}

export async function fetchAnnouncements() {
  if (!db) return getLocalAnn()
  const snap = await getDocs(collection(db, 'announcements'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id }))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export async function addAnnouncement(ann) {
  const item = { ...ann, id: `ann_${Date.now()}`, createdAt: new Date().toISOString() }
  if (!db) { saveLocalAnn([item, ...getLocalAnn()]); return }
  await setDoc(doc(db, 'announcements', item.id), item)
}

export async function updateAnnouncement(ann) {
  if (!db) { saveLocalAnn(getLocalAnn().map(a => a.id === ann.id ? ann : a)); return }
  await setDoc(doc(db, 'announcements', ann.id), ann)
}

export async function deleteAnnouncement(id) {
  if (!db) { saveLocalAnn(getLocalAnn().filter(a => a.id !== id)); return }
  await deleteDoc(doc(db, 'announcements', id))
}

export async function claimApprovedPoints(userId) {
  if (!db) return 0
  const snap = await getDocs(query(collection(db, 'submissions'), where('userId', '==', String(userId))))
  const unclaimed = snap.docs.filter(d => {
    const s = d.data()
    return s.status === 'approved' && !s.pointsClaimed && (s.pointsValue || 0) > 0
  })
  if (unclaimed.length === 0) return 0
  const total = unclaimed.reduce((sum, d) => sum + (d.data().pointsValue || 5), 0)
  const now = new Date().toISOString()
  await Promise.all(unclaimed.map(d => updateDoc(d.ref, { pointsClaimed: true, pointsClaimedAt: now })))
  return total
}
