import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Flame, Award } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useLang()

  const tabs = [
    { to: '/',           icon: Home,         labelKey: 'home',            activeGrad: ['#3730a3','#6366f1'], glow: 'rgba(99,102,241,0.50)' },
    { to: '/assessment', icon: ClipboardList, labelKey: 'assessment',      activeGrad: ['#4338ca','#818cf8'], glow: 'rgba(96,165,250,0.50)' },
    { to: '/nubcal',     icon: Flame,         labelKey: 'personalTrainer', activeGrad: ['#c2410c','#f97316'], glow: 'rgba(249,115,22,0.50)' },
    { to: '/rewards',    icon: Award,         labelKey: 'points',          activeGrad: ['#b45309','#fbbf24'], glow: 'rgba(251,191,36,0.50)' },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 nav-float pb-safe"
      style={{
        borderRadius: '1.25rem',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255,255,255,0.70)',
      }}
    >
      <div className="grid grid-cols-4 h-[62px] px-1">
        {tabs.map(({ to, icon: Icon, labelKey, activeGrad, glow }) => {
          const active = pathname === to
          const label = t.nav[labelKey]
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
            >
              <div
                className="flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200"
                style={active ? {
                  background: `linear-gradient(135deg, ${activeGrad[0]}, ${activeGrad[1]})`,
                  boxShadow: `0 4px 14px ${glow}`,
                } : {}}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-white' : 'text-slate-400'}
                />
              </div>
              <span
                className="text-[8px] font-bold transition-all text-center leading-tight whitespace-pre-line"
                style={active ? {
                  background: `linear-gradient(135deg, ${activeGrad[0]}, ${activeGrad[1]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : { color: '#94a3b8' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
