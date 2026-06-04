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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-blue-100 shadow-sm">
      <div className="px-4 h-14 flex items-center justify-between">

        {/* Desktop: App branding | Mobile: user avatar + name */}
        <div className="flex items-center gap-3">
          {/* Mobile: user avatar */}
          <Link to="/profile" className="flex md:hidden items-center gap-2 group">
            <div className="w-9 h-9 rounded-full border-2 border-blue-200 overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:border-blue-400 transition-colors">
              {user.faceImage
                ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
                : <User size={18} className="text-blue-400" />
              }
            </div>
            <div className="leading-tight">
              <p className="text-xs text-slate-400 font-medium">สวัสดี</p>
              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {user.firstName || user.name}
              </p>
            </div>
          </Link>

          {/* Desktop: App logo */}
          <Link to="/" className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-black text-slate-800 text-base tracking-tight">
              W.K. <span className="text-blue-600">Health</span>
            </span>
          </Link>
        </div>

        {/* Right side: points + admin + logout (desktop) / points + admin + hamburger (mobile) */}
        <div className="flex items-center gap-2">
          <Link
            to="/rewards"
            className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1"
          >
            <Star size={14} className="text-yellow-500 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-700">{user.points}</span>
          </Link>

          {/* Admin — always visible */}
          <Link
            to="/admin"
            title="Admin Panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Shield size={18} />
          </Link>

          {/* Logout — desktop only (sidebar handles it too, but keep here for convenience) */}
          <button
            onClick={logout}
            title="ออกจากระบบ"
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
          </button>

          {/* Hamburger — mobile only */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 rounded-lg hover:bg-blue-50">
            {open
              ? <X size={22} className="text-slate-700" />
              : <Menu size={22} className="text-slate-700" />
            }
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-blue-100 px-4 pb-4 pt-2 space-y-1">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/profile' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'
            }`}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {user.faceImage
                ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
                : <User size={14} className="text-blue-400" />
              }
            </div>
            บัญชีของฉัน ({user.firstName || user.name})
          </Link>

          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-blue-50'
              }`}
            >
              {l.label}
            </Link>
          ))}

          <button
            onClick={() => { setOpen(false); logout() }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </div>
      )}
    </header>
  )
}
