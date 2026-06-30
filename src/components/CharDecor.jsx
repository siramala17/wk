import React from 'react'

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

/* ─── Preset characters ─────────────────────────────────────────── */

const S = '/kids-sport.jpg'   // 626×445 px
const Y = '/kids-yoga.webp'   // กว้าง ~1100px (8 ตัว 2 แถว)

// imgW=500 → ภาพถูก scale ลงเหลือ 500/626 ≈ 0.799 ของต้นฉบับ
// offsets คำนวณจากจุดเริ่มของแต่ละตัวละครในภาพ 500px

export const CHARS = {
  /* ── sports ─────────────────────────────────── */
  cheerleader:   { imgSrc:S, imgW:500, offTop:-5,   offLeft:0,    w:100, h:170 },
  footballer:    { imgSrc:S, imgW:500, offTop:-5,   offLeft:-105, w:95,  h:170 },
  hulaHoop:      { imgSrc:S, imgW:500, offTop:-5,   offLeft:-200, w:110, h:170 },
  basketball:    { imgSrc:S, imgW:500, offTop:-5,   offLeft:-310, w:110, h:170 },
  karate:        { imgSrc:S, imgW:500, offTop:-178, offLeft:0,    w:90,  h:175 },
  jumpRope:      { imgSrc:S, imgW:500, offTop:-178, offLeft:-80,  w:155, h:175 },
  ribbon:        { imgSrc:S, imgW:500, offTop:-178, offLeft:-232, w:130, h:175 },
  americanFootball: { imgSrc:S, imgW:500, offTop:-178, offLeft:-355, w:125, h:175 },

  /* ── yoga (ภาพ ~1100px กว้าง, 2 แถว × 5 ตัว) ─ */
  yoga1: { imgSrc:Y, imgW:880, offTop:-10,  offLeft:0,    w:130, h:180 }, // stretch side
  yoga2: { imgSrc:Y, imgW:880, offTop:-10,  offLeft:-148, w:115, h:180 }, // forward bend
  yoga3: { imgSrc:Y, imgW:880, offTop:-10,  offLeft:-275, w:120, h:180 }, // backroll
  yoga4: { imgSrc:Y, imgW:880, offTop:-10,  offLeft:-398, w:120, h:180 }, // star pose
  yoga5: { imgSrc:Y, imgW:880, offTop:-10,  offLeft:-525, w:110, h:180 }, // shoulder stand
  yoga6: { imgSrc:Y, imgW:880, offTop:-190, offLeft:0,    w:130, h:180 }, // lunge
  yoga7: { imgSrc:Y, imgW:880, offTop:-190, offLeft:-138, w:120, h:180 }, // forward lean
  yoga8: { imgSrc:Y, imgW:880, offTop:-190, offLeft:-265, w:90,  h:180 }, // standing
  yoga9: { imgSrc:Y, imgW:880, offTop:-190, offLeft:-360, w:115, h:180 }, // crawl
  yoga10:{ imgSrc:Y, imgW:880, offTop:-190, offLeft:-478, w:110, h:180 }, // seated
}

/** Helper shorthand — ใช้ preset name โดยตรง */
export function Char({ name, size = 1, flip, style }) {
  const p = CHARS[name]
  if (!p) return null
  return (
    <CharDecor
      imgSrc={p.imgSrc}
      imgW={p.imgW * size}
      offTop={p.offTop * size}
      offLeft={p.offLeft * size}
      w={p.w * size}
      h={p.h * size}
      flip={flip}
      style={style}
    />
  )
}
