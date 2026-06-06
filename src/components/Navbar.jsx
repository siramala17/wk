import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Menu, X, Star, Shield, User, LogOut } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const links = [
  { to: '/', label: 'หน้าหลัก' },
  { to: '/assessment', label: 'ประเมินสุขภาพ' },
  { to: '/bmi', label: 'คำนวณ BMI' },
  { to: '/analytics', label: 'กราฟสุขภาพ' },
  { to: '/recommendations', label: 'คำแนะนำ AI' },
  { to: '/rewards', label: 'แต้มสะสม' },
  { to: '/knowledge', label: 'ใบความรู้' },
  { to: '/activity', label: 'ส่งภาพกิจกรรม' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useHealth()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(37,99,235,0.1)',
        boxShadow: '0 1px 24px rgba(37,99,235,0.07)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="px-4 h-14 flex items-center justify-between">

        {/* Mobile: avatar + name */}
        <Link to="/profile" className="flex md:hidden items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all"
            style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}
          >
            {user.faceImage
              ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
              : <User size={18} className="text-blue-400 m-auto mt-1.5" />}
          </div>
          <div className="leading-tight">
            <p className="text-[10px] text-slate-400 font-medium">สวัสดี 👋</p>
            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              {user.firstName || user.name}
            </p>
          </div>
        </Link>

        {/* Desktop: Logo */}
        <Link to="/" className="hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-800 text-base tracking-tight">
            W.K. <span className="text-gradient">Health</span>
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link to="/rewards"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #fef9c3, #fef08a)', color: '#b45309' }}>
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            {user.points}
          </Link>

          <Link to="/admin" title="Admin Panel"
            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Shield size={18} />
          </Link>

          <button onClick={logout} title="ออกจากระบบ"
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
          </button>

          <button onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 rounded-xl hover:bg-blue-50 transition-colors">
            {open ? <X size={22} className="text-slate-700" /> : <Menu size={22} className="text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-3 pb-4 pt-2 space-y-1"
          style={{ borderTop: '1px solid rgba(37,99,235,0.1)' }}>
          <Link to="/profile" onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/profile' ? 'text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
            style={pathname === '/profile' ? { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' } : {}}>
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              {user.faceImage
                ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
                : <User size={14} className="text-blue-400 m-auto mt-1" />}
            </div>
            บัญชีของฉัน ({user.firstName || user.name})
          </Link>

          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === l.to ? 'text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
              style={pathname === l.to ? { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' } : {}}>
              {l.label}
            </Link>
          ))}

          <button onClick={() => { setOpen(false); logout() }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </div>
      )}
    </header>
  )
}
