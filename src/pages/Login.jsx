import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, UserPlus } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

export default function Login() {
  const { loginByName, setShowRegister } = useHealth()
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
      style={{ background: '#0a1535' }}>

      {/* ── พื้นหลัง diagonal ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* แถบขาวทแยงกลาง */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.97) 28%, rgba(255,255,255,0.97) 72%, transparent 72%)',
          }} />

        {/* แถบเหลืองบน */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 22%, #f5c800 22%, #f5c800 27%, transparent 27%)',
            mixBlendMode: 'normal',
          }} />

        {/* แถบเหลืองล่าง */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 73%, #f5c800 73%, #f5c800 78%, transparent 78%)',
          }} />

        {/* แถบน้ำเงินซ้าย */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 18%, #1a3a8f 18%, #1a3a8f 22%, transparent 22%)',
          }} />

        {/* แถบน้ำเงินขวา */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 78%, #1a3a8f 78%, #1a3a8f 82%, transparent 82%)',
          }} />
      </div>

      {/* ⚡ สายฟ้าตกแต่ง */}
      <span className="absolute top-12 left-[18%] text-5xl opacity-90 pointer-events-none select-none"
        style={{ color: '#f5c800', filter: 'drop-shadow(0 0 8px #f5c800)' }}>⚡</span>
      <span className="absolute top-8 left-[30%] text-3xl opacity-70 pointer-events-none select-none"
        style={{ color: '#4f46e5', filter: 'drop-shadow(0 0 6px #6366f1)' }}>⚡</span>
      <span className="absolute bottom-16 right-[18%] text-5xl opacity-90 pointer-events-none select-none"
        style={{ color: '#f5c800', filter: 'drop-shadow(0 0 8px #f5c800)' }}>⚡</span>
      <span className="absolute top-20 right-[26%] text-3xl opacity-70 pointer-events-none select-none"
        style={{ color: '#4f46e5', filter: 'drop-shadow(0 0 6px #6366f1)' }}>⚡</span>
      <span className="absolute bottom-24 left-[22%] text-2xl opacity-60 pointer-events-none select-none"
        style={{ color: '#4f46e5' }}>⚡</span>
      <span className="absolute top-32 right-[16%] text-2xl opacity-60 pointer-events-none select-none"
        style={{ color: '#4f46e5' }}>⚡</span>

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
        </div>
      </div>
    </div>
  )
}
