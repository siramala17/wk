import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home, ClipboardList, Scale, TrendingUp, Lightbulb,
  Award, UserCircle, BookOpen, Camera, LogOut, Star, Shield, Flame,
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const links = [
  { to: '/',               icon: Home,          label: 'หน้าหลัก' },
  { to: '/assessment',     icon: ClipboardList, label: 'ประเมินสุขภาพ' },
  { to: '/bmi',            icon: Scale,         label: 'คำนวณ BMI' },
  { to: '/analytics',      icon: TrendingUp,    label: 'กราฟสุขภาพ' },
  { to: '/recommendations',icon: Lightbulb,     label: 'คำแนะนำ AI' },
  { to: '/rewards',        icon: Award,         label: 'แต้มสะสม' },
  { to: '/knowledge',      icon: BookOpen,      label: 'ใบความรู้' },
  { to: '/nubcal',          icon: Flame,         label: 'nubcal แคลอรี่' },
  { to: '/activity',       icon: Camera,        label: 'ส่งภาพกิจกรรม' },
  { to: '/profile',        icon: UserCircle,    label: 'บัญชีของฉัน' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useHealth()

  return (
    <aside className="hidden md:flex flex-col fixed left-0 bottom-0 w-56 bg-white border-r border-blue-100 z-40 shadow-sm" style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}>

      {/* User profile card */}
      <div className="px-4 py-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <Link to="/profile" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
            {user.faceImage
              ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
              : <UserCircle size={22} className="text-white" />
            }
          </div>
          <div className="overflow-hidden leading-tight">
            <p className="text-blue-200 text-xs">สวัสดี</p>
            <p className="font-bold text-sm truncate group-hover:text-yellow-300 transition-colors">
              {user.firstName || user.name}
            </p>
          </div>
        </Link>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
          <Star size={13} className="text-yellow-300 fill-yellow-300" />
          <span className="text-sm font-bold text-yellow-200">{user.points} แต้ม</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-2 border-t border-blue-50">
        <Link
          to="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors mb-0.5"
        >
          <Shield size={17} /> Admin Panel
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} /> ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
