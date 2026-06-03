import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Scale, BarChart2, Lightbulb, Award, UserCircle } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'หลัก' },
  { to: '/assessment', icon: ClipboardList, label: 'ประเมิน' },
  { to: '/bmi', icon: Scale, label: 'BMI' },
  { to: '/analytics', icon: BarChart2, label: 'กราฟ' },
  { to: '/rewards', icon: Award, label: 'แต้ม' },
  { to: '/profile', icon: UserCircle, label: 'บัญชี' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-blue-100 shadow-lg">
      <div className="grid grid-cols-6 h-16">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${active ? 'bg-blue-100' : ''}`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
