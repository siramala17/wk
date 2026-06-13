import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Smartphone, Brain, Dumbbell, Droplets, Zap, ChevronRight, Home, UserCircle } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { getHealthLevel } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import Profile from './Profile'
import { fetchAnnouncements } from '../services/userSync'
import { requestPermissionAndSaveToken, fcmReady } from '../services/fcm'

function getStatConfig(t) {
  return [
    { key: 'sleep',    icon: Moon,       label: t.stats.sleep,    unit: t.units.hrs,       max: 9,  color: '#3b82f6', bg: '#eff6ff', getVal: a => a.sleepHours },
    { key: 'screen',   icon: Smartphone, label: t.stats.screen,   unit: t.units.hrs,       max: 12, color: '#8b5cf6', bg: '#f5f3ff', getVal: a => a.screenHours },
    { key: 'stress',   icon: Brain,      label: t.stats.stress,   unit: t.units.outOf10,   max: 10, color: '#f59e0b', bg: '#fffbeb', getVal: a => a.stressLevel },
    { key: 'exercise', icon: Dumbbell,   label: t.stats.exercise, unit: t.units.daysPerWk, max: 7,  color: '#10b981', bg: '#ecfdf5', getVal: a => a.exerciseDays },
    { key: 'water',    icon: Droplets,   label: t.stats.water,    unit: t.units.glasses,   max: 8,  color: '#06b6d4', bg: '#ecfeff', getVal: a => a.waterGlasses },
  ]
}

function getQuickLinks(t) {
  return [
    { to: '/assessment',      label: t.quick.assessment, grad: ['#1e40af','#3b82f6'], shadow: 'rgba(37,99,235,0.50)' },
    { to: '/assessment',      label: t.quick.bmi,        grad: ['#b45309','#fbbf24'], shadow: 'rgba(245,158,11,0.50)' },
    { to: '/nubcal',          label: t.quick.calories,   grad: ['#c2410c','#fb923c'], shadow: 'rgba(249,115,22,0.50)' },
    { to: '/analytics',       label: t.quick.graph,      grad: ['#0e7490','#22d3ee'], shadow: 'rgba(6,182,212,0.50)'  },
    { to: '/recommendations', label: t.quick.ai,         grad: ['#065f46','#34d399'], shadow: 'rgba(16,185,129,0.50)' },
    { to: '/knowledge',       label: t.quick.knowledge,  grad: ['#4338ca','#a78bfa'], shadow: 'rgba(139,92,246,0.50)' },
  ]
}

const QUICK_EMOJI = ['📋','⚖️','🔥','📊','🤖','📚']

function StatCard({ icon: Icon, label, value, unit, max, color, bg }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div
      className="rounded-2xl p-3.5 flex-shrink-0 w-[135px] relative overflow-hidden"
      style={{ background: 'white', border: `1.5px solid ${color}30`, boxShadow: `0 4px 20px ${color}20` }}
    >
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: color, opacity: 0.08 }} />
      <div className="relative flex items-center justify-between mb-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${bg}, white)`, border: `1.5px solid ${color}25` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-[11px] font-black" style={{ color }}>{value} {unit}</span>
      </div>
      <p className="relative text-[11px] text-slate-500 mb-2 font-semibold">{label}</p>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}90, ${color})`, boxShadow: `0 0 6px ${color}80` }} />
      </div>
      <p className="text-[10px] font-bold mt-1.5 text-right" style={{ color: `${color}cc` }}>{pct}%</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-blue-100 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="font-bold text-blue-600">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

const ANN_STYLE = {
  info:    { bg: 'rgba(239,246,255,0.95)', border: '#bfdbfe', text: '#1e40af', bar: '#3b82f6' },
  warning: { bg: 'rgba(255,251,235,0.95)', border: '#fde68a', text: '#92400e', bar: '#f59e0b' },
  success: { bg: 'rgba(240,253,244,0.95)', border: '#bbf7d0', text: '#14532d', bar: '#22c55e' },
  danger:  { bg: 'rgba(254,242,242,0.95)', border: '#fecaca', text: '#7f1d1d', bar: '#ef4444' },
}

export default function Dashboard() {
  const { latestAssessment, history, bmiData, user } = useHealth()
  const { lang, toggleLang, t } = useLang()
  const [mainTab, setMainTab] = useState('home')
  const [announcements, setAnnouncements] = useState([])
  const [dismissedIds, setDismissedIds] = useState(new Set())
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
      .then(all => setAnnouncements(all.filter(a => a.active)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user?.id || !fcmReady) return
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      requestPermissionAndSaveToken(user.id).catch(() => {})
    }
  }, [user?.id])

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const score = latestAssessment?.overallScore ?? (history.length ? history[history.length - 1].score : null)
  const level = getHealthLevel(score)
  const hasData = score !== null

  const STAT_CONFIG = getStatConfig(t)
  const QUICK = getQuickLinks(t)
  const todayTip = t.tips[new Date().getDay() % t.tips.length]

  return (
    <>
      {/* Tab switcher */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 p-1 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.7)' }}>
          {[
            { key: 'home',    icon: <Home size={15} />,       label: t.dashboard.homeTab },
            { key: 'profile', icon: <UserCircle size={15} />, label: t.dashboard.profileTab },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={mainTab === key ? {
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(37,99,235,0.40)',
              } : { color: '#64748b' }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {mainTab === 'profile' && <Profile />}

      {mainTab === 'home' && (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4 animate-fade-in">

          {/* ── Announcements ── */}
          {announcements.filter(a => !dismissedIds.has(a.id)).map(ann => {
            const s = ANN_STYLE[ann.type] || ANN_STYLE.info
            return (
              <div
                key={ann.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: s.bg, border: `1.5px solid ${s.border}`, boxShadow: `0 2px 12px ${s.border}80` }}
              >
                <div style={{ height: '3px', background: s.bar }} />
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{ann.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: s.text }}>{ann.title}</p>
                    {ann.body && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: s.text, opacity: 0.8 }}>{ann.body}</p>}
                  </div>
                  <button
                    onClick={() => setDismissedIds(prev => new Set([...prev, ann.id]))}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    style={{ color: s.text, opacity: 0.5 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}

          {/* ── PWA Install Banner ── */}
          {installPrompt && !isInstalled && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)', boxShadow: '0 4px 20px rgba(29,78,216,0.4)' }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <img src="/icon.svg" alt="icon" className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">ติดตั้งแอปบนมือถือ</p>
                  <p className="text-blue-200 text-xs">รับแจ้งเตือนได้แม้ปิด browser</p>
                </div>
                <button
                  onClick={async () => {
                    installPrompt.prompt()
                    const { outcome } = await installPrompt.userChoice
                    if (outcome === 'accepted') setIsInstalled(true)
                    setInstallPrompt(null)
                  }}
                  className="flex-shrink-0 px-3 py-1.5 bg-white text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors"
                >
                  ติดตั้ง
                </button>
                <button onClick={() => setInstallPrompt(null)}
                  className="flex-shrink-0 text-blue-300 hover:text-white p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Hero ── */}
          <div
            className="relative rounded-3xl p-5 text-white overflow-hidden"
            style={{
              background: 'linear-gradient(140deg, #0c1b4d 0%, #1e3a8a 35%, #1d4ed8 68%, #2563eb 100%)',
              boxShadow: '0 16px 48px rgba(29,78,216,0.55), 0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
            <div className="absolute -top-14 -right-14 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.35), transparent 65%)' }} />
            <div className="absolute -bottom-10 -left-8 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.25), transparent 65%)' }} />
            <div className="absolute top-3 right-12 w-24 h-24 rounded-full animate-float pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.35), transparent 65%)' }} />

            {hasData ? (
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-blue-200 text-sm mb-0.5 font-medium">{t.dashboard.greet}, {user.firstName || user.name} 👋</p>
                  <h1 className="text-2xl font-black mb-2 leading-tight">
                    {t.dashboard.healthScore}<br/>
                    <span style={{
                      background: 'linear-gradient(90deg, #fde68a, #fbbf24, #fde68a)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'shimmer 2.4s linear infinite',
                    }}>{t.dashboard.healthToday}</span>
                  </h1>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold mb-2"
                    style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
                  >
                    <span>{level.emoji}</span>
                    <span>{level.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-blue-200">
                      🔥 {t.dashboard.streak} {user.streak} {t.dashboard.days}
                    </span>
                    <span className="text-xs font-bold"
                      style={{ color: '#fde68a', textShadow: '0 0 12px rgba(251,191,36,0.6)' }}>
                      ⭐ {user.points} {t.dashboard.pts}
                    </span>
                  </div>
                </div>
                <div className="relative flex-shrink-0 animate-float">
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)', transform: 'scale(1.3)' }} />
                  <ScoreRing score={score} size={112} strokeWidth={9} color="#fbbf24" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{score}</span>
                    <p className="text-[10px] text-blue-200 font-semibold">/ 100</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative text-center py-2">
                <p className="text-blue-200 text-sm mb-1">{t.dashboard.greet}, {user.firstName || user.name} 👋</p>
                <h1 className="text-2xl font-black mb-1">{t.dashboard.noData}</h1>
                <p className="text-blue-200 text-sm mb-4">{t.dashboard.noDataSub}</p>
              </div>
            )}

            <Link
              to="/assessment"
              className="relative mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={{
                background: 'linear-gradient(90deg, #f59e0b 0%, #fef3c7 40%, #f59e0b 60%, #d97706 100%)',
                backgroundSize: '200% auto',
                animation: 'shimmer 2.4s linear infinite',
                color: '#78350f',
                boxShadow: '0 6px 20px rgba(251,191,36,0.55), 0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <Zap size={16} />
              {hasData ? t.dashboard.assessAgain : t.dashboard.startNow}
            </Link>
          </div>

          {/* ── Quick Actions ── */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 px-0.5">{t.dashboard.quickMenu}</p>
            <div className="grid grid-cols-3 gap-3">
              {QUICK.map(({ to, label, grad, shadow }, i) => (
                <Link
                  key={to + i}
                  to={to}
                  className="rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all active:scale-95 hover:scale-[1.03]"
                  style={{ background: `linear-gradient(140deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 8px 24px ${shadow}` }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.30)' }}
                  >
                    {QUICK_EMOJI[i]}
                  </div>
                  <p className="text-[11px] font-black text-white text-center leading-tight whitespace-pre-line drop-shadow">
                    {label}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Stats ── */}
          {latestAssessment && (
            <div>
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{t.dashboard.latestData}</p>
                {bmiData && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
                  >
                    {t.dashboard.bmiLabel} {bmiData.bmi} · {bmiData.category}
                  </span>
                )}
              </div>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                {STAT_CONFIG.map(cfg => (
                  <StatCard
                    key={cfg.key}
                    icon={cfg.icon}
                    label={cfg.label}
                    value={cfg.getVal(latestAssessment)}
                    unit={cfg.unit}
                    max={cfg.max}
                    color={cfg.color}
                    bg={cfg.bg}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Weekly Chart ── */}
          {history.length > 0 && (
            <div
              className="rounded-2xl p-5 overflow-hidden relative"
              style={{ background: 'white', boxShadow: '0 6px 24px rgba(37,99,235,0.12)', border: '1.5px solid rgba(37,99,235,0.12)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #1e40af, #3b82f6, #06b6d4)' }} />
              <div className="flex items-center justify-between mb-4 mt-1">
                <div>
                  <p className="font-black text-slate-800 text-sm">{t.dashboard.weeklyTrend}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.dashboard.trackProgress}</p>
                </div>
                <Link
                  to="/analytics"
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', border: '1.5px solid rgba(37,99,235,0.18)' }}
                >
                  {t.dashboard.seeMore} <ChevronRight size={12} />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="url(#strokeGrad)" strokeWidth={3}
                    fill="url(#scoreGrad)"
                    dot={{ r: 3.5, fill: '#2563eb', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#bfdbfe', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Tip Banner ── */}
          <div
            className="rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0e7490 100%)',
              boxShadow: '0 8px 24px rgba(29,78,216,0.35)',
            }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.25), transparent 70%)' }} />
            <span className="text-2xl flex-shrink-0 relative z-10 animate-float">💡</span>
            <div className="relative z-10">
              <p className="text-sm font-black text-yellow-300">{t.dashboard.tipTitle}</p>
              <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">{todayTip}</p>
            </div>
          </div>

        </div>
      )}
    </>
  )
}
