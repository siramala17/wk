import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Eye, EyeOff, Users, LogOut, User, Calendar, Hash, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Check, X, Trash2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchCloudUsers, fetchSubmissions, updateSubmissionStatus, deleteCloudUser, deleteUserSubmissions } from '../services/userSync'
import { useHealth } from '../context/HealthContext'

const ADMIN_PASSWORD = '2569'

const GENDER_STYLE = {
  'ชาย':    { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '♂' },
  'หญิง':   { bg: 'bg-pink-100',   text: 'text-pink-700',   emoji: '♀' },
  'LGBTQ+': { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🏳️‍🌈' },
}

const CATEGORIES = {
  exercise: { label: 'ออกกำลังกาย',     emoji: '🏃' },
  food:     { label: 'อาหารสุขภาพ',      emoji: '🥗' },
  water:    { label: 'ดื่มน้ำเพียงพอ',   emoji: '💧' },
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

export default function Admin() {
  const navigate = useNavigate()
  const { deleteUser: deleteLocalUser } = useHealth()

  // auth
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [shake, setShake] = useState(false)

  // users tab
  const [expandedId, setExpandedId] = useState(null)
  const [cloudUsers, setCloudUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  // submissions tab
  const [submissions, setSubmissions] = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [noteInputs, setNoteInputs] = useState({})
  const [reviewingId, setReviewingId] = useState(null)
  const [expandedSub, setExpandedSub] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // delete user
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')

  // tab
  const [adminTab, setAdminTab] = useState('users')

  const loadUsers = useCallback(async () => {
    setLoading(true); setFetchError(false)
    try { setCloudUsers(await fetchCloudUsers()) }
    catch { setFetchError(true) }
    finally { setLoading(false) }
  }, [])

  const loadSubmissions = useCallback(async () => {
    setSubLoading(true)
    try { setSubmissions((await fetchSubmissions()).reverse()) }
    catch { /* silent */ }
    finally { setSubLoading(false) }
  }, [])

  useEffect(() => {
    if (authenticated) { loadUsers(); loadSubmissions() }
  }, [authenticated, loadUsers, loadSubmissions])

  async function handleReview(id, status) {
    setReviewingId(id)
    try { await updateSubmissionStatus(id, status, noteInputs[id] || ''); await loadSubmissions() }
    catch { /* silent */ }
    finally { setReviewingId(null) }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className={`w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl ${shake ? 'animate-bounce' : ''}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-blue-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">ระบบหลังบ้าน</h1>
            <p className="text-blue-300 text-sm mt-1">Admin Panel — กรุณาใส่รหัสผ่าน</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(false) }}
                placeholder="รหัสผ่าน"
                className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${loginError ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-blue-400'}`}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1.5"><Shield size={14} /> รหัสผ่านไม่ถูกต้อง</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition-colors active:scale-[0.98]">
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
  const pendingCount = submissions.filter(s => s.status === 'pending').length

  const filteredSubs = filterStatus === 'all' ? submissions : submissions.filter(s => s.status === filterStatus)

  return (
    <div className="min-h-screen bg-slate-100">

      {/* top bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><Shield size={18} /></div>
          <div>
            <p className="font-bold text-sm leading-tight">ระบบหลังบ้าน</p>
            <p className="text-slate-400 text-xs">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            <ArrowLeft size={16} /> หน้าหลัก
          </button>
          <button onClick={() => { loadUsers(); loadSubmissions() }} disabled={loading || subLoading}
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-300 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40">
            <RefreshCw size={16} className={(loading || subLoading) ? 'animate-spin' : ''} /> รีเฟรช
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* success banner */}
        {deleteSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
            <Check size={16} className="flex-shrink-0" /> {deleteSuccess}
          </div>
        )}

        {/* tab selector */}
        <div className="flex bg-white rounded-2xl p-1 mb-5 shadow-sm gap-1">
          <button onClick={() => setAdminTab('users')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${adminTab === 'users' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
            👥 ผู้ใช้งาน
          </button>
          <button onClick={() => setAdminTab('submissions')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${adminTab === 'submissions' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
            📸 ตรวจสอบภาพ
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        </div>

        {/* ══ TAB: ผู้ใช้งาน ══ */}
        {adminTab === 'users' && (
          <>
            {loading && (
              <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">กำลังโหลดข้อมูลจาก cloud...</span>
              </div>
            )}
            {fetchError && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-4 text-red-600 text-sm flex items-center gap-2">
                ไม่สามารถเชื่อมต่อ cloud ได้
                <button onClick={loadUsers} className="ml-auto underline hover:text-red-700">ลองใหม่</button>
              </div>
            )}
            {!loading && !fetchError && (
              <>
                {/* summary */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={20} className="text-blue-600" /></div>
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
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center gap-1"><span className="text-2xl">♂</span><p className="text-xl font-bold text-blue-700">{male}</p><p className="text-blue-500 text-xs">ชาย</p></div>
                  <div className="bg-pink-50 rounded-2xl p-4 flex flex-col items-center gap-1"><span className="text-2xl">♀</span><p className="text-xl font-bold text-pink-700">{female}</p><p className="text-pink-500 text-xs">หญิง</p></div>
                  <div className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center gap-1"><span className="text-2xl">🏳️‍🌈</span><p className="text-xl font-bold text-purple-700">{lgbt}</p><p className="text-purple-500 text-xs">LGBTQ+</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-sky-50 rounded-2xl p-4 flex flex-col items-center gap-1"><span className="text-2xl">🎒</span><p className="text-xl font-bold text-sky-700">{students}</p><p className="text-sky-500 text-xs">นักเรียน</p></div>
                  <div className="bg-emerald-50 rounded-2xl p-4 flex flex-col items-center gap-1"><span className="text-2xl">👩‍🏫</span><p className="text-xl font-bold text-emerald-700">{teachers}</p><p className="text-emerald-500 text-xs">ครู</p></div>
                  <div className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center gap-1"><span className="text-2xl">👤</span><p className="text-xl font-bold text-slate-700">{general}</p><p className="text-slate-500 text-xs">ทั่วไป</p></div>
                </div>

                {/* user list */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Users size={18} className="text-slate-500" />
                    <h2 className="font-bold text-slate-700">รายชื่อผู้ใช้งาน</h2>
                    <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{total} คน</span>
                  </div>
                  {total === 0 ? (
                    <div className="py-16 text-center text-slate-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">ยังไม่มีผู้ลงทะเบียน</p></div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {cloudUsers.map((u, i) => (
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
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
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
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
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

      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
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
