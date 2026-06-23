import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, TrendingUp, Award, Flame, Scale, LogOut, Shield, UserCircle, Star, LayoutDashboard } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useHealth()
  const { t } = useLang()

  const links = [
    { to: '/',           icon: Home,         labelKey: 'mainPage' },
    { to: '/assessment', icon: ClipboardList, labelKey: 'assessBmi' },
    { to: '/analytics',  icon: TrendingUp,    labelKey: 'graphAi' },
    { to: '/rewards',    icon: Award,         labelKey: 'pointsActivity' },
    { to: '/nubcal',           icon: Flame,           labelKey: 'trainer' },
    { to: '/body-composition', icon: Scale,           labelKey: 'bodyCompositionFull' },
    { to: '/school-dashboard', icon: LayoutDashboard, labelKey: 'schoolDash' },
  ]

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 bottom-0 w-52 bg-white border-r border-gray-100 z-40"
      style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
    >
      {/* Profile */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link to="/profile" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
            {user.faceImage
              ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
              : <UserCircle size={18} className="text-gray-400" />
            }
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {user.firstName || user.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-400">{user.points} {t.nav.points}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2">
        {links.map(({ to, icon: Icon, labelKey }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} className={active ? 'text-indigo-600' : 'text-gray-400'} />
              {t.nav[labelKey]}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-gray-100">
        <Link
          to="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors mb-0.5"
        >
          <Shield size={15} className="text-gray-300" />
          {t.nav.adminPanel}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={15} />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  )
}
