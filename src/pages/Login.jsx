import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, UserPlus } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

export default function Login() {
  const { loginByName, setShowRegister, setShowResearch } = useHealth()
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!username.trim()) { setError('กรุณากรอกชื่อผู้ใช้'); return }
    if (!pin) { setError('กรุณากรอกรหัสผ่าน'); return }
    setLoading(true)
    const ok = await loginByName(username, pin)
    setLoading(false)
    if (!ok) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-dvh relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: 'url(/bg-login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      {/* overlay เพื่อให้ form อ่านง่าย */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(0,20,80,0.45)' }} />

      {/* ── กล่อง form ── */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className={`bg-white rounded-2xl shadow-2xl px-8 py-8 transition-transform ${shake ? 'animate-bounce' : ''}`}>

          {/* โลโก้ + ชื่อแอป */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black tracking-wide mb-0.5"
              style={{ color: '#0a1535', fontFamily: 'serif' }}>W.K.</h1>
            <p className="text-lg font-bold italic"
              style={{ color: '#0a1535', letterSpacing: '0.02em' }}>SmartTeen Health AI</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* ชื่อผู้ใช้ */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">ชื่อผู้ใช้</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  placeholder="กรอกชื่อ (ชื่อที่ลงทะเบียน)"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-sm placeholder-slate-300"
                />
              </div>
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder="PIN 4 หลัก"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 text-sm placeholder-slate-300"
                />
                <button type="button" onClick={() => setShowPin(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* จดจำฉัน */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
              <span className="text-sm text-slate-500">จดจำฉัน</span>
            </label>

            {/* error */}
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            {/* ปุ่มเข้าสู่ระบบ */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base tracking-wide transition-all active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: '#0a1535' }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> กำลังตรวจสอบ...</>
                : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* สมัครสมาชิก */}
          <div className="text-center mt-5">
            <span className="text-sm text-slate-400">ยังไม่มีบัญชี? </span>
            <button
              onClick={() => setShowRegister(true)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* ลงทะเบียนวิจัย */}
          <div className="mt-3 border-t border-slate-100 pt-3 text-center">
            <button
              onClick={() => setShowResearch(true)}
              className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors font-medium"
            >
              🔬 ลงทะเบียนผู้เข้าร่วมวิจัย
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
