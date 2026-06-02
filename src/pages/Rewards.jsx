import React, { useState } from 'react'
import { Award, Star, Zap, Share2, Flame, Trophy, ChevronRight } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { getUserLevel, getBadges } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'

function PointsCard({ points, level, progress, nextLevel, streak }) {
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl p-5 text-yellow-900 relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-6" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-yellow-800 text-sm font-medium">แต้มสะสม</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">{points}</span>
              <span className="text-sm font-semibold text-yellow-800">แต้ม</span>
            </div>
          </div>
          <div className="relative">
            <ScoreRing score={progress} size={80} strokeWidth={8} color="#92400E" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-lg font-black">Lv.{level}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-yellow-800 mb-1">
            <span>ระดับ {level}</span>
            <span>อีก {nextLevel} แต้ม → ระดับ {level + 1}</span>
          </div>
          <div className="h-2.5 bg-yellow-300/50 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-900/40 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Flame size={16} className="text-red-600" />
          <span className="text-sm font-bold">Streak {streak} วัน</span>
          <span className="text-yellow-800 text-xs">🔥 ต่อเนื่อง!</span>
        </div>
      </div>
    </div>
  )
}

function BadgeGrid({ badges }) {
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" />
        ความสำเร็จ
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {badges.map(b => (
          <div key={b.id}
            className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
              b.earned
                ? 'bg-yellow-50 border-yellow-300 shadow-sm'
                : 'bg-slate-50 border-slate-100 opacity-50'
            }`}
          >
            <span className={`text-2xl mb-1 ${!b.earned ? 'grayscale' : ''}`}>{b.emoji}</span>
            <p className="text-xs font-semibold text-center text-slate-700 leading-tight">{b.name}</p>
            {!b.earned && <p className="text-[10px] text-slate-400 text-center mt-0.5 leading-tight">{b.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function PointHistory() {
  const history = [
    { action: 'ประเมินสุขภาพ', points: '+25', date: 'วันนี้', emoji: '📋' },
    { action: 'วัดค่า BMI', points: '+15', date: 'เมื่อวาน', emoji: '📏' },
    { action: 'ประเมินสุขภาพ', points: '+20', date: '2 วันก่อน', emoji: '📋' },
    { action: 'ทำครบ 3 วันติดต่อ', points: '+30', date: '3 วันก่อน', emoji: '🔥' },
  ]
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Star size={18} className="text-blue-500" />
        ประวัติแต้ม
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
        {history.map((h, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < history.length - 1 ? 'border-b border-slate-50' : ''}`}>
            <span className="text-xl">{h.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{h.action}</p>
              <p className="text-xs text-slate-400">{h.date}</p>
            </div>
            <span className="text-sm font-bold text-emerald-600">{h.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShareCard({ user, score, points }) {
  const [shared, setShared] = useState(false)

  function handleShare() {
    const text = `🏥 สุขภาพของฉันวันนี้\n⭐ คะแนน: ${score || '?'}/100\n🏆 แต้ม: ${points} แต้ม\n🌟 ระดับ: ${getUserLevel(points).level}\n\nมาดูแลสุขภาพด้วยกันที่ HealthCheck!`
    if (navigator.share) {
      navigator.share({ title: 'HealthCheck', text })
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      })
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
      <p className="text-sm font-medium text-blue-200 mb-1">แชร์สุขภาพของคุณ</p>
      <p className="text-base font-bold mb-4">บอกให้เพื่อนมาดูแลสุขภาพด้วยกัน 💪</p>
      <button onClick={handleShare}
        className="w-full bg-white text-blue-700 font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
        {shared ? <><span>✅</span> คัดลอกแล้ว!</> : <><Share2 size={16} /><span>แชร์สุขภาพ</span></>}
      </button>
    </div>
  )
}

function HowToEarn() {
  const ways = [
    { emoji: '📋', action: 'ทำแบบประเมินสุขภาพ', pts: '10–50', freq: 'ต่อวัน' },
    { emoji: '📏', action: 'วัดค่า BMI', pts: '15', freq: 'ต่อครั้ง' },
    { emoji: '🔥', action: 'Streak 3 วันติดต่อ', pts: '30', freq: 'โบนัส' },
    { emoji: '🔥🔥', action: 'Streak 7 วันติดต่อ', pts: '100', freq: 'โบนัส' },
    { emoji: '💧', action: 'ดื่มน้ำครบ 8 แก้ว', pts: '20', freq: 'ต่อวัน' },
    { emoji: '🏃', action: 'ออกกำลังกาย 5 วัน', pts: '50', freq: 'ต่อสัปดาห์' },
  ]
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Zap size={18} className="text-yellow-500" />
        วิธีรับแต้ม
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
        {ways.map((w, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < ways.length - 1 ? 'border-b border-slate-50' : ''}`}>
            <span className="text-xl w-8 text-center">{w.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{w.action}</p>
              <p className="text-xs text-slate-400">{w.freq}</p>
            </div>
            <span className="text-sm font-black text-yellow-600">+{w.pts} แต้ม</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Rewards() {
  const { user, latestAssessment, bmiData } = useHealth()
  const { level, progress, nextLevel } = getUserLevel(user.points)
  const badges = getBadges(user, latestAssessment, bmiData)

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
          <Award size={20} className="text-yellow-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">แต้มสะสม & รางวัล</h1>
          <p className="text-xs text-slate-500">สะสมแต้มเพื่อปลดล็อคความสำเร็จ</p>
        </div>
      </div>

      <PointsCard
        points={user.points}
        level={level}
        progress={progress}
        nextLevel={nextLevel}
        streak={user.streak}
      />

      <BadgeGrid badges={badges} />

      <ShareCard user={user} score={latestAssessment?.overallScore} points={user.points} />

      <PointHistory />

      <HowToEarn />
    </div>
  )
}
