import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Menu, X, Star, Shield } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const links = [
  { to: '/', label: 'หน้าหลัก' },
  { to: '/assessment', label: 'ประเมินสุขภาพ' },
  { to: '/bmi', label: 'คำนวณ BMI' },
  { to: '/analytics', label: 'กราฟสุขภาพ' },
  { to: '/recommendations', label: 'คำแนะนำ AI' },
  { to: '/rewards', label: 'แต้มสะสม' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user } = useHealth()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-blue-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-blue-700 text-lg hidden sm:block">HealthCheck</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/rewards" className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star size={14} className="text-yellow-500 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-700">{user.points}</span>
          </Link>
          <Link
            to="/admin"
            title="Admin Panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Shield size={18} />
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 rounded-lg hover:bg-blue-50">
            {open ? <X size={22} className="text-slate-700" /> : <Menu size={22} className="text-slate-700" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-blue-100 px-4 pb-4 pt-2 space-y-1">
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
        </div>
      )}
    </header>
  )
}
