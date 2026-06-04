import { JSONBIN_KEY, JSONBIN_URL, SUBMISSIONS_URL, SURVEYS_URL, REDEMPTIONS_URL, REWARD_CATALOG_URL } from '../config/jsonbin'

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

// ── Users ──────────────────────────────────────────────

export async function fetchCloudUsers() {
  const res = await fetch(`${JSONBIN_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  const data = await res.json()
  return data.record.users || []
}

export async function pushUserToCloud(user) {
  const { faceImage, ...meta } = user
  const avatar = await resizeImage(faceImage, 64, 0.4)
  const existing = await fetchCloudUsers()
  if (existing.some(u => u.id === meta.id)) return
  const res = await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ users: [...existing, { ...meta, avatar }] }),
  })
  if (!res.ok) throw new Error('push failed')
}

// ── Activity Submissions ────────────────────────────────

export async function fetchSubmissions() {
  const res = await fetch(`${SUBMISSIONS_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  const data = await res.json()
  return data.record.submissions || []
}

export async function addSubmission(submission) {
  // บีบรูปให้เล็กก่อน upload (300x300 @ 50%)
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
      ...s,
      status,
      adminNote,
      reviewedAt: new Date().toISOString(),
      ...(status === 'approved'
        ? { pointsValue: 5, pointsClaimed: false }
        : {}),
    }
  })
  const res = await fetch(SUBMISSIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ submissions: updated }),
  })
  if (!res.ok) throw new Error('update failed')
}

// ── Surveys ─────────────────────────────────────────────

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

// ── Reward Catalog ───────────────────────────────────────

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

// ── Redemptions ──────────────────────────────────────────

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
    r => r.userId === userId && r.status === 'rejected' && r.refundPending && !r.refundClaimed
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

export async function deleteCloudUser(userId) {
  const existing = await fetchCloudUsers()
  const updated = existing.filter(u => u.id !== userId)
  const res = await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ users: updated }),
  })
  if (!res.ok) throw new Error('ลบผู้ใช้จาก cloud ไม่สำเร็จ')
}

export async function deleteUserSubmissions(userId) {
  const existing = await fetchSubmissions()
  const updated = existing.filter(s => s.userId !== userId)
  const res = await fetch(SUBMISSIONS_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ submissions: updated }),
  })
  if (!res.ok) throw new Error('ลบภาพกิจกรรมไม่สำเร็จ')
}

export async function claimApprovedPoints(userId) {
  const all = await fetchSubmissions()
  const unclaimed = all.filter(
    s => s.userId === userId && s.status === 'approved' && !s.pointsClaimed && (s.pointsValue || 0) > 0
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
