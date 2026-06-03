import React, { useState } from 'react'
import { User, ChevronRight, UserPlus, ArrowLeft, Eye, EyeOff, Activity } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

export default function Login() {
  const { registeredUsers, login, setShowRegister } = useHealth()
  const [selected, setSelected] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [shake, setShake] = useState(false)

  function handleLogin() {
    if (pin.length !== 4) return
    const ok = login(selected.id, pin)
    if (!ok) {
      setError(true)
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 500)
    }
  }

  // ── หน้ากรอก PIN ──
  if (selected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 transition-transform ${shake ? 'animate-bounce' : ''}`}>

          {/* avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 bg-blue-100 flex items-center justify-center shadow-md">
              {selected.faceImage
                ? <img src={selected.faceImage} alt="face" className="w-full h-full object-cover" />
                : <User size={40} className="text-blue-400" />}
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-800">{selected.firstName} {selected.lastName}</h2>
            <p className="text-slate-400 text-sm mt-0.5">กรอก PIN เพื่อเข้าสู่ระบบ</p>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
              }`} />
            ))}
          </div>

          {/* hidden input */}
          <div className="relative mb-4">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="● ● ● ●"
              className={`w-full px-4 py-3.5 pr-12 rounded-xl border text-center text-xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 transition-colors ${
                error ? 'border-red-400 bg-red-50 focus:ring-red-400 text-red-600' : 'border-slate-200 focus:ring-blue-400 text-slate-800'
              }`}
            />
            <button type="button" onClick={() => setShowPin(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">PIN ไม่ถูกต้อง กรุณาลองใหม่</p>
          )}

          <button
            onClick={handleLogin}
            disabled={pin.length !== 4}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-3"
          >
            เข้าสู่ระบบ
          </button>

          <button
            onClick={() => { setSelected(null); setPin(''); setError(false) }}
            className="w-full text-slate-400 text-sm hover:text-slate-600 py-1.5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} /> เลือกบัญชีอื่น
          </button>
        </div>
      </div>
    )
  }

  // ── หน้าเลือกบัญชี ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ยินดีต้อนรับกลับ</h1>
          <p className="text-slate-400 text-sm mt-1">เลือกบัญชีของคุณเพื่อเข้าสู่ระบบ</p>
        </div>

        {/* รายชื่อบัญชี */}
        <div className="space-y-2.5 mb-5">
          {registeredUsers.map(u => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left active:scale-[0.98] group"
            >
              <div className="w-13 h-13 w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-100 group-hover:border-blue-300 transition-colors">
                {u.faceImage
                  ? <img src={u.faceImage} alt="face" className="w-full h-full object-cover" />
                  : <User size={22} className="text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{u.firstName} {u.lastName}</p>
                <p className="text-slate-400 text-xs mt-0.5">อายุ {u.age} ปี</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* สมัครบัญชีใหม่ */}
        <button
          onClick={() => setShowRegister(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-500 py-3.5 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-[0.98]"
        >
          <UserPlus size={18} /> สมัครบัญชีใหม่
        </button>
      </div>
    </div>
  )
}
