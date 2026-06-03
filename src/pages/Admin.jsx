import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Eye, EyeOff, Users, LogOut, User, Calendar, Hash, ChevronDown, ChevronUp, ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchCloudUsers } from '../services/userSync'

const ADMIN_PASSWORD = '2569'

const GENDER_STYLE = {
  'ชาย':    { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '♂' },
  'หญิง':   { bg: 'bg-pink-100',   text: 'text-pink-700',   emoji: '♀' },
  'LGBTQ+': { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🏳️‍🌈' },
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Admin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [shake, setShake] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [cloudUsers, setCloudUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const users = await fetchCloudUsers()
      setCloudUsers(users)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) loadUsers()
  }, [authenticated, loadUsers])

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setLoginError(false)
    } else {
      setLoginError(true)
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 600)
    }
  }

  function handleLogout() {
    setAuthenticated(false)
    setPassword('')
    setLoginError(false)
    navigate('/')
  }

  // ── LOGIN SCREEN ──
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
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(false) }}
                placeholder="รหัสผ่าน"
                className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-colors ${
                  loginError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-white/20 focus:ring-blue-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {loginError && (
              <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1.5">
                <Shield size={14} /> รหัสผ่านไม่ถูกต้อง
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition-colors active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-1.5 text-white/40 hover:text-white/70 text-sm mt-4 transition-colors"
          >
            <ArrowLeft size={14} /> กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  // ── ADMIN DASHBOARD ──
  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">ระบบหลังบ้าน</p>
            <p className="text-slate-400 text-xs">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft size={16} /> หน้าหลัก
          </button>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-300 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> รีเฟรช
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* loading / error */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">กำลังโหลดข้อมูลจาก cloud...</span>
          </div>
        )}

        {fetchError && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-4 text-red-600 text-sm flex items-center gap-2">
            ไม่สามารถเชื่อมต่อ cloud ได้ กรุณาลองอีกครั้ง
            <button onClick={loadUsers} className="ml-auto underline text-red-500 hover:text-red-700">ลองใหม่</button>
          </div>
        )}

        {!loading && !fetchError && (() => {
          const total = cloudUsers.length
          const avgAge = total > 0
            ? Math.round(cloudUsers.reduce((s, u) => s + (u.age || 0), 0) / total)
            : null
          const male   = cloudUsers.filter(u => u.gender === 'ชาย').length
          const female = cloudUsers.filter(u => u.gender === 'หญิง').length
          const lgbt   = cloudUsers.filter(u => u.gender === 'LGBTQ+').length

          return (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{total}</p>
                      <p className="text-slate-500 text-xs">ผู้ใช้ทั้งหมด (ทุกอุปกรณ์)</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{avgAge ?? '-'}</p>
                      <p className="text-slate-500 text-xs">อายุเฉลี่ย (ปี)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* gender breakdown */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-2xl">♂</span>
                  <p className="text-xl font-bold text-blue-700">{male}</p>
                  <p className="text-blue-500 text-xs">ชาย</p>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-2xl">♀</span>
                  <p className="text-xl font-bold text-pink-700">{female}</p>
                  <p className="text-pink-500 text-xs">หญิง</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-2xl">🏳️‍🌈</span>
                  <p className="text-xl font-bold text-purple-700">{lgbt}</p>
                  <p className="text-purple-500 text-xs">LGBTQ+</p>
                </div>
              </div>

              {/* user list */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Users size={18} className="text-slate-500" />
                  <h2 className="font-bold text-slate-700">รายชื่อผู้ใช้งาน</h2>
                  <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {total} คน
                  </span>
                </div>

                {total === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">ยังไม่มีผู้ลงทะเบียน</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cloudUsers.map((u, i) => (
                      <div key={u.id}>
                        <button
                          onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                          className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                            <User size={20} className="text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{u.firstName} {u.lastName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-slate-500 text-xs">อายุ {u.age} ปี</span>
                              {u.gender && GENDER_STYLE[u.gender] && (
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${GENDER_STYLE[u.gender].bg} ${GENDER_STYLE[u.gender].text}`}>
                                  {GENDER_STYLE[u.gender].emoji} {u.gender}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-400">#{i + 1}</span>
                            {expandedId === u.id
                              ? <ChevronUp size={16} className="text-slate-400" />
                              : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </button>

                        {expandedId === u.id && (
                          <div className="px-5 pb-5 bg-slate-50">
                            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
                              <div className="flex items-start gap-2">
                                <User size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-slate-400">ชื่อ-นามสกุล</p>
                                  <p className="text-sm font-semibold text-slate-800">{u.firstName} {u.lastName}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Hash size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-slate-400">อายุ</p>
                                  <p className="text-sm font-semibold text-slate-800">{u.age} ปี</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5 flex-shrink-0 text-sm leading-none">⚥</span>
                                <div>
                                  <p className="text-xs text-slate-400">เพศ</p>
                                  {u.gender && GENDER_STYLE[u.gender] ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${GENDER_STYLE[u.gender].bg} ${GENDER_STYLE[u.gender].text}`}>
                                      {GENDER_STYLE[u.gender].emoji} {u.gender}
                                    </span>
                                  ) : (
                                    <p className="text-sm font-semibold text-slate-800">-</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-slate-400">ลงทะเบียนเมื่อ</p>
                                  <p className="text-sm font-semibold text-slate-800">{formatDate(u.registeredAt)}</p>
                                </div>
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
          )
        })()}
      </div>
    </div>
  )
}
