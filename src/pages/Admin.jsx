import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Eye, EyeOff, Users, LogOut, User, Calendar, Hash, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Check, X, Trash2, AlertTriangle, ExternalLink, Clock, FileDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchCloudUsers, fetchSubmissions, updateSubmissionStatus, deleteCloudUser, deleteUserSubmissions, fetchSurveys, deleteSurvey, fetchRedemptions, updateRedemptionStatus, fetchRewardCatalog, addReward, updateReward, deleteReward, testFirestoreAccess, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement, fetchAllAssessments, fetchResearchParticipants, deleteResearchParticipant } from '../services/userSync'
import { exportImprovementPDF, exportComparisonPDF } from '../utils/exportPdf'
import { sendPushToAll, fcmReady } from '../services/fcm'
import { useHealth } from '../context/HealthContext'
import { firebaseReady } from '../config/firebase'

const ADMIN_PASSWORD = '2569'

const GENDER_STYLE = {
  'ชาย':    { bg: 'bg-indigo-100',   text: 'text-indigo-700',   emoji: '♂' },
  'หญิง':   { bg: 'bg-pink-100',   text: 'text-pink-700',   emoji: '♀' },
  'LGBTQ+': { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🏳️‍🌈' },
}

const CATEGORIES = {
  exercise: { label: 'ออกกำลังกาย',     emoji: '🏃' },
  food:     { label: 'อาหารสุขภาพ',      emoji: '🥗' },
  sleep:    { label: 'นอนหลับพักผ่อน',   emoji: '🌙' },
  stress:   { label: 'จัดการความเครียด', emoji: '🧘' },
  other:    { label: 'กิจกรรมอื่น ๆ',    emoji: '⭐' },
}

const STATUS_CONFIG = {
  pending:  { label: 'รอตรวจสอบ',  emoji: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { label: 'อนุมัติแล้ว', emoji: '✅', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  rejected: { label: 'ไม่ผ่าน',    emoji: '❌', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function Avatar({ src, size = 'md' }) {
  const dim = size === 'lg' ? 'w-20 h-20 rounded-2xl' : 'w-12 h-12 rounded-xl'
  return (
    <div className={`${dim} overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center`}>
      {src ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
           : <User size={size === 'lg' ? 32 : 20} className="text-slate-400" />}
    </div>
  )
}

function GenderBadge({ gender, small }) {
  const gs = GENDER_STYLE[gender]
  if (!gs) return null
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full font-semibold ${gs.bg} ${gs.text} ${small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
      {gs.emoji} {gender}
    </span>
  )
}

function FirestoreRulesWarning() {
  const [show, setShow] = useState(false)
  return (
    <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-base">🔒</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-red-800 text-sm">Firestore Security Rules บล็อกการบันทึกข้อมูล</p>
          <p className="text-red-600 text-xs">ผู้ใช้ลงทะเบียนแล้ว แต่ข้อมูลถูกบล็อกไม่ให้บันทึกลง Cloud</p>
        </div>
        <button onClick={() => setShow(p => !p)} className="text-red-500 hover:text-red-700 flex-shrink-0 text-xs underline">
          {show ? 'ซ่อน' : 'วิธีแก้ไข →'}
        </button>
      </div>
      {show && (
        <div className="bg-red-50 border-t border-red-200 px-5 py-4 space-y-3">
          <p className="text-sm font-semibold text-red-800">วิธีแก้ไข Firestore Security Rules</p>
          <ol className="space-y-2 text-sm text-red-700">
            {[
              <>ไปที่ <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">console.firebase.google.com</span></>,
              <>เลือก project → <strong>Build → Firestore Database → Rules</strong></>,
              <>แทนที่ rules ทั้งหมดด้วยโค้ดด้านล่าง แล้วกด <strong>Publish</strong></>,
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-400 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <pre className="bg-white border border-red-200 rounded-xl p-3 text-xs text-slate-700 overflow-x-auto whitespace-pre">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
          <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors mt-2">
            <ExternalLink size={14} /> เปิด Firebase Console
          </a>
        </div>
      )}
    </div>
  )
}

// ── Research Participants Export ─────────────────────────────────────────────
function exportResearchPDF(participants, assessments) {
  const now = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  const total = participants.length
  const maleCount   = participants.filter(p => p.gender === 'ชาย').length
  const femaleCount = participants.filter(p => p.gender === 'หญิง').length
  const otherCount  = total - maleCount - femaleCount

  // grade summary
  const gradeMap = {}
  participants.forEach(p => { gradeMap[p.gradeLevel] = (gradeMap[p.gradeLevel] || 0) + 1 })
  const gradeRows = Object.entries(gradeMap).sort((a,b) => b[1]-a[1])
    .map(([g, n]) => `<tr><td>${g}</td><td style="text-align:center">${n}</td><td style="text-align:center">${((n/total)*100).toFixed(1)}%</td></tr>`).join('')

  // school summary
  const schoolMap = {}
  participants.forEach(p => { schoolMap[p.school] = (schoolMap[p.school] || 0) + 1 })
  const schoolRows = Object.entries(schoolMap).sort((a,b) => b[1]-a[1]).slice(0,10)
    .map(([s, n]) => `<tr><td>${s}</td><td style="text-align:center">${n}</td></tr>`).join('')

  // health summary from assessments
  const DIMS = [
    { key: 'sleepScore',     label: 'การนอนหลับ' },
    { key: 'nutritionScore', label: 'โภชนาการ' },
    { key: 'exerciseScore',  label: 'การออกกำลังกาย' },
    { key: 'digitalScore',   label: 'การใช้หน้าจอ' },
    { key: 'stressScore',    label: 'ความเครียด' },
  ]
  const hasAss = assessments.length > 0
  const avgOverall = hasAss ? (assessments.reduce((s,a) => s + (a.overallScore||0), 0) / assessments.length).toFixed(1) : '-'
  const dimRows = DIMS.map(d => {
    const avg = hasAss ? (assessments.reduce((s,a) => s + (a[d.key]||0), 0) / assessments.length).toFixed(1) : '-'
    return `<tr><td>${d.label}</td><td style="text-align:center">${avg}</td></tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body { font-family: 'Sarabun', sans-serif; margin: 32px; color:#222; font-size:13px; }
  h1 { font-size:20px; color:#4f46e5; margin-bottom:4px; }
  h2 { font-size:15px; color:#4f46e5; margin-top:24px; border-bottom:2px solid #e0e7ff; padding-bottom:4px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th { background:#4f46e5; color:white; padding:7px 10px; font-size:12px; text-align:left; }
  td { padding:6px 10px; border-bottom:1px solid #f0f0f0; }
  tr:nth-child(even) td { background:#f8f7ff; }
  .stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:10px; }
  .stat-box { background:#f0f4ff; border-radius:10px; padding:12px; text-align:center; }
  .stat-num { font-size:28px; font-weight:900; color:#4f46e5; }
  .stat-lbl { font-size:11px; color:#666; margin-top:2px; }
  .footer { margin-top:32px; font-size:10px; color:#888; border-top:1px solid #eee; padding-top:10px; }
</style></head><body>
<h1>🔬 รายงานผู้เข้าร่วมวิจัย — W.K. Smart Teen Health AI</h1>
<p style="color:#666;font-size:12px">ส่งออกเมื่อ ${now} · ผู้ดูแลระบบ Admin</p>

<h2>📊 ภาพรวมผู้เข้าร่วม</h2>
<div class="stat-grid">
  <div class="stat-box"><div class="stat-num">${total}</div><div class="stat-lbl">ผู้เข้าร่วมทั้งหมด</div></div>
  <div class="stat-box"><div class="stat-num">${maleCount}</div><div class="stat-lbl">เพศชาย</div></div>
  <div class="stat-box"><div class="stat-num">${femaleCount}</div><div class="stat-lbl">เพศหญิง</div></div>
</div>

<h2>🎓 ระดับชั้นของผู้เข้าร่วม</h2>
<table><thead><tr><th>ระดับชั้น</th><th>จำนวน</th><th>%</th></tr></thead><tbody>${gradeRows}</tbody></table>

<h2>🏫 โรงเรียน / สถาบัน</h2>
<table><thead><tr><th>โรงเรียน / สถาบัน</th><th>จำนวน</th></tr></thead><tbody>${schoolRows}</tbody></table>

${hasAss ? `<h2>📈 ภาพรวมสุขภาพ (จาก ${assessments.length} การประเมิน)</h2>
<div class="stat-grid" style="grid-template-columns:1fr 1fr">
  <div class="stat-box"><div class="stat-num">${avgOverall}</div><div class="stat-lbl">คะแนนสุขภาพเฉลี่ย</div></div>
  <div class="stat-box"><div class="stat-num">${assessments.length}</div><div class="stat-lbl">จำนวนการประเมินทั้งหมด</div></div>
</div>
<h2>📋 คะแนนรายสมรรถนะ (เฉลี่ย)</h2>
<table><thead><tr><th>ด้าน</th><th>คะแนนเฉลี่ย</th></tr></thead><tbody>${dimRows}</tbody></table>` : ''}

<h2>📋 รายชื่อผู้เข้าร่วมทั้งหมด</h2>
<table><thead><tr><th>#</th><th>ชื่อ-นามสกุล</th><th>อายุ</th><th>เพศ</th><th>โรงเรียน</th><th>ระดับชั้น</th><th>วันที่ลงทะเบียน</th></tr></thead>
<tbody>${participants.map((p,i) => `<tr>
  <td style="text-align:center">${i+1}</td>
  <td>${p.firstName} ${p.lastName}</td>
  <td style="text-align:center">${p.age}</td>
  <td style="text-align:center">${p.gender}</td>
  <td>${p.school}</td>
  <td>${p.gradeLevel}</td>
  <td>${new Date(p.registeredAt).toLocaleDateString('th-TH')}</td>
</tr>`).join('')}</tbody></table>

<div class="footer">W.K. Smart Teen Health AI · ข้อมูลเพื่อการวิจัยเท่านั้น · ห้ามเผยแพร่โดยไม่ได้รับอนุญาต</div>
</body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 600)
}

// ── ResearchTab Component ─────────────────────────────────────────────────────
function ResearchTab({ participants, loading, onRefresh, onDelete, deletingId, allAssessments }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const total = participants.length
  const maleCount   = participants.filter(p => p.gender === 'ชาย').length
  const femaleCount = participants.filter(p => p.gender === 'หญิง').length

  const DIMS = [
    { key: 'sleepScore',     label: 'การนอนหลับ',     emoji: '🌙' },
    { key: 'nutritionScore', label: 'โภชนาการ',        emoji: '🥗' },
    { key: 'exerciseScore',  label: 'การออกกำลังกาย',  emoji: '🏃' },
    { key: 'digitalScore',   label: 'การใช้หน้าจอ',   emoji: '📱' },
    { key: 'stressScore',    label: 'ความเครียด',      emoji: '🧠' },
  ]
  const hasAss = allAssessments.length > 0
  const avgOverall = hasAss ? (allAssessments.reduce((s,a) => s + (a.overallScore||0), 0) / allAssessments.length).toFixed(1) : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">🔬 ผู้เข้าร่วมวิจัย</h2>
          <p className="text-sm text-slate-500 mt-0.5">W.K. Smart Teen Health AI</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> รีเฟรช
          </button>
          <button onClick={() => exportResearchPDF(participants, allAssessments)} disabled={total === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            <FileDown size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ผู้เข้าร่วมทั้งหมด', value: total, color: 'bg-indigo-50 border-indigo-100', textColor: 'text-indigo-700' },
          { label: 'เพศชาย',             value: maleCount,   color: 'bg-blue-50 border-blue-100',   textColor: 'text-blue-700' },
          { label: 'เพศหญิง',            value: femaleCount, color: 'bg-pink-50 border-pink-100',   textColor: 'text-pink-700' },
          { label: 'คะแนนสุขภาพเฉลี่ย', value: avgOverall ?? '-', color: 'bg-green-50 border-green-100', textColor: 'text-green-700' },
        ].map(({ label, value, color, textColor }) => (
          <div key={label} className={`${color} border rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${textColor}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Health Scores by Domain */}
      {hasAss && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="font-bold text-slate-700 mb-3 text-sm">📈 คะแนนรายสมรรถนะ (เฉลี่ยจาก {allAssessments.length} การประเมิน)</p>
          <div className="space-y-2">
            {DIMS.map(d => {
              const avg = (allAssessments.reduce((s,a) => s + (a[d.key]||0), 0) / allAssessments.length)
              const pct = Math.round(avg)
              const color = pct >= 80 ? '#059669' : pct >= 65 ? '#2563eb' : pct >= 50 ? '#d97706' : '#dc2626'
              return (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="text-sm w-5">{d.emoji}</span>
                  <span className="text-xs text-slate-600 w-32 flex-shrink-0">{d.label}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-xs font-bold w-10 text-right" style={{ color }}>{avg.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Participant List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : total === 0 ? (
        <div className="text-center py-14 text-slate-400">
          <span className="text-4xl">🔬</span>
          <p className="text-sm mt-3">ยังไม่มีผู้ลงทะเบียนเข้าร่วมวิจัย</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">แสดง {total} รายการ</p>
          {participants.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-black text-xs flex-shrink-0">{i+1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-xs text-slate-500">อายุ {p.age} ปี · {p.gender}</span>
                  <span className="text-xs text-slate-500">{p.school}</span>
                  <span className="text-xs text-slate-500">{p.gradeLevel}</span>
                  {p.parentPhone && <span className="text-xs text-slate-400">ผู้ปกครอง: {p.parentPhone}</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ลงทะเบียน {new Date(p.registeredAt).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
              {confirmDeleteId === p.id ? (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500">ยกเลิก</button>
                  <button onClick={async () => { await onDelete(p.id); setConfirmDeleteId(null) }} disabled={deletingId === p.id}
                    className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white font-semibold disabled:opacity-50">
                    {deletingId === p.id ? '...' : 'ลบ'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDeleteId(p.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 ml-1">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { deleteUser: deleteLocalUser } = useHealth()

  // auth
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [shake, setShake] = useState(false)

  // firestore diagnostic
  const [firestoreStatus, setFirestoreStatus] = useState(null) // null | 'ok' | 'permission_denied' | 'unknown'

  // users tab
  const [expandedId, setExpandedId] = useState(null)
  const [filterRole, setFilterRole] = useState('all')
  const [cloudUsers, setCloudUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [fetchErrorMsg, setFetchErrorMsg] = useState('')

  // submissions tab
  const [submissions, setSubmissions] = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [noteInputs, setNoteInputs] = useState({})
  const [reviewingId, setReviewingId] = useState(null)
  const [expandedSub, setExpandedSub] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // surveys tab
  const [surveys, setSurveys] = useState([])
  const [surveyLoading, setSurveyLoading] = useState(false)
  const [deletingSurveyId, setDeletingSurveyId] = useState(null)

  // redemptions tab
  const [redemptions, setRedemptions] = useState([])
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [reviewingRedeemId, setReviewingRedeemId] = useState(null)
  const [redeemNoteInputs, setRedeemNoteInputs] = useState({})
  const [redeemSubTab, setRedeemSubTab] = useState('requests') // 'requests' | 'catalog'

  // reward catalog management
  const [catalog, setCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogSaving, setCatalogSaving] = useState(false)
  const [editingReward, setEditingReward] = useState(null) // null=closed, {}=new, {id,...}=edit
  const [deletingRewardId, setDeletingRewardId] = useState(null)

  // delete user
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')

  // grade filter
  const [filterGrade, setFilterGrade] = useState('all')

  // announcements tab
  const [announcements, setAnnouncements] = useState([])
  const [annLoading, setAnnLoading] = useState(false)
  const [editingAnn, setEditingAnn] = useState(null)
  const [deletingAnnId, setDeletingAnnId] = useState(null)
  const [annSaving, setAnnSaving] = useState(false)
  const [pushSending, setPushSending] = useState(null) // ann.id ที่กำลังส่ง
  const [pushResult, setPushResult] = useState(null)   // { sent, errors, total }

  // research tab
  const [researchParticipants, setResearchParticipants] = useState([])
  const [researchLoading, setResearchLoading] = useState(false)
  const [deletingResearchId, setDeletingResearchId] = useState(null)

  // tab
  const [adminTab, setAdminTab] = useState('users')
  const [allAssessments, setAllAssessments] = useState([])
  const [pdfLoading, setPdfLoading] = useState(false)
  const [comparisonPdfLoading, setComparisonPdfLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true); setFetchError(false); setFetchErrorMsg('')
    try {
      const users = await fetchCloudUsers()
      setCloudUsers(users)
      if (users.length === 0 && firebaseReady) {
        const result = await testFirestoreAccess()
        setFirestoreStatus(result.ok ? 'ok' : result.reason)
      } else {
        setFirestoreStatus(null)
      }
    }
    catch (e) { setFetchError(true); setFetchErrorMsg(e?.message || '') }
    finally { setLoading(false) }
  }, [])

  const loadSubmissions = useCallback(async () => {
    setSubLoading(true)
    try { setSubmissions((await fetchSubmissions()).reverse()) }
    catch { /* silent */ }
    finally { setSubLoading(false) }
  }, [])

  const loadSurveys = useCallback(async () => {
    setSurveyLoading(true)
    try { setSurveys((await fetchSurveys()).reverse()) }
    catch { /* silent */ }
    finally { setSurveyLoading(false) }
  }, [])

  const loadRedemptions = useCallback(async () => {
    setRedeemLoading(true)
    try { setRedemptions((await fetchRedemptions()).reverse()) }
    catch { /* silent */ }
    finally { setRedeemLoading(false) }
  }, [])

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true)
    try { setCatalog(await fetchRewardCatalog()) }
    catch { /* silent */ }
    finally { setCatalogLoading(false) }
  }, [])

  const loadAnnouncements = useCallback(async () => {
    setAnnLoading(true)
    try { setAnnouncements(await fetchAnnouncements()) }
    catch { /* silent */ }
    finally { setAnnLoading(false) }
  }, [])

  const loadResearch = useCallback(async () => {
    setResearchLoading(true)
    try { setResearchParticipants(await fetchResearchParticipants()) }
    catch { /* silent */ }
    finally { setResearchLoading(false) }
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadUsers(); loadSubmissions(); loadSurveys(); loadRedemptions(); loadCatalog(); loadAnnouncements(); loadResearch()
      fetchAllAssessments().then(setAllAssessments).catch(() => {})
    }
  }, [authenticated, loadUsers, loadSubmissions, loadSurveys, loadRedemptions, loadCatalog, loadAnnouncements])

  async function handleExportPDF() {
    setPdfLoading(true)
    try {
      const assessments = allAssessments.length > 0 ? allAssessments : await fetchAllAssessments()
      setAllAssessments(assessments)
      exportImprovementPDF(cloudUsers, assessments)
    } catch (e) {
      alert('เกิดข้อผิดพลาด: ' + e.message)
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleExportComparisonPDF() {
    setComparisonPdfLoading(true)
    try {
      const assessments = allAssessments.length > 0 ? allAssessments : await fetchAllAssessments()
      setAllAssessments(assessments)
      exportComparisonPDF(cloudUsers, assessments)
    } catch (e) {
      alert('เกิดข้อผิดพลาด: ' + e.message)
    } finally {
      setComparisonPdfLoading(false)
    }
  }

  async function handleReview(id, status) {
    setReviewingId(id)
    try { await updateSubmissionStatus(id, status, noteInputs[id] || ''); await loadSubmissions() }
    catch { /* silent */ }
    finally { setReviewingId(null) }
  }

  async function handleSaveReward(form) {
    setCatalogSaving(true)
    try {
      if (form.id) {
        await updateReward(form)
      } else {
        await addReward({ ...form, id: `r_${Date.now()}`, active: true })
      }
      await loadCatalog()
      setEditingReward(null)
    } catch { /* silent */ }
    finally { setCatalogSaving(false) }
  }

  async function handleDeleteReward(id) {
    setDeletingRewardId(id)
    try { await deleteReward(id); await loadCatalog() }
    catch { /* silent */ }
    finally { setDeletingRewardId(null) }
  }

  async function handleToggleReward(r) {
    await updateReward({ ...r, active: !r.active })
    await loadCatalog()
  }

  async function handleReviewRedemption(id, status) {
    setReviewingRedeemId(id)
    try {
      await updateRedemptionStatus(id, status, redeemNoteInputs[id] || '')
      await loadRedemptions()
    } catch { /* silent */ }
    finally { setReviewingRedeemId(null) }
  }

  async function handleSaveAnn(form) {
    setAnnSaving(true)
    try {
      if (form.id) { await updateAnnouncement(form) }
      else { await addAnnouncement(form) }
      await loadAnnouncements()
      setEditingAnn(null)
    } catch { /* silent */ }
    finally { setAnnSaving(false) }
  }

  async function handleDeleteAnn(id) {
    setDeletingAnnId(id)
    try { await deleteAnnouncement(id); await loadAnnouncements() }
    catch { /* silent */ }
    finally { setDeletingAnnId(null) }
  }

  async function handleToggleAnn(ann) {
    await updateAnnouncement({ ...ann, active: !ann.active })
    await loadAnnouncements()
  }

  async function handleSendPush(ann) {
    setPushSending(ann.id)
    setPushResult(null)
    try {
      const result = await sendPushToAll({ title: `${ann.emoji} ${ann.title}`, body: ann.body || '' })
      setPushResult(result)
      setTimeout(() => setPushResult(null), 5000)
    } catch (e) {
      setPushResult({ error: e?.message || 'เกิดข้อผิดพลาด' })
      setTimeout(() => setPushResult(null), 5000)
    } finally {
      setPushSending(null)
    }
  }

  async function handleDeleteSurvey(id) {
    setDeletingSurveyId(id)
    try { await deleteSurvey(id); await loadSurveys() }
    catch { /* silent */ }
    finally { setDeletingSurveyId(null) }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      deleteLocalUser(deleteTarget.id)
      await deleteCloudUser(deleteTarget.id)
      await deleteUserSubmissions(deleteTarget.id)
      setDeleteSuccess(`ลบ "${deleteTarget.firstName} ${deleteTarget.lastName}" เรียบร้อยแล้ว`)
      setDeleteTarget(null)
      setExpandedId(null)
      await loadUsers()
      await loadSubmissions()
      setTimeout(() => setDeleteSuccess(''), 4000)
    } catch (err) {
      setDeleteError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setDeleting(false)
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setLoginError(false) }
    else {
      setLoginError(true); setShake(true); setPassword('')
      setTimeout(() => setShake(false), 600)
    }
  }

  function handleLogout() { setAuthenticated(false); setPassword(''); setLoginError(false); navigate('/') }

  // ── LOGIN ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className={`w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl ${shake ? 'animate-bounce' : ''}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/20 border-2 border-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-indigo-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">ระบบหลังบ้าน</h1>
            <p className="text-indigo-300 text-sm mt-1">Admin Panel — กรุณาใส่รหัสผ่าน</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(false) }}
                placeholder="รหัสผ่าน"
                className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${loginError ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-indigo-400'}`}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1.5"><Shield size={14} /> รหัสผ่านไม่ถูกต้อง</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-colors active:scale-[0.98]">
              เข้าสู่ระบบ
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-1.5 text-white/40 hover:text-white/70 text-sm mt-4 transition-colors">
            <ArrowLeft size={14} /> กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  // ── DASHBOARD ──
  // (deleteTarget modal rendered at end of component)
  const total     = cloudUsers.length
  const avgAge    = total > 0 ? Math.round(cloudUsers.reduce((s, u) => s + (u.age || 0), 0) / total) : null
  const male      = cloudUsers.filter(u => u.gender === 'ชาย').length
  const female    = cloudUsers.filter(u => u.gender === 'หญิง').length
  const lgbt      = cloudUsers.filter(u => u.gender === 'LGBTQ+').length
  const students  = cloudUsers.filter(u => u.role === 'นักเรียน').length
  const teachers  = cloudUsers.filter(u => u.role === 'ครู').length
  const general   = cloudUsers.filter(u => u.role === 'บุคคลทั่วไป').length
  const studentGrades = [...new Set(
    cloudUsers.filter(u => u.role === 'นักเรียน' && u.gradeLevel).map(u => u.gradeLevel)
  )].sort()
  const filteredCloudUsers = cloudUsers
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => filterGrade === 'all' || u.gradeLevel === filterGrade)
  const pendingCount = submissions.filter(s => s.status === 'pending').length

  const filteredSubs = filterStatus === 'all' ? submissions : submissions.filter(s => s.status === filterStatus)

  return (
    <div className="min-h-screen bg-slate-100">

      {/* top bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0"><Shield size={16} /></div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">ระบบหลังบ้าน</p>
            <p className="text-slate-400 text-xs hidden sm:block">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/10">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">หน้าหลัก</span>
          </button>
          <button onClick={() => { loadUsers(); loadSubmissions(); loadSurveys(); loadRedemptions() }} disabled={loading || subLoading || surveyLoading || redeemLoading}
            className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-indigo-300 text-sm transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40">
            <RefreshCw size={16} className={(loading || subLoading || surveyLoading || redeemLoading) ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/10">
            <LogOut size={16} />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Storage mode banner */}
        {!firebaseReady ? <LocalModeBanner /> : null}

        {/* Firestore permission warning */}
        {firestoreStatus === 'permission_denied' && <FirestoreRulesWarning />}
        {firestoreStatus === 'unknown' && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 text-yellow-800 text-sm">
            <p className="font-semibold">⚠️ Firestore ตอบสนองผิดปกติ</p>
            <p className="text-xs mt-1 text-yellow-700">ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือสถานะ Firebase Console</p>
          </div>
        )}

        {/* PDPA / sensitive data warning */}
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">⚠️ ข้อมูลสุขภาพส่วนบุคคล — เป็นความลับ</p>
            <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
              ข้อมูลในระบบนี้เป็นข้อมูลสุขภาพของนักเรียนซึ่งถือเป็น <strong>ข้อมูลอ่อนไหว</strong> ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) · ห้ามเปิดเผย คัดลอก หรือนำไปใช้โดยไม่ได้รับอนุญาต · ผู้ดูแลระบบมีความรับผิดชอบทางกฎหมายในการรักษาความลับ
            </p>
          </div>
        </div>

        {/* success banner */}
        {deleteSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
            <Check size={16} className="flex-shrink-0" /> {deleteSuccess}
          </div>
        )}

        {/* iPad sidebar + content layout */}
        <div className="md:flex md:gap-6 md:items-start">

          {/* Sidebar — visible on iPad+ only */}
          <div className="hidden md:flex flex-col gap-1 bg-white rounded-2xl p-2 shadow-sm w-52 flex-shrink-0 self-start sticky top-4">
            {[
              { key: 'users',         label: '👥 ผู้ใช้',    badge: null },
              { key: 'submissions',   label: '📸 ภาพ',        badge: pendingCount > 0 ? pendingCount : null },
              { key: 'redemptions',   label: '🎁 รางวัล',    badge: redemptions.filter(r => r.status === 'pending').length || null },
              { key: 'surveys',       label: '📊 สำรวจ',     badge: null },
              { key: 'announcements', label: '📢 ประกาศ',    badge: announcements.filter(a => a.active).length || null },
              { key: 'research',      label: '🔬 วิจัย',     badge: researchParticipants.length || null },
            ].map(({ key, label, badge }) => (
              <button key={key} onClick={() => setAdminTab(key)}
                className={`relative px-3 py-3 rounded-xl text-sm font-semibold transition-all text-left flex items-center justify-between gap-2 ${adminTab === key ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                <span>{label}</span>
                {badge != null && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Main content area */}
          <div className="md:flex-1 min-w-0">

            {/* Mobile tab selector — hidden on iPad+ */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:hidden bg-white rounded-2xl p-1 mb-5 shadow-sm gap-1">
              {[
                { key: 'users',         label: '👥 ผู้ใช้',    badge: null },
                { key: 'submissions',   label: '📸 ภาพ',        badge: pendingCount > 0 ? pendingCount : null },
                { key: 'redemptions',   label: '🎁 รางวัล',    badge: redemptions.filter(r => r.status === 'pending').length || null },
                { key: 'surveys',       label: '📊 สำรวจ',     badge: null },
                { key: 'announcements', label: '📢 ประกาศ',    badge: announcements.filter(a => a.active).length || null },
                { key: 'research',      label: '🔬 วิจัย',     badge: researchParticipants.length || null },
              ].map(({ key, label, badge }) => (
                <button key={key} onClick={() => setAdminTab(key)}
                  className={`relative py-2.5 rounded-xl text-xs font-semibold transition-all ${adminTab === key ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {label}
                  {badge != null && (
                    <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
                  )}
                </button>
              ))}
            </div>


        {/* ══ TAB: ผู้ใช้งาน ══ */}
        {adminTab === 'users' && (
          <>
            {loading && (
              <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">กำลังโหลดข้อมูลจาก cloud...</span>
              </div>
            )}
            {fetchError && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-4 text-red-600 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  <span className="font-semibold">ไม่สามารถเชื่อมต่อ Firestore ได้</span>
                  <button onClick={loadUsers} className="ml-auto text-xs underline hover:text-red-700 flex-shrink-0">ลองใหม่</button>
                </div>
                {fetchErrorMsg && (
                  <p className="text-xs text-red-500 bg-red-100 rounded-lg px-3 py-2 font-mono break-all">{fetchErrorMsg}</p>
                )}
                <p className="text-xs text-red-500">
                  ตรวจสอบ: Firestore Security Rules, การเชื่อมต่ออินเทอร์เน็ต, หรือสถานะ Firebase Console
                </p>
              </div>
            )}
            {!loading && !fetchError && (
              <>
                {/* summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Users size={20} className="text-indigo-600" /></div>
                      <div><p className="text-2xl font-bold text-slate-800">{total}</p><p className="text-slate-500 text-xs">ผู้ใช้ทั้งหมด</p></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><User size={20} className="text-green-600" /></div>
                      <div><p className="text-2xl font-bold text-slate-800">{avgAge ?? '-'}</p><p className="text-slate-500 text-xs">อายุเฉลี่ย (ปี)</p></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                  <div className="bg-indigo-50 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center gap-1"><span className="text-xl sm:text-2xl">♂</span><p className="text-lg sm:text-xl font-bold text-indigo-700">{male}</p><p className="text-indigo-500 text-xs">ชาย</p></div>
                  <div className="bg-pink-50 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center gap-1"><span className="text-xl sm:text-2xl">♀</span><p className="text-lg sm:text-xl font-bold text-pink-700">{female}</p><p className="text-pink-500 text-xs">หญิง</p></div>
                  <div className="bg-purple-50 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center gap-1"><span className="text-xl sm:text-2xl">🏳️‍🌈</span><p className="text-lg sm:text-xl font-bold text-purple-700">{lgbt}</p><p className="text-purple-500 text-xs">LGBTQ+</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <div className="bg-sky-50 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center gap-1"><span className="text-xl sm:text-2xl">🎒</span><p className="text-lg sm:text-xl font-bold text-sky-700">{students}</p><p className="text-sky-500 text-xs">นักเรียน</p></div>
                  <div className="bg-emerald-50 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center gap-1"><span className="text-xl sm:text-2xl">👩‍🏫</span><p className="text-lg sm:text-xl font-bold text-emerald-700">{teachers}</p><p className="text-emerald-500 text-xs">ครู</p></div>
                  <div className="bg-slate-100 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center gap-1"><span className="text-xl sm:text-2xl">👤</span><p className="text-lg sm:text-xl font-bold text-slate-700">{general}</p><p className="text-slate-500 text-xs">ทั่วไป</p></div>
                </div>

                {/* สถิติแยกระดับชั้น */}
                {studentGrades.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">🏫 นักเรียนแยกตามชั้น</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {studentGrades.map(grade => {
                        const count = cloudUsers.filter(u => u.role === 'นักเรียน' && u.gradeLevel === grade).length
                        return (
                          <button
                            key={grade}
                            onClick={() => { setFilterRole('นักเรียน'); setFilterGrade(grade); setExpandedId(null) }}
                            className="bg-sky-50 hover:bg-sky-100 rounded-xl p-3 text-center transition-colors cursor-pointer"
                          >
                            <p className="text-lg font-bold text-sky-700">{count}</p>
                            <p className="text-sky-500 text-xs truncate">{grade}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Export PDF buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={handleExportPDF}
                    disabled={pdfLoading}
                    className="py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 text-sm"
                    style={{ background: 'linear-gradient(135deg,#be123c,#f43f5e)', boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}
                  >
                    <FileDown size={16} />
                    {pdfLoading ? 'กำลังโหลด...' : 'PDF — ต้องปรับปรุง'}
                  </button>
                  <button
                    onClick={handleExportComparisonPDF}
                    disabled={comparisonPdfLoading}
                    className="py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 text-sm"
                    style={{ background: 'linear-gradient(135deg,#1e40af,#6366f1)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
                  >
                    <FileDown size={16} />
                    {comparisonPdfLoading ? 'กำลังโหลด...' : 'PDF — ก่อน/หลัง'}
                  </button>
                </div>

                {/* role filter */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {[
                    { key: 'all',          label: 'ทั้งหมด',       count: total },
                    { key: 'นักเรียน',     label: '🎒 นักเรียน',   count: students },
                    { key: 'ครู',           label: '👩‍🏫 ครู',       count: teachers },
                    { key: 'บุคคลทั่วไป', label: '👤 ทั่วไป',      count: general },
                  ].map(({ key, label, count }) => (
                    <button key={key} onClick={() => { setFilterRole(key); setFilterGrade('all'); setExpandedId(null) }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        filterRole === key ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}>
                      {label} <span className="opacity-70">({count})</span>
                    </button>
                  ))}
                </div>

                {/* grade filter — แสดงเฉพาะตอนเลือก นักเรียน */}
                {filterRole === 'นักเรียน' && studentGrades.length > 0 && (
                  <div className="bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 mb-4">
                    <p className="text-xs font-semibold text-sky-700 mb-2">🏫 แยกตามระดับชั้น</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => { setFilterGrade('all'); setExpandedId(null) }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          filterGrade === 'all' ? 'bg-sky-700 text-white' : 'bg-white text-sky-600 border border-sky-200 hover:bg-sky-50'
                        }`}
                      >
                        ทุกชั้น <span className="opacity-70">({students})</span>
                      </button>
                      {studentGrades.map(grade => {
                        const count = cloudUsers.filter(u => u.role === 'นักเรียน' && u.gradeLevel === grade).length
                        return (
                          <button
                            key={grade}
                            onClick={() => { setFilterGrade(grade); setExpandedId(null) }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              filterGrade === grade ? 'bg-sky-700 text-white' : 'bg-white text-sky-600 border border-sky-200 hover:bg-sky-50'
                            }`}
                          >
                            {grade} <span className="opacity-70">({count})</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* user list */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Users size={18} className="text-slate-500" />
                    <h2 className="font-bold text-slate-700">รายชื่อผู้ใช้งาน</h2>
                    <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredCloudUsers.length} คน</span>
                  </div>
                  {filteredCloudUsers.length === 0 ? (
                    <div className="py-16 text-center text-slate-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">{filterRole === 'all' ? 'ยังไม่มีผู้ลงทะเบียน' : 'ไม่มีผู้ใช้ในกลุ่มนี้'}</p></div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredCloudUsers.map((u, i) => (
                        <div key={u.id}>
                          <button onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                            className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left">
                            <Avatar src={u.avatar} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{u.firstName} {u.lastName}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-slate-500 text-xs">อายุ {u.age} ปี</span>
                                <GenderBadge gender={u.gender} small />
                                {u.role && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                                    {u.role === 'นักเรียน' ? '🎒' : u.role === 'ครู' ? '👩‍🏫' : '👤'}
                                    {u.gradeLevel ? ` ${u.gradeLevel}` : ` ${u.role}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-slate-400">#{i + 1}</span>
                              {expandedId === u.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                          </button>
                          {expandedId === u.id && (
                            <div className="px-5 pb-5 bg-slate-50">
                              <div className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                                  <Avatar src={u.avatar} size="lg" />
                                  <div><p className="font-bold text-slate-800 text-base">{u.firstName} {u.lastName}</p><GenderBadge gender={u.gender} /></div>
                                </div>
                                <div className="space-y-2.5">
                                  <div className="flex items-start gap-2"><Hash size={14} className="text-slate-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-slate-400">อายุ</p><p className="text-sm font-semibold text-slate-800">{u.age} ปี</p></div></div>
                                  <div className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 flex-shrink-0 text-sm leading-none">⚥</span><div><p className="text-xs text-slate-400">เพศ</p><GenderBadge gender={u.gender} />{!u.gender && <p className="text-sm font-semibold text-slate-800">-</p>}</div></div>
                                  <div className="flex items-start gap-2"><Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-slate-400">ลงทะเบียนเมื่อ</p><p className="text-sm font-semibold text-slate-800">{formatDate(u.registeredAt)}</p></div></div>
                                  {u.role && (
                                    <div className="flex items-start gap-2">
                                      <span className="text-slate-400 mt-0.5 flex-shrink-0 text-sm leading-none">
                                        {u.role === 'นักเรียน' ? '🎒' : u.role === 'ครู' ? '👩‍🏫' : '👤'}
                                      </span>
                                      <div>
                                        <p className="text-xs text-slate-400">สถานะ</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {u.role}{u.gradeLevel ? ` — ${u.gradeLevel}` : ''}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-red-100">
                                  <button
                                    onClick={() => { setDeleteTarget(u); setDeleteError('') }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-colors border border-red-200"
                                  >
                                    <Trash2 size={15} /> ลบผู้ใช้งานนี้
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ══ TAB: ตรวจสอบภาพ ══ */}
        {adminTab === 'submissions' && (
          <>
            {/* filter */}
            <div className="flex gap-2 mb-4">
              {[['all','ทั้งหมด'],['pending','รอตรวจ'],['approved','อนุมัติ'],['rejected','ไม่ผ่าน']].map(([v, l]) => (
                <button key={v} onClick={() => setFilterStatus(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterStatus === v ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                  {l} {v !== 'all' && <span className="ml-0.5 opacity-70">({submissions.filter(s => s.status === v).length})</span>}
                </button>
              ))}
            </div>

            {subLoading && (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            )}

            {!subLoading && filteredSubs.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <span className="text-5xl block mb-3">📭</span>
                <p className="text-sm">ไม่มีรายการในหมวดนี้</p>
              </div>
            )}

            {!subLoading && filteredSubs.map(s => {
              const cat = CATEGORIES[s.category] || CATEGORIES.other
              const st  = STATUS_CONFIG[s.status]  || STATUS_CONFIG.pending
              const isOpen = expandedSub === s.id
              return (
                <div key={s.id} className={`${st.bg} border ${st.border} rounded-2xl mb-3 overflow-hidden`}>
                  {/* header row */}
                  <button onClick={() => setExpandedSub(isOpen ? null : s.id)}
                    className="w-full flex items-center gap-3 p-4 text-left">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {s.photo
                        ? <img src={s.photo} alt="activity" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-2xl">{cat.emoji}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{cat.emoji}</span>
                        <p className="font-semibold text-slate-800 text-sm truncate">{cat.label}</p>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">โดย {s.userName} • {formatDate(s.submittedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold ${st.text}`}>{st.emoji} {st.label}</span>
                      {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                    </div>
                  </button>

                  {/* expanded detail */}
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* ภาพขนาดใหญ่ */}
                      {s.photo && (
                        <img src={s.photo} alt="activity" className="w-full max-h-72 object-cover rounded-xl" />
                      )}

                      {/* คำอธิบาย */}
                      {s.description && (
                        <div className="bg-white/80 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">คำอธิบาย</p>
                          <p className="text-sm text-slate-700">{s.description}</p>
                        </div>
                      )}

                      {/* ผู้ส่ง */}
                      <div className="bg-white/80 rounded-xl px-3 py-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                          {s.userAvatar ? <img src={s.userAvatar} alt="user" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-400 m-auto" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{s.userName}</p>
                          <p className="text-xs text-slate-400">ส่งเมื่อ {formatDate(s.submittedAt)}</p>
                        </div>
                      </div>

                      {/* note input + ปุ่ม */}
                      {s.status === 'pending' && (
                        <div className="space-y-2">
                          <textarea
                            value={noteInputs[s.id] || ''}
                            onChange={e => setNoteInputs(p => ({ ...p, [s.id]: e.target.value }))}
                            placeholder="หมายเหตุถึงผู้ส่ง (ไม่บังคับ)..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
                          />
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1 mb-1">
                            ⭐ อนุมัติ = ผู้ส่งได้รับ 5 แต้มอัตโนมัติ
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => handleReview(s.id, 'approved')}
                              disabled={reviewingId === s.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                              {reviewingId === s.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={15} /> อนุมัติ (+5 แต้ม)</>}
                            </button>
                            <button onClick={() => handleReview(s.id, 'rejected')}
                              disabled={reviewingId === s.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                              <X size={15} /> ไม่ผ่าน
                            </button>
                          </div>
                        </div>
                      )}

                      {/* admin note (reviewed) */}
                      {s.status !== 'pending' && s.adminNote && (
                        <div className="bg-white/80 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">หมายเหตุจาก Admin</p>
                          <p className="text-sm text-slate-700">{s.adminNote}</p>
                          <p className="text-xs text-slate-400 mt-1">ตรวจสอบเมื่อ {formatDate(s.reviewedAt)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ══ TAB: แลกรางวัล ══ */}
        {adminTab === 'redemptions' && (
          <RedemptionTab
            redemptions={redemptions}
            loading={redeemLoading}
            noteInputs={redeemNoteInputs}
            setNoteInputs={setRedeemNoteInputs}
            reviewingId={reviewingRedeemId}
            onReview={handleReviewRedemption}
            subTab={redeemSubTab}
            setSubTab={setRedeemSubTab}
            catalog={catalog}
            catalogLoading={catalogLoading}
            catalogSaving={catalogSaving}
            editingReward={editingReward}
            setEditingReward={setEditingReward}
            onSaveReward={handleSaveReward}
            onDeleteReward={handleDeleteReward}
            onToggleReward={handleToggleReward}
            deletingRewardId={deletingRewardId}
          />
        )}

        {/* ══ TAB: ความพึงพอใจ ══ */}
        {adminTab === 'surveys' && (
          <SurveyTab
            surveys={surveys}
            loading={surveyLoading}
            onDelete={handleDeleteSurvey}
            deletingId={deletingSurveyId}
          />
        )}

        {/* ══ TAB: ประกาศ ══ */}
        {adminTab === 'announcements' && (
          <AnnouncementTab
            announcements={announcements}
            loading={annLoading}
            editingAnn={editingAnn}
            setEditingAnn={setEditingAnn}
            onSave={handleSaveAnn}
            onDelete={handleDeleteAnn}
            onToggle={handleToggleAnn}
            deletingId={deletingAnnId}
            saving={annSaving}
            onSendPush={handleSendPush}
            pushSending={pushSending}
            pushResult={pushResult}
          />
        )}

        {/* ══ TAB: วิจัย ══ */}
        {adminTab === 'research' && (
          <ResearchTab
            participants={researchParticipants}
            loading={researchLoading}
            onRefresh={loadResearch}
            onDelete={async (id) => {
              setDeletingResearchId(id)
              try { await deleteResearchParticipant(id); await loadResearch() }
              catch { /* silent */ }
              finally { setDeletingResearchId(null) }
            }}
            deletingId={deletingResearchId}
            allAssessments={allAssessments}
          />
        )}

          </div>{/* closes md:flex-1 content div */}
        </div>{/* closes md:flex wrapper */}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-md shadow-2xl overflow-hidden">
            {/* modal header */}
            <div className="bg-red-50 border-b border-red-100 px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-700">ยืนยันการลบผู้ใช้งาน</p>
                <p className="text-xs text-red-500">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* user preview */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                <Avatar src={deleteTarget.avatar} size="md" />
                <div>
                  <p className="font-bold text-slate-800">{deleteTarget.firstName} {deleteTarget.lastName}</p>
                  <p className="text-sm text-slate-500">อายุ {deleteTarget.age} ปี • {deleteTarget.gender || '-'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">ลงทะเบียน {formatDate(deleteTarget.registeredAt)}</p>
                </div>
              </div>

              {/* what gets deleted */}
              <div className="bg-red-50 rounded-2xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-red-600 mb-2">ข้อมูลที่จะถูกลบ:</p>
                {[
                  'ข้อมูลโปรไฟล์ใน cloud',
                  'ภาพกิจกรรมที่ส่งทั้งหมด',
                  'บัญชีในอุปกรณ์นี้',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-red-700">
                    <X size={12} className="flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>

              {/* error */}
              {deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={14} /> {deleteError}
                </div>
              )}

              {/* buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError('') }}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังลบ...</>
                  ) : (
                    <><Trash2 size={15} /> ยืนยันลบ</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Redemption Tab Component ────────────────────────────────

const REDEEM_STATUS_CFG = {
  pending:  { label: 'รอการอนุมัติ', emoji: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { label: 'อนุมัติแล้ว',  emoji: '✅', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  rejected: { label: 'ไม่อนุมัติ',   emoji: '❌', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
}

// ── Reward edit form ──────────────────────────────────────

const BLANK_REWARD = { id: '', name: '', emoji: '🎁', cost: 500, desc: '', active: true }

function RewardEditModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || BLANK_REWARD)
  const isNew = !initial?.id

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{isNew ? 'เพิ่มของรางวัลใหม่' : 'แก้ไขของรางวัล'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-20">
              <label className="text-xs text-slate-500 mb-1 block">Emoji</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-2xl text-center focus:outline-none focus:border-indigo-400"
                value={form.emoji} maxLength={4}
                onChange={e => set('emoji', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">ชื่อของรางวัล <span className="text-red-400">*</span></label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                value={form.name} placeholder="เช่น บัตรกำนัล 50 บาท"
                onChange={e => set('name', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">คำอธิบาย</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
              value={form.desc} placeholder="รายละเอียดของรางวัล..."
              onChange={e => set('desc', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ราคา (แต้ม) <span className="text-red-400">*</span></label>
            <input
              type="number" min="1"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
              value={form.cost}
              onChange={e => set('cost', parseInt(e.target.value) || 0)}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.active ? 'bg-indigo-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-6' : 'left-1'}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">{form.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} disabled={saving}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50">
              ยกเลิก
            </button>
            <button
              onClick={() => { if (form.name.trim() && form.cost > 0) onSave(form) }}
              disabled={saving || !form.name.trim() || form.cost <= 0}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> บันทึก...</>
                : <><Check size={15} /> บันทึก</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Redemption Tab ────────────────────────────────────────

function RedemptionTab({
  redemptions, loading, noteInputs, setNoteInputs, reviewingId, onReview,
  subTab, setSubTab, catalog, catalogLoading, catalogSaving,
  editingReward, setEditingReward, onSaveReward, onDeleteReward, onToggleReward, deletingRewardId,
}) {
  const [filter, setFilter] = useState('pending')
  const filtered = filter === 'all' ? redemptions : redemptions.filter(r => r.status === filter)
  const pendingCount = redemptions.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* sub-tab */}
      <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-sm">
        <button onClick={() => setSubTab('requests')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all relative ${subTab === 'requests' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
          📋 คำขอแลก
          {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
        </button>
        <button onClick={() => setSubTab('catalog')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${subTab === 'catalog' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
          🎁 จัดการรางวัล
        </button>
      </div>

      {/* ── คำขอแลก ── */}
      {subTab === 'requests' && (
        <>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'รอการอนุมัติ', count: redemptions.filter(r => r.status === 'pending').length,  bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
                  { label: 'อนุมัติแล้ว',  count: redemptions.filter(r => r.status === 'approved').length, bg: 'bg-green-50 border-green-200',   text: 'text-green-700' },
                  { label: 'ไม่อนุมัติ',   count: redemptions.filter(r => r.status === 'rejected').length, bg: 'bg-red-50 border-red-200',       text: 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border rounded-2xl p-2.5 sm:p-3 text-center`}>
                    <p className={`text-xl sm:text-2xl font-black ${s.text}`}>{s.count}</p>
                    <p className={`text-[10px] sm:text-xs font-medium ${s.text} opacity-80`}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {[['pending','รอ'],['approved','อนุมัติ'],['rejected','ไม่ผ่าน'],['all','ทั้งหมด']].map(([v, l]) => (
                  <button key={v} onClick={() => setFilter(v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filter === v ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}>
                    {l} {v !== 'all' && <span className="opacity-60">({redemptions.filter(r => r.status === v).length})</span>}
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎁</span>
                  <p className="text-sm">ไม่มีรายการในหมวดนี้</p>
                </div>
              ) : filtered.map(r => {
                const st = REDEEM_STATUS_CFG[r.status] || REDEEM_STATUS_CFG.pending
                return (
                  <div key={r.id} className={`${st.bg} border ${st.border} rounded-2xl overflow-hidden`}>
                    <div className="flex items-center gap-3 p-4">
                      <span className="text-3xl flex-shrink-0">{r.rewardEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{r.rewardName}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {r.userName}{r.gradeLevel ? ` — ${r.gradeLevel}` : r.userRole ? ` — ${r.userRole}` : ''}
                        </p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`text-xs font-semibold ${st.text}`}>{st.emoji} {st.label}</span>
                          <span className="text-xs text-slate-500 font-semibold">-{r.pointsCost?.toLocaleString()} แต้ม</span>
                          <span className="text-xs text-slate-400">
                            {new Date(r.requestedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {r.adminNote && r.status !== 'pending' && (
                          <p className="text-xs text-slate-600 mt-1 bg-white/60 rounded-lg px-2 py-1">💬 {r.adminNote}</p>
                        )}
                      </div>
                    </div>
                    {r.status === 'pending' && (
                      <div className="px-4 pb-4 space-y-2">
                        <textarea
                          value={noteInputs[r.id] || ''}
                          onChange={e => setNoteInputs(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="หมายเหตุถึงผู้ขอแลก (ไม่บังคับ)..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => onReview(r.id, 'approved')} disabled={reviewingId === r.id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                            {reviewingId === r.id
                              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <><Check size={15} /> อนุมัติ</>}
                          </button>
                          <button onClick={() => onReview(r.id, 'rejected')} disabled={reviewingId === r.id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                            <X size={15} /> ไม่อนุมัติ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </>
      )}

      {/* ── จัดการรางวัล ── */}
      {subTab === 'catalog' && (
        <>
          <button onClick={() => setEditingReward({ ...BLANK_REWARD })}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-sm transition-colors">
            + เพิ่มของรางวัลใหม่
          </button>

          {catalogLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : catalog.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="text-4xl block mb-2">🎁</span>
              <p className="text-sm">ยังไม่มีของรางวัล — กดเพิ่มด้านบน</p>
            </div>
          ) : (
            <div className="space-y-2">
              {catalog.map(r => (
                <div key={r.id} className={`bg-white rounded-2xl border-2 p-3.5 flex items-center gap-3 ${
                  r.active ? 'border-slate-200' : 'border-slate-100 opacity-60'
                }`}>
                  <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        r.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>{r.active ? 'เปิด' : 'ปิด'}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{r.desc}</p>
                    <p className="text-xs font-bold text-yellow-600 mt-0.5">⭐ {r.cost?.toLocaleString()} แต้ม</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => setEditingReward({ ...r })}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors">
                      แก้ไข
                    </button>
                    <button onClick={() => onToggleReward(r)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        r.active
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          : 'bg-green-50 hover:bg-green-100 text-green-600'
                      }`}>
                      {r.active ? 'ปิด' : 'เปิด'}
                    </button>
                    <button
                      onClick={() => onDeleteReward(r.id)}
                      disabled={deletingRewardId === r.id}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                      {deletingRewardId === r.id ? '...' : 'ลบ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* reward edit modal */}
      {editingReward && (
        <RewardEditModal
          initial={editingReward.id ? editingReward : null}
          onSave={onSaveReward}
          onClose={() => setEditingReward(null)}
          saving={catalogSaving}
        />
      )}
    </div>
  )
}

// ── Survey Tab Component ────────────────────────────────────

const FEATURE_LABELS = {
  assessment: '📋 ประเมินสุขภาพ',
  bmi:        '⚖️ คำนวณ BMI',
  nubcal:     '🔥 บันทึกแคลอรี่',
  analytics:  '📊 กราฟสุขภาพ',
  ai:         '🤖 คำแนะนำ AI',
  rewards:    '🏆 แต้มสะสม',
  knowledge:  '📚 ใบความรู้',
  activity:   '📸 ส่งภาพกิจกรรม',
}

const RATING_KEYS = [
  { key: 'overall',    label: 'ภาพรวม' },
  { key: 'easeOfUse',  label: 'ใช้งานง่าย' },
  { key: 'design',     label: 'ดีไซน์' },
  { key: 'usefulness', label: 'ประโยชน์' },
]

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= value ? '#facc15' : '#e2e8f0'}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="text-xs font-bold text-slate-700 ml-1">{value}</span>
    </div>
  )
}

// ── Local Mode Banner ─────────────────────────────────────────

function LocalModeBanner() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-base">💾</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-indigo-800 text-sm">โหมดเก็บข้อมูลในเครื่อง</p>
          <p className="text-indigo-600 text-xs">ข้อมูลผู้ใช้ถูกเก็บใน localStorage — ใช้งานได้ปกติในอุปกรณ์นี้</p>
        </div>
        <button onClick={() => setExpanded(p => !p)} className="text-indigo-500 hover:text-indigo-700 flex-shrink-0 text-xs underline">
          {expanded ? 'ซ่อน' : 'อัปเกรด →'}
        </button>
      </div>
      {expanded && <FirebaseSetupGuide compact />}
    </div>
  )
}

// ── Firebase Setup Guide ──────────────────────────────────────

function FirebaseSetupGuide({ compact } = {}) {
  return (
    <div className={compact ? 'bg-amber-50 border-t border-amber-200' : 'bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden mb-4'}>
      <div className="flex items-center gap-3 px-5 py-4 bg-amber-100 border-b border-amber-200">
        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-amber-800 text-sm">Firebase ยังไม่ได้ตั้งค่า</p>
          <p className="text-amber-600 text-xs">ระบบฐานข้อมูล Firestore ยังไม่พร้อมใช้งาน</p>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-sm font-semibold text-amber-800">วิธีตั้งค่า Firebase (ทำครั้งเดียว)</p>
        <ol className="space-y-2 text-sm text-amber-700">
          {[
            <>ไปที่ <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs">console.firebase.google.com</span> แล้วสร้าง project ใหม่</>,
            <>เข้า project → <strong>Project Settings</strong> → แท็บ <strong>Your apps</strong> → กดไอคอน <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs">&lt;/&gt;</span></>,
            <>ลงทะเบียน Web app แล้วคัดลอก <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs">firebaseConfig</span></>,
            <>เปิด <strong>Build → Firestore Database → Create database</strong> (เลือก Test mode)</>,
            <>แก้ไขไฟล์ <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs">src/config/firebase.js</span> ใส่ค่า config ที่ copy มา</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors mt-2"
        >
          <ExternalLink size={14} /> เปิด Firebase Console
        </a>
      </div>
    </div>
  )
}

// ── Announcement Components ───────────────────────────────────

const ANN_TYPE_CONFIG = {
  info:    { label: 'ข้อมูลทั่วไป', color: 'blue',   bg: 'bg-indigo-50',   text: 'text-indigo-700',   border: 'border-indigo-200',   dot: 'bg-indigo-400' },
  warning: { label: 'คำเตือน',      color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  success: { label: 'ข่าวดี',       color: 'green',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-400' },
  danger:  { label: 'เร่งด่วน',     color: 'red',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400' },
}

const BLANK_ANN = { id: '', emoji: '📢', title: '', body: '', type: 'info', active: true, scheduledAt: '', pushSent: false }

function AnnouncementEditModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || BLANK_ANN)
  const isNew = !initial?.id
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{isNew ? 'เพิ่มประกาศใหม่' : 'แก้ไขประกาศ'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-20">
              <label className="text-xs text-slate-500 mb-1 block">Emoji</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-2xl text-center focus:outline-none focus:border-indigo-400"
                value={form.emoji} maxLength={4}
                onChange={e => set('emoji', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">หัวข้อ <span className="text-red-400">*</span></label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                value={form.title} placeholder="เช่น ประกาศสำคัญ"
                onChange={e => set('title', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">เนื้อหา</label>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"
              value={form.body} placeholder="รายละเอียดประกาศ..."
              onChange={e => set('body', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block">ประเภท</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ANN_TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('type', key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all flex items-center gap-1.5 ${
                    form.type === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={11} /> กำหนดเวลาส่ง Push อัตโนมัติ</label>
            <input
              type="datetime-local"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
              value={form.scheduledAt || ''}
              onChange={e => set('scheduledAt', e.target.value)}
            />
            {form.scheduledAt && (
              <p className="text-xs text-indigo-600 mt-1">⚡ จะส่ง Push ให้ผู้ใช้ทุกคนอัตโนมัติตามเวลาที่กำหนด</p>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.active ? 'bg-indigo-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-6' : 'left-1'}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">{form.active ? 'แสดงประกาศ' : 'ซ่อนประกาศ'}</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} disabled={saving}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50">
              ยกเลิก
            </button>
            <button
              onClick={() => { if (form.title.trim()) onSave(form) }}
              disabled={saving || !form.title.trim()}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> บันทึก...</>
                : <><Check size={15} /> บันทึก</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const times = [0, 0.15, 0.3, 0.8, 0.95, 1.1]
    times.forEach(delay => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay)
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + delay + 0.15)
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.6)
    })
  } catch (_) {}
}

function AnnouncementTab({ announcements, loading, editingAnn, setEditingAnn, onSave, onDelete, onToggle, deletingId, saving, onSendPush, pushSending, pushResult }) {
  const activeCount = announcements.filter(a => a.active).length
  const fcmIsReady = fcmReady
  const [testResult, setTestResult] = useState(null)

  function testSound() {
    playDing()
    setTestResult('sound')
    setTimeout(() => setTestResult(null), 3000)
  }

  function testToast() {
    playDing()
    setTestResult('toast')
    setTimeout(() => setTestResult(null), 4000)
  }

  async function testBrowserNotif() {
    if (!('Notification' in window)) { setTestResult('unsupported'); return }
    if (Notification.permission === 'default') await Notification.requestPermission()
    if (Notification.permission === 'granted') {
      new Notification('🎉 ทดสอบแจ้งเตือน', { body: 'ระบบแจ้งเตือนทำงานปกติ ✅', icon: '/icons/icon-192.png' })
      setTestResult('notif')
    } else {
      setTestResult('denied')
    }
    setTimeout(() => setTestResult(null), 4000)
  }

  // auto-send when scheduled time arrives
  useEffect(() => {
    if (!fcmIsReady) return
    async function checkScheduled() {
      const now = new Date()
      const due = announcements.filter(a => a.scheduledAt && !a.pushSent && new Date(a.scheduledAt) <= now)
      for (const ann of due) {
        await onSendPush(ann)
        await onSave({ ...ann, pushSent: true })
      }
    }
    checkScheduled()
    const interval = setInterval(checkScheduled, 60000)
    return () => clearInterval(interval)
  }, [announcements, fcmIsReady, onSendPush, onSave])

  return (
    <div className="space-y-4">

      {/* ── Notification test card ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
          <span>🔔</span>
          <span className="font-semibold text-slate-800 text-sm">ทดสอบระบบแจ้งเตือน</span>
          <span className="ml-auto text-xs text-slate-400">
            สิทธิ์: {!('Notification' in window) ? 'ไม่รองรับ' : Notification.permission === 'granted' ? '✅ เปิดอยู่' : Notification.permission === 'denied' ? '❌ ถูกปิด' : '⏳ ยังไม่ได้ขอ'}
          </span>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2">
          <button onClick={testSound}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs transition-all active:scale-95">
            🔊 ทดสอบเสียง
          </button>
          <button onClick={testToast}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-700 font-semibold text-xs transition-all active:scale-95">
            💬 ทดสอบ Toast
          </button>
          <button onClick={testBrowserNotif}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-semibold text-xs transition-all active:scale-95">
            📳 ทดสอบ Notification
          </button>
        </div>
        {testResult && (
          <div className="mx-4 mb-3 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              backgroundColor: testResult === 'denied' ? '#fef2f2' : '#f0fdf4',
              color: testResult === 'denied' ? '#dc2626' : '#16a34a',
            }}>
            {testResult === 'sound'       && '🔊 เสียงทำงานปกติ ✅'}
            {testResult === 'toast'       && '💬 ครบเวลาอดอาหารแล้ว! ถึงเวลากินอาหารได้เลย 🍽️ ✅'}
            {testResult === 'notif'       && '📳 ส่ง Browser Notification แล้ว ✅'}
            {testResult === 'denied'      && '❌ การแจ้งเตือนถูกปิด — ไปเปิดใน Settings ของ browser'}
            {testResult === 'unsupported' && '❌ Browser นี้ไม่รองรับ Notification'}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">ประกาศทั้งหมด</p>
          <p className="text-xs text-slate-400">กำลังแสดง {activeCount} รายการ</p>
        </div>
        <button
          onClick={() => setEditingAnn({ ...BLANK_ANN })}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          + เพิ่มประกาศ
        </button>
      </div>

      {!fcmIsReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700">
          <p className="font-bold mb-1">⚙️ ยังไม่ได้ตั้งค่า Push Notification</p>
          <p>กรุณาใส่ <span className="font-mono bg-amber-100 px-1 rounded">VAPID_KEY</span> และ <span className="font-mono bg-amber-100 px-1 rounded">FCM_SERVER_KEY</span> ใน <span className="font-mono bg-amber-100 px-1 rounded">src/services/fcm.js</span></p>
        </div>
      )}

      {pushResult && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${pushResult.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {pushResult.error
            ? <><AlertTriangle size={15} /> {pushResult.error}</>
            : <><Check size={15} /> ส่งสำเร็จ {pushResult.sent}/{pushResult.total} อุปกรณ์ {pushResult.errors > 0 ? `(ล้มเหลว ${pushResult.errors})` : ''}</>
          }
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-5xl block mb-3">📢</span>
          <p className="text-sm">ยังไม่มีประกาศ — กดเพิ่มด้านบน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => {
            const cfg = ANN_TYPE_CONFIG[ann.type] || ANN_TYPE_CONFIG.info
            return (
              <div key={ann.id} className={`rounded-2xl border-2 overflow-hidden ${ann.active ? `${cfg.bg} ${cfg.border}` : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="flex items-start gap-3 p-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{ann.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className={`font-bold text-sm ${ann.active ? cfg.text : 'text-slate-600'}`}>{ann.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{cfg.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ann.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {ann.active ? 'แสดงอยู่' : 'ซ่อน'}
                      </span>
                    </div>
                    {ann.body && <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>}
                    {ann.scheduledAt && (
                      <p className="text-[10px] mt-1 flex items-center gap-1">
                        {ann.pushSent
                          ? <span className="text-green-600 font-semibold">✅ ส่ง Push แล้ว</span>
                          : <><Clock size={9} className="text-indigo-500" /><span className="text-indigo-600">จะส่ง Push: {formatDate(ann.scheduledAt)}</span></>
                        }
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(ann.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-1 px-4 pb-3 flex-wrap">
                  <button onClick={() => setEditingAnn({ ...ann })}
                    className="px-3 py-1.5 bg-white/80 hover:bg-white text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors">
                    แก้ไข
                  </button>
                  <button onClick={() => onToggle(ann)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      ann.active
                        ? 'bg-white/80 hover:bg-white text-slate-500 border-slate-200'
                        : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
                    }`}>
                    {ann.active ? 'ซ่อน' : 'แสดง'}
                  </button>
                  {fcmIsReady && (
                    <button
                      onClick={() => onSendPush(ann)}
                      disabled={pushSending === ann.id}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                      {pushSending === ann.id
                        ? <><span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /> ส่ง...</>
                        : '🔔 ส่ง Push'}
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(ann.id)}
                    disabled={deletingId === ann.id}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold border border-red-100 transition-colors disabled:opacity-40 ml-auto">
                    {deletingId === ann.id ? '...' : 'ลบ'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editingAnn && (
        <AnnouncementEditModal
          initial={editingAnn.id ? editingAnn : null}
          onSave={onSave}
          onClose={() => setEditingAnn(null)}
          saving={saving}
        />
      )}
    </div>
  )
}

function SurveyTab({ surveys, loading, onDelete, deletingId }) {
  const [expandedId, setExpandedId] = useState(null)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (surveys.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <span className="text-5xl block mb-3">📋</span>
        <p className="text-sm">ยังไม่มีผลการประเมิน</p>
      </div>
    )
  }

  // คำนวณค่าเฉลี่ย
  const avg = (key) => {
    const vals = surveys.map(s => s.ratings?.[key] ?? 0).filter(Boolean)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-'
  }

  // นับฟีเจอร์ยอดนิยม
  const featureCount = {}
  surveys.forEach(s => (s.favorites || []).forEach(f => { featureCount[f] = (featureCount[f] || 0) + 1 }))
  const topFeatures = Object.entries(featureCount).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2">
          <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">คะแนนเฉลี่ย ({surveys.length} คน)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {RATING_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                <span className="text-sm text-slate-600">{label}</span>
                <StarDisplay value={Math.round(parseFloat(avg(key)) || 0)} />
              </div>
            ))}
          </div>
        </div>
        {topFeatures.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2">
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">ฟีเจอร์ยอดนิยม</p>
            <div className="space-y-2">
              {topFeatures.map(([feat, count]) => (
                <div key={feat} className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 flex-1">{FEATURE_LABELS[feat] || feat}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 bg-indigo-400 rounded-full" style={{ width: `${Math.round((count / surveys.length) * 80)}px`, minWidth: '8px' }} />
                    <span className="text-xs font-bold text-slate-500">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-slate-700 text-sm">รายการทั้งหมด</p>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">{surveys.length} รายการ</span>
        </div>
        <div className="divide-y divide-slate-100">
          {surveys.map(s => {
            const isOpen = expandedId === s.id
            const avgScore = s.ratings
              ? (Object.values(s.ratings).reduce((a, b) => a + b, 0) / 4).toFixed(1)
              : '-'
            return (
              <div key={s.id}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                    {s.userRole === 'นักเรียน' ? '🎒' : s.userRole === 'ครู' ? '👩‍🏫' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {s.userName || 'ไม่ระบุชื่อ'}
                      {s.gradeLevel && <span className="text-slate-400 font-normal"> — {s.gradeLevel}</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(s.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#facc15">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      <span className="text-sm font-bold text-slate-700">{avgScore}</span>
                    </div>
                    {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 bg-slate-50 space-y-3">
                    {/* ratings */}
                    <div className="bg-white rounded-xl p-3 space-y-2">
                      {RATING_KEYS.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{label}</span>
                          <StarDisplay value={s.ratings?.[key] ?? 0} />
                        </div>
                      ))}
                    </div>
                    {/* favorites */}
                    {s.favorites?.length > 0 && (
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-2">ฟีเจอร์ที่ชอบ</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.favorites.map(f => (
                            <span key={f} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                              {FEATURE_LABELS[f] || f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* suggestion */}
                    {s.suggestion && (
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">อยากให้ปรับปรุง</p>
                        <p className="text-sm text-slate-700">{s.suggestion}</p>
                      </div>
                    )}
                    {/* comment */}
                    {s.comment && (
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">ความคิดเห็น</p>
                        <p className="text-sm text-slate-700">{s.comment}</p>
                      </div>
                    )}
                    {/* delete */}
                    <button
                      onClick={() => onDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40 border border-red-100"
                    >
                      {deletingId === s.id
                        ? <><span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> กำลังลบ...</>
                        : <><Trash2 size={13} /> ลบการประเมินนี้</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
