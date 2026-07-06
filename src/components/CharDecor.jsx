import React, { useState, useEffect } from 'react'

/**
 * CharDecor — แสดงตัวการ์ตูนตัดจากรูปกลุ่ม
 * imgSrc    : path รูปใน public/
 * imgW      : ความกว้างที่จะแสดงรูป (px) — ยิ่งมากยิ่ง zoom out
 * offTop    : เลื่อนรูปขึ้น (ค่าลบ = เลื่อนขึ้น)
 * offLeft   : เลื่อนรูปซ้าย (ค่าลบ = เลื่อนซ้าย)
 * w / h     : ขนาด window ที่เห็น
 * flip      : กลับซ้าย-ขวา
 * style     : override style ของ wrapper
 */
export default function CharDecor({ imgSrc, imgW, offTop, offLeft, w, h, flip, style = {} }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        mixBlendMode: 'multiply',
        ...style,
      }}
    >
      <img
        src={imgSrc}
        alt=""
        style={{
          position: 'absolute',
          width: imgW,
          top: offTop,
          left: offLeft,
          transform: flip ? 'scaleX(-1)' : undefined,
          maxWidth: 'none',
        }}
        draggable={false}
      />
    </div>
  )
}

/* ─── Sticker characters (stickers.jpg 1536×1024, 5×3 grid) ───── */

// cell size: 307.2 × 341.33 px
// display base height: 138px → scale = 138/341.33 = 0.4044
// imgW = 1536 * 0.4044 = 621  cellW = 307.2 * 0.4044 = 124  cellH = 138

const ST = '/stickers.jpg'
const ST_SCALE = 138 / (1024 / 3)   // ≈ 0.4043
const ST_W = Math.round(1536 * ST_SCALE)  // 621
const ST_CW = Math.round((1536 / 5) * ST_SCALE) // 124
const ST_CH = 138

function _s(row, col) {
  return {
    imgSrc: ST,
    imgW:   ST_W,
    offTop: -row * ST_CH,
    offLeft:-col * ST_CW,
    w:      ST_CW,
    h:      ST_CH,
  }
}

export const STICKERS = {
  // Row 0 – Boy
  boy1: _s(0, 0),  // แข็งแรงวันนี้ ดีกว่าเมื่อวาน
  boy2: _s(0, 1),  // ไม่หยุดแค่ขยับ ชีวิตก็เปลี่ยน!
  boy3: _s(0, 2),  // ออกกำลังกายไม่ใช่การลงโทษ
  boy4: _s(0, 3),  // เหนื่อวันนี้ สู้หน่อยดีในวันหน้า
  boy5: _s(0, 4),  // สุขภาพดีเริ่มที่เรา
  // Row 1 – Girl (hair clip)
  girl1a: _s(1, 0), // ดื่มน้ำให้พอ
  girl1b: _s(1, 1), // ออกกำลังง่ายๆ
  girl1c: _s(1, 2), // เริ่มต้นที่ใจ
  girl1d: _s(1, 3), // พุ่นดีไม่ใช่เรื่องบังเอิญ
  girl1e: _s(1, 4), // สู้ๆนะ!
  // Row 2 – Girl (short hair)
  girl2a: _s(2, 0), // ออกกำลังกาย ไม่ยากอย่างที่คิด
  girl2b: _s(2, 1), // เหนื่อยแค่ไหน ก็สู้เพื่อสุขภาพดี
  girl2c: _s(2, 2), // Love Yourself
  girl2d: _s(2, 3), // ขยับกาย สบายใจ ห่างไกลโรค
  girl2e: _s(2, 4), // สุขภาพดีคือของขวัญที่ดีที่สุด
}

// module-level cache: cacheKey → data URL (processed transparent PNG)
const _cache = new Map()

function _removeBg(ctx, w, h) {
  // Sample background color from near top-left corner
  const corner = ctx.getImageData(3, 3, 1, 1).data
  const bgR = corner[0], bgG = corner[1], bgB = corner[2]

  const id = ctx.getImageData(0, 0, w, h)
  const d = id.data

  // Flood-fill from all 4 corners — only connected background pixels are removed
  const vis = new Uint8Array(w * h)
  const q = []
  let qi = 0
  const THR = 70  // sum-of-channel tolerance

  const enq = (x, y) => {
    const i = y * w + x
    if (!vis[i]) { vis[i] = 1; q.push(x, y) }
  }
  enq(0, 0); enq(w - 1, 0); enq(0, h - 1); enq(w - 1, h - 1)

  while (qi < q.length) {
    const x = q[qi++], y = q[qi++]
    const pi = (y * w + x) * 4
    const dist = Math.abs(d[pi] - bgR) + Math.abs(d[pi + 1] - bgG) + Math.abs(d[pi + 2] - bgB)
    if (dist <= THR) {
      d[pi + 3] = 0
      if (x > 0)     enq(x - 1, y)
      if (x < w - 1) enq(x + 1, y)
      if (y > 0)     enq(x, y - 1)
      if (y < h - 1) enq(x, y + 1)
    }
  }
  ctx.putImageData(id, 0, 0)
}

/** StickerChar — crop + remove gray background via canvas flood-fill */
export function StickerChar({ name, size = 1, flip, style = {} }) {
  const p = STICKERS[name]
  const cacheKey = `${name}_${size}_${flip ? 1 : 0}`
  const [url, setUrl] = useState(() => _cache.get(cacheKey) || null)

  useEffect(() => {
    if (!p || _cache.has(cacheKey)) return
    const img = new Image()
    img.onload = () => {
      // Source rectangle in original 1536×1024 image
      const scale = p.imgW / 1536
      const sx = Math.round(-p.offLeft / scale)
      const sy = Math.round(-p.offTop / scale)
      const sw = Math.round(p.w / scale)
      const sh = Math.round(p.h / scale)

      const cw = Math.round(p.w * size)
      const ch = Math.round(p.h * size)

      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')

      if (flip) { ctx.save(); ctx.translate(cw, 0); ctx.scale(-1, 1) }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
      if (flip) ctx.restore()

      _removeBg(ctx, cw, ch)

      const dataUrl = canvas.toDataURL('image/png')
      _cache.set(cacheKey, dataUrl)
      setUrl(dataUrl)
    }
    img.src = p.imgSrc
  }, [cacheKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null
  return (
    <div style={{
      width: p.w * size,
      height: p.h * size,
      flexShrink: 0,
      pointerEvents: 'none',
      userSelect: 'none',
      filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.22))',
      ...style,
    }}>
      {url && <img src={url} style={{ width: '100%', height: '100%' }} alt="" draggable={false} />}
    </div>
  )
}
