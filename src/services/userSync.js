import { JSONBIN_KEY, JSONBIN_URL } from '../config/jsonbin'

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_KEY,
}

function makeThumbnail(dataUrl) {
  if (!dataUrl) return Promise.resolve(null)
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      canvas.getContext('2d').drawImage(img, 0, 0, 64, 64)
      resolve(canvas.toDataURL('image/jpeg', 0.4))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

export async function fetchCloudUsers() {
  const res = await fetch(`${JSONBIN_URL}/latest`, { headers: HEADERS })
  if (!res.ok) throw new Error('fetch failed')
  const data = await res.json()
  return data.record.users || []
}

export async function pushUserToCloud(user) {
  const { faceImage, ...meta } = user
  const avatar = await makeThumbnail(faceImage)
  const existing = await fetchCloudUsers()
  if (existing.some(u => u.id === meta.id)) return
  const res = await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ users: [...existing, { ...meta, avatar }] }),
  })
  if (!res.ok) throw new Error('push failed')
}
