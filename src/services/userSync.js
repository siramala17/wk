import { JSONBIN_KEY, JSONBIN_URL } from '../config/jsonbin'

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_KEY,
}

export async function fetchCloudUsers() {
  const res = await fetch(`${JSONBIN_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  const data = await res.json()
  return data.record.users || []
}

export async function pushUserToCloud(user) {
  // ไม่เก็บ faceImage (base64 ใหญ่เกิน) — เก็บแค่ข้อมูล
  const { faceImage, ...safeUser } = user
  const existing = await fetchCloudUsers()
  if (existing.some(u => u.id === safeUser.id)) return
  const res = await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ users: [...existing, safeUser] }),
  })
  if (!res.ok) throw new Error('push failed')
}
