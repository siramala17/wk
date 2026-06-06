import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Flame, Camera, Award, UserCircle } from 'lucide-react'

const tabs = [
  { to: '/',           icon: Home,         label: 'หลัก' },
  { to: '/assessment', icon: ClipboardList, label: 'ประเมิน' },
  { to: '/nubcal',     icon: Flame,         label: 'แคลอรี่' },
  { to: '/activity',   icon: Camera,        label: 'ส่งภาพ' },
  { to: '/rewards',    icon: Award,         label: 'แต้ม' },
  { to: '/profile',    icon: UserCircle,    label: 'บัญชี' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 nav-float pb-safe"
      style={{
        borderRadius: '1.25rem',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="grid grid-cols-6 h-[60px] px-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
            >
              <div
                className="flex items-center justify-center w-9 h-7 rounded-xl transition-all duration-200"
                style={active ? {
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                } : {}}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-white' : 'text-slate-400'}
                />
              </div>
              <span className={`text-[9px] font-semibold transition-colors ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
