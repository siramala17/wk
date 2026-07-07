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

/* ─── Sticker characters (stickers2.jpg 1076×1522, 3 cols × 5 rows) ─────────
   NOTE: Each sticker in the file is rotated 90° CCW.
   Canvas draws them with a 90° CW correction so they appear upright.
   After rotation: upright sticker ≈ 110 × 130 px at size=1.

   Grid layout (portrait file):
     col 0 = Girl short hair  col 1 = Girl clip  col 2 = Boy
     row 0 = originally col 0 of the original landscape sheet (etc.)
─────────────────────────────────────────────────────────────────────────── */
const ST2_SRC  = '/stickers2.jpg'
const ST2_IW   = 1076          // image width
const ST2_IH   = 1522          // image height
const ST2_COLS = 3
const ST2_ROWS = 5
const ST2_CW   = ST2_IW / ST2_COLS  // 358.67 — cell width in file (= sticker height when upright)
const ST2_CH   = ST2_IH / ST2_ROWS  // 304.4  — cell height in file (= sticker width when upright)
// Base display: upright height = 130 px
const ST2_SCALE  = 130 / ST2_CW                     // ≈ 0.3624
const ST2_OUT_W  = Math.round(ST2_CH * ST2_SCALE)   // ≈ 110
const ST2_OUT_H  = 130

export const STICKERS = {
  // Boy — right column (col 2), rows 0-4
  boy1: { row: 0, col: 2 },  // แข็งแรงวันนี้ ดีกว่าเมื่อวาน
  boy2: { row: 1, col: 2 },  // ไม่หยุดแค่ขยับ ชีวิตก็เปลี่ยน!
  boy3: { row: 2, col: 2 },  // ออกกำลังกายไม่ใช่การลงโทษ
  boy4: { row: 3, col: 2 },  // เหนื่อวันนี้ สู้หุ่นดีในวันหน้า
  boy5: { row: 4, col: 2 },  // สุขภาพดีเริ่มที่เรา
  // Girl clip — middle column (col 1)
  girl1a: { row: 0, col: 1 }, // ดื่มน้ำให้พอ
  girl1b: { row: 1, col: 1 }, // ออกกำลังง่ายๆ
  girl1c: { row: 2, col: 1 }, // เริ่มต้นที่ใจ
  girl1d: { row: 3, col: 1 }, // หุ่นดีไม่ใช่เรื่องบังเอิญ
  girl1e: { row: 4, col: 1 }, // สู้ๆ นะ!
  // Girl short hair — left column (col 0)
  girl2a: { row: 0, col: 0 }, // ออกกำลังกาย ไม่ยากอย่างที่คิด
  girl2b: { row: 1, col: 0 }, // เหนื่อยแค่ไหน ก็สู้เพื่อสุขภาพดี
  girl2c: { row: 2, col: 0 }, // Love Yourself
  girl2d: { row: 3, col: 0 }, // ขยับกาย สบายใจ ห่างไกลโรค
  girl2e: { row: 4, col: 0 }, // สุขภาพดีคือของขวัญที่ดีที่สุด
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

/** StickerChar — crop sticker2.jpg, rotate 90° CW, remove white bg via flood-fill */
export function StickerChar({ name, size = 1, flip, style = {} }) {
  const p = STICKERS[name]
  // flip is CSS-only (no cache variant needed)
  const cacheKey = `${name}_${size}`
  const [url, setUrl] = useState(() => _cache.get(cacheKey) || null)

  useEffect(() => {
    if (!p || _cache.has(cacheKey)) return

    const img = new Image()
    img.onload = () => {
      // Source cell in the file (sticker is 90° CCW in the file)
      const sx = Math.round(p.col * ST2_CW)
      const sy = Math.round(p.row * ST2_CH)
      const sw = Math.round(ST2_CW)
      const sh = Math.round(ST2_CH)

      // Output canvas: upright sticker (rotate 90° CW → width/height swap)
      const cw = Math.round(ST2_OUT_W * size)  // ≈ 110 * size
      const ch = Math.round(ST2_OUT_H * size)  // = 130 * size

      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')

      // 90° CW rotation: translate to right edge, rotate +PI/2
      // In rotated space, draw destination is (0,0,ch,cw)
      ctx.translate(cw, 0)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, ch, cw)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      _removeBg(ctx, cw, ch)

      const dataUrl = canvas.toDataURL('image/png')
      _cache.set(cacheKey, dataUrl)
      setUrl(dataUrl)
    }
    img.src = ST2_SRC
  }, [cacheKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null
  return (
    <div style={{
      width: ST2_OUT_W * size,
      height: ST2_OUT_H * size,
      flexShrink: 0,
      pointerEvents: 'none',
      userSelect: 'none',
      filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.22))',
      transform: flip ? 'scaleX(-1)' : undefined,
      ...style,
    }}>
      {url && <img src={url} style={{ width: '100%', height: '100%' }} alt="" draggable={false} />}
    </div>
  )
}
