import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Eye, EyeOff, Users, LogOut, User, Calendar, Hash, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Check, X, Trash2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchCloudUsers, fetchSubmissions, updateSubmissionStatus, deleteCloudUser, deleteUserSubmissions, fetchSurveys, deleteSurvey, fetchRedemptions, updateRedemptionStatus, fetchRewardCatalog, addReward, updateReward, deleteReward } from '../services/userSync'
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

  useEffect(() => {
    if (authenticated) { loadUsers(); loadSubmissions(); loadSurveys(); loadRedemptions(); loadCatalog() }
  }, [authenticated, loadUsers, loadSubmissions, loadSurveys, loadRedemptions, loadCatalog])

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
          <button onClick={() => { loadUsers(); loadSubmissions(); loadSurveys(); loadRedemptions() }} disabled={loading || subLoading || surveyLoading || redeemLoading}
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-300 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40">
            <RefreshCw size={16} className={(loading || subLoading || surveyLoading || redeemLoading) ? 'animate-spin' : ''} /> รีเฟรช
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
        <div className="grid grid-cols-4 bg-white rounded-2xl p-1 mb-5 shadow-sm gap-1">
          {[
            { key: 'users',       label: '👥 ผู้ใช้',    badge: null },
            { key: 'submissions', label: '📸 ภาพ',        badge: pendingCount > 0 ? pendingCount : null },
            { key: 'redemptions', label: '🎁 แลกรางวัล',  badge: redemptions.filter(r => r.status === 'pending').length || null },
            { key: 'surveys',     label: '📊 พึงพอใจ',   badge: null },
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
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{isNew ? 'เพิ่มของรางวัลใหม่' : 'แก้ไขของรางวัล'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-20">
              <label className="text-xs text-slate-500 mb-1 block">Emoji</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-2xl text-center focus:outline-none focus:border-blue-400"
                value={form.emoji} maxLength={4}
                onChange={e => set('emoji', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">ชื่อของรางวัล <span className="text-red-400">*</span></label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.name} placeholder="เช่น บัตรกำนัล 50 บาท"
                onChange={e => set('name', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">คำอธิบาย</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.desc} placeholder="รายละเอียดของรางวัล..."
              onChange={e => set('desc', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ราคา (แต้ม) <span className="text-red-400">*</span></label>
            <input
              type="number" min="1"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              value={form.cost}
              onChange={e => set('cost', parseInt(e.target.value) || 0)}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.active ? 'bg-blue-500' : 'bg-slate-300'}`}>
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
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
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
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'รอการอนุมัติ', count: redemptions.filter(r => r.status === 'pending').length,  bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
                  { label: 'อนุมัติแล้ว',  count: redemptions.filter(r => r.status === 'approved').length, bg: 'bg-green-50 border-green-200',   text: 'text-green-700' },
                  { label: 'ไม่อนุมัติ',   count: redemptions.filter(r => r.status === 'rejected').length, bg: 'bg-red-50 border-red-200',       text: 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border rounded-2xl p-3 text-center`}>
                    <p className={`text-2xl font-black ${s.text}`}>{s.count}</p>
                    <p className={`text-xs font-medium ${s.text} opacity-80`}>{s.label}</p>
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
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-colors">
            + เพิ่มของรางวัลใหม่
          </button>

          {catalogLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
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
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors">
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

function SurveyTab({ surveys, loading, onDelete, deletingId }) {
  const [expandedId, setExpandedId] = useState(null)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
          <div className="grid grid-cols-2 gap-3">
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
                    <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${Math.round((count / surveys.length) * 80)}px`, minWidth: '8px' }} />
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
          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{surveys.length} รายการ</span>
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
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
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
                            <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
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
