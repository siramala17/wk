import { NUTRITION_ADVICE, EXERCISE_ADVICE, STRESS_ADVICE, pickAdvice } from './healthAdvice'

const DIMENSIONS = [
  { key: 'nutritionScore', label: 'โภชนาการ',       icon: '🥗' },
  { key: 'exerciseScore',  label: 'การออกกำลังกาย', icon: '🏃' },
  { key: 'stressScore',    label: 'อารมณ์',          icon: '🧘' },
]

function scoreLevel(s) {
  if (s >= 80) return { label: 'ดีเยี่ยม',   color: '#059669', bg: '#d1fae5' }
  if (s >= 65) return { label: 'ดี',          color: '#2563eb', bg: '#dbeafe' }
  if (s >= 50) return { label: 'พอใช้ได้',   color: '#d97706', bg: '#fef3c7' }
  if (s >= 35) return { label: 'ควรปรับปรุง', color: '#ea580c', bg: '#ffedd5' }
  return               { label: 'ต้องแก้ไขด่วน', color: '#dc2626', bg: '#fee2e2' }
}

function overallLevel(s) {
  if (s >= 80) return { label: 'สุขภาพดีเยี่ยม', color: '#059669' }
  if (s >= 65) return { label: 'สุขภาพดี',        color: '#2563eb' }
  if (s >= 50) return { label: 'พอใช้ได้',        color: '#d97706' }
  if (s >= 35) return { label: 'ควรปรับปรุง',     color: '#ea580c' }
  return               { label: 'ต้องแก้ไขด่วน',  color: '#dc2626' }
}

function bar(score) {
  const color = score >= 65 ? '#2563eb' : score >= 50 ? '#d97706' : '#dc2626'
  return `<div style="background:#e5e7eb;border-radius:99px;height:8px;margin-top:4px;">
    <div style="width:${Math.round(score)}%;background:${color};height:8px;border-radius:99px;"></div>
  </div>`
}

function userCard(user, assessment, index) {
  const overall = assessment.overallScore ?? 0
  const ol = overallLevel(overall)
  const needImprove = DIMENSIONS.filter(d => (assessment[d.key] ?? 0) < 65)
  const date = assessment.date
    ? new Date(assessment.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-'

  const dimRows = DIMENSIONS.map(d => {
    const s = assessment[d.key] ?? 0
    const lv = scoreLevel(s)
    const warn = s < 65 ? `background:${lv.bg};border-left:3px solid ${lv.color};` : ''
    return `<tr style="${warn}">
      <td style="padding:6px 8px;">${d.icon} ${d.label}</td>
      <td style="padding:6px 8px;text-align:right;font-weight:700;color:${lv.color};">${Math.round(s)}</td>
      <td style="padding:6px 8px;width:140px;">${bar(s)}</td>
      <td style="padding:6px 8px;">
        <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:${lv.bg};color:${lv.color};font-weight:600;">${lv.label}</span>
      </td>
    </tr>`
  }).join('')

  const improveTags = needImprove.map(d =>
    `<span style="background:#fff1f2;color:#be123c;border:1px solid #fecdd3;padding:3px 10px;border-radius:99px;font-size:12px;margin:2px;">⚠️ ${d.label}</span>`
  ).join('')

  const nutritionScore = assessment.nutritionScore ?? 0
  const exerciseScore  = assessment.exerciseScore ?? 0
  const stressScore    = assessment.stressScore ?? 0
  const nutritionTips = nutritionScore < 65 ? pickAdvice(NUTRITION_ADVICE, nutritionScore) : []
  const exerciseTips  = exerciseScore  < 65 ? pickAdvice(EXERCISE_ADVICE,  exerciseScore)  : []
  const stressTips    = stressScore    < 65 ? pickAdvice(STRESS_ADVICE,   stressScore)    : []
  const adviceBlock = (title, tips, bg, border, color) => tips.length > 0 ? `
    <div style="padding:10px 16px;background:${bg};border-top:1px solid ${border};">
      <div style="font-size:12px;font-weight:700;color:${color};margin-bottom:6px;">${title}</div>
      <ul style="margin:0;padding-left:18px;font-size:12px;color:#1e293b;line-height:1.7;">
        ${tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>` : ''

  return `
  <div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:'Sarabun',sans-serif;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#6366f1);color:white;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:18px;font-weight:800;">${index}. ${user.firstName || ''} ${user.lastName || ''}</div>
        <div style="font-size:12px;opacity:0.85;margin-top:2px;">
          ${user.gradeLevel ? `ชั้น ${user.gradeLevel} · ` : ''}${user.gender || ''} · ประเมินวันที่ ${date}
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:28px;font-weight:900;">${Math.round(overall)}</div>
        <div style="font-size:11px;opacity:0.85;">/ 100 คะแนน</div>
        <div style="font-size:12px;font-weight:700;margin-top:2px;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:99px;">${ol.label}</div>
      </div>
    </div>

    <!-- Table -->
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#f8fafc;color:#64748b;font-size:11px;">
          <th style="padding:6px 8px;text-align:left;">ด้าน</th>
          <th style="padding:6px 8px;text-align:right;">คะแนน</th>
          <th style="padding:6px 8px;">กราฟ</th>
          <th style="padding:6px 8px;">ระดับ</th>
        </tr>
      </thead>
      <tbody>${dimRows}</tbody>
    </table>

    <!-- Improve section -->
    ${needImprove.length > 0 ? `
    <div style="padding:10px 16px;background:#fff8f1;border-top:1px solid #fde68a;">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:6px;">ด้านที่ควรปรับปรุง:</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">${improveTags}</div>
    </div>` : `
    <div style="padding:10px 16px;background:#f0fdf4;border-top:1px solid #bbf7d0;">
      <span style="font-size:12px;color:#166534;">✅ ผ่านเกณฑ์ทุกด้าน</span>
    </div>`}

    <!-- Personalized recommendations -->
    ${adviceBlock('🥗 คำแนะนำเฉพาะบุคคล: โภชนาการ', nutritionTips, '#eff6ff', '#bfdbfe', '#1e40af')}
    ${adviceBlock('🏃 คำแนะนำเฉพาะบุคคล: ออกกำลังกาย', exerciseTips, '#fff7ed', '#fed7aa', '#9a3412')}
    ${adviceBlock('🧘 คำแนะนำเฉพาะบุคคล: อารมณ์', stressTips, '#faf5ff', '#e9d5ff', '#6b21a8')}
  </div>`
}

function deltaArrow(d) {
  if (d > 0) return `<span style="color:#059669;font-weight:700;">▲ +${d}</span>`
  if (d < 0) return `<span style="color:#dc2626;font-weight:700;">▼ ${d}</span>`
  return `<span style="color:#94a3b8;">—</span>`
}

function comparisonCard(user, prev, curr, index) {
  const overallDelta = Math.round((curr.overallScore ?? 0) - (prev.overallScore ?? 0))
  const prevDateStr = prev.date ? new Date(prev.date + 'T12:00:00').toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
  const currDateStr = curr.date ? new Date(curr.date + 'T12:00:00').toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
  const prevOverall = Math.round(prev.overallScore ?? 0)
  const currOverall = Math.round(curr.overallScore ?? 0)
  const deltaColor = overallDelta > 0 ? '#4ade80' : overallDelta < 0 ? '#fca5a5' : 'rgba(255,255,255,0.7)'
  const deltaSign = overallDelta > 0 ? '▲ +' : overallDelta < 0 ? '▼ ' : '— '

  const dimRows = DIMENSIONS.map(d => {
    const p = Math.round(prev[d.key] ?? 0)
    const c = Math.round(curr[d.key] ?? 0)
    const delta = c - p
    const lv = scoreLevel(c)
    return `<tr>
      <td style="padding:6px 8px;">${d.icon} ${d.label}</td>
      <td style="padding:6px 8px;text-align:right;color:#94a3b8;">${p}</td>
      <td style="padding:6px 8px;text-align:right;font-weight:700;color:${lv.color};">${c}</td>
      <td style="padding:6px 8px;text-align:center;">${deltaArrow(delta)}</td>
      <td style="padding:6px 8px;width:120px;">${bar(c)}</td>
    </tr>`
  }).join('')

  return `
<div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1e40af,#6366f1);color:white;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:18px;font-weight:800;">${index}. ${user.firstName || ''} ${user.lastName || ''}</div>
      <div style="font-size:12px;opacity:0.85;margin-top:2px;">${user.gradeLevel ? `ชั้น ${user.gradeLevel} · ` : ''}${user.gender || ''}</div>
    </div>
    <div style="text-align:right;background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;">
      <div style="font-size:11px;opacity:0.8;margin-bottom:2px;">ก่อน → หลัง</div>
      <div style="font-size:20px;font-weight:900;">${prevOverall} → ${currOverall}</div>
      <div style="font-size:13px;font-weight:700;color:${deltaColor};">${deltaSign}${Math.abs(overallDelta)}</div>
    </div>
  </div>
  <div style="background:#f8fafc;padding:4px 16px;font-size:11px;color:#64748b;display:flex;gap:20px;border-bottom:1px solid #e5e7eb;">
    <span>📅 ก่อน: ${prevDateStr}</span>
    <span>📅 หลัง: ${currDateStr}</span>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f8fafc;color:#64748b;font-size:11px;">
        <th style="padding:6px 8px;text-align:left;">ด้าน</th>
        <th style="padding:6px 8px;text-align:right;">ก่อน</th>
        <th style="padding:6px 8px;text-align:right;">หลัง</th>
        <th style="padding:6px 8px;text-align:center;">เปลี่ยน</th>
        <th style="padding:6px 8px;">กราฟ</th>
      </tr>
    </thead>
    <tbody>${dimRows}</tbody>
  </table>
</div>`
}

export function exportComparisonPDF(users, assessments) {
  const byUser = {}
  for (const a of assessments) {
    const uid = String(a.userId)
    if (!byUser[uid]) byUser[uid] = []
    byUser[uid].push(a)
  }
  for (const uid in byUser) {
    byUser[uid].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  }

  const targets = users
    .map(u => ({ user: u, history: byUser[String(u.id)] }))
    .filter(({ history }) => history && history.length >= 2)
    .sort((a, b) => {
      const aLatest = a.history[a.history.length - 1].overallScore ?? 0
      const bLatest = b.history[b.history.length - 1].overallScore ?? 0
      return aLatest - bLatest
    })

  if (targets.length === 0) {
    alert('ไม่พบผู้ใช้ที่มีประวัติการประเมินมากกว่า 1 ครั้ง')
    return
  }

  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  const cards = targets.map(({ user, history }, i) => {
    const prev = history[history.length - 2]
    const curr = history[history.length - 1]
    return comparisonCard(user, prev, curr, i + 1)
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>รายงานเปรียบเทียบก่อน-หลัง</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Sarabun',sans-serif; background:white; color:#1e293b; padding:32px; font-size:14px; }
    @media print { body { padding:16px; } @page { margin:16mm; size:A4; } .back-btn { display:none; } }
    .back-btn { display:inline-flex; align-items:center; gap:6px; margin-bottom:16px; padding:8px 16px; background:#1e40af; color:white; border:none; border-radius:8px; font-family:'Sarabun',sans-serif; font-size:13px; font-weight:600; cursor:pointer; }
    .back-btn:hover { background:#1e3a8a; }
  </style>
</head>
<body>
  <button class="back-btn" onclick="window.close()">← กลับ</button>
  <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
    <div style="font-size:22px;font-weight:800;color:#1e40af;">WatklangHealthXAI — รายงานเปรียบเทียบผลประเมินก่อน-หลัง</div>
    <div style="color:#64748b;margin-top:6px;font-size:13px;">วันที่ออกรายงาน: ${today} · พบ ${targets.length} ราย ที่มีการประเมินมากกว่า 1 ครั้ง</div>
  </div>
  ${cards}
  <div style="text-align:center;color:#94a3b8;font-size:11px;margin-top:20px;">
    รายงานนี้สร้างโดยระบบ WatklangHealthXAI — เป็นความลับ ห้ามเผยแพร่โดยไม่ได้รับอนุญาต
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
}

export function exportImprovementPDF(users, assessments) {
  // จับคู่ assessment ล่าสุดของแต่ละ user
  const latestMap = {}
  for (const a of assessments) {
    const uid = String(a.userId)
    if (!latestMap[uid] || a.date > latestMap[uid].date) latestMap[uid] = a
  }

  // กรองเฉพาะ user ที่มีผลประเมินและ overallScore < 65
  const targets = users
    .map(u => ({ user: u, assessment: latestMap[String(u.id)] }))
    .filter(({ assessment }) => assessment && (assessment.overallScore ?? 100) < 65)
    .sort((a, b) => (a.assessment.overallScore ?? 0) - (b.assessment.overallScore ?? 0))

  if (targets.length === 0) {
    alert('ไม่พบผู้ใช้ที่มีคะแนนต้องปรับปรุง (< 65 คะแนน)')
    return
  }

  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  const cards  = targets.map(({ user, assessment }, i) => userCard(user, assessment, i + 1)).join('')

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>รายงานผู้ที่ต้องปรับปรุงสุขภาพ</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Sarabun', sans-serif; background: white; color: #1e293b; padding: 32px; font-size: 14px; }
    @media print {
      body { padding: 16px; }
      @page { margin: 16mm; size: A4; }
      .back-btn { display: none; }
    }
    .back-btn { display:inline-flex; align-items:center; gap:6px; margin-bottom:16px; padding:8px 16px; background:#1e40af; color:white; border:none; border-radius:8px; font-family:'Sarabun',sans-serif; font-size:13px; font-weight:600; cursor:pointer; }
    .back-btn:hover { background:#1e3a8a; }
  </style>
</head>
<body>
  <button class="back-btn" onclick="window.close()">← กลับ</button>
  <!-- Cover header -->
  <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
    <div style="font-size:22px;font-weight:800;color:#1e40af;">WatklangHealthXAI — รายงานผู้ที่ต้องปรับปรุงสุขภาพ</div>
    <div style="color:#64748b;margin-top:6px;font-size:13px;">วันที่ออกรายงาน: ${today} · พบ ${targets.length} ราย (คะแนนรวม &lt; 65)</div>
  </div>
  ${cards}
  <div style="text-align:center;color:#94a3b8;font-size:11px;margin-top:20px;">
    รายงานนี้สร้างโดยระบบ WatklangHealthXAI — เป็นความลับ ห้ามเผยแพร่โดยไม่ได้รับอนุญาต
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
}
