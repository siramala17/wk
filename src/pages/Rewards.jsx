import React, { useState, useEffect } from 'react'
import {
  Award, Star, Zap, Share2, Flame, Trophy,
  Lock, Gift, Check, X, Clock, RefreshCw, AlertCircle,
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { getUserLevel, getBadges } from '../utils/healthScore'
import ScoreRing from '../components/ScoreRing'
import { fetchRedemptions, fetchRewardCatalog } from '../services/userSync'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const STREAK_REQ = 7
const POINTS_REQ = 500

const REDEEM_STATUS = {
  pending:  { label: 'รอ Admin อนุมัติ', emoji: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { label: 'อนุมัติแล้ว',      emoji: '✅', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  rejected: { label: 'ไม่อนุมัติ',        emoji: '❌', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
}

// ── Sub-components ────────────────────────────────────────

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
              <span className="text-lg font-black">Lv.{level}</span>
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
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-red-600" />
            <span className="text-sm font-bold">Streak {streak} วัน</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            streak >= STREAK_REQ ? 'bg-green-500/20 text-green-800' : 'bg-red-500/20 text-red-800'
          }`}>
            {streak >= STREAK_REQ ? '✅' : '🔒'} Streak {streak}/{STREAK_REQ}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            points >= POINTS_REQ ? 'bg-green-500/20 text-green-800' : 'bg-red-500/20 text-red-800'
          }`}>
            {points >= POINTS_REQ ? '✅' : '🔒'} {points}/{POINTS_REQ} แต้ม
          </div>
        </div>
      </div>
    </div>
  )
}

function BadgeGrid({ badges }) {
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" /> ความสำเร็จ
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {badges.map(b => (
          <div key={b.id} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
            b.earned ? 'bg-yellow-50 border-yellow-300 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'
          }`}>
            <span className={`text-2xl mb-1 ${!b.earned ? 'grayscale' : ''}`}>{b.emoji}</span>
            <p className="text-xs font-semibold text-center text-slate-700 leading-tight">{b.name}</p>
            {!b.earned && <p className="text-[10px] text-slate-400 text-center mt-0.5 leading-tight">{b.desc}</p>}
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
    if (navigator.share) navigator.share({ title: 'HealthCheck', text })
    else navigator.clipboard.writeText(text).then(() => { setShared(true); setTimeout(() => setShared(false), 2000) })
  }
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
      <p className="text-sm font-medium text-blue-200 mb-1">แชร์สุขภาพของคุณ</p>
      <p className="text-base font-bold mb-4">บอกให้เพื่อนมาดูแลสุขภาพด้วยกัน 💪</p>
      <button onClick={handleShare}
        className="w-full bg-white text-blue-700 font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
        {shared ? <><Check size={16} /> คัดลอกแล้ว!</> : <><Share2 size={16} /> แชร์สุขภาพ</>}
      </button>
    </div>
  )
}

function HowToEarn() {
  const ways = [
    { emoji: '📋', action: 'ทำแบบประเมินสุขภาพ', pts: '10–50', freq: 'ต่อวัน' },
    { emoji: '📏', action: 'วัดค่า BMI', pts: '15', freq: 'ต่อเดือน' },
    { emoji: '🔥', action: 'Streak 7 วัน (ปลดล็อคแลกรางวัล)', pts: '100', freq: 'โบนัส' },
    { emoji: '📸', action: 'ส่งภาพกิจกรรม (Admin อนุมัติ)', pts: '5', freq: 'ต่อครั้ง' },
  ]
  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Zap size={18} className="text-yellow-500" /> วิธีรับแต้ม
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
        {ways.map((w, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < ways.length - 1 ? 'border-b border-slate-50' : ''}`}>
            <span className="text-xl w-8 text-center">{w.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{w.action}</p>
              <p className="text-xs text-slate-400">{w.freq}</p>
            </div>
            <span className="text-sm font-black text-yellow-600">+{w.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Reward Catalog ────────────────────────────────────────

function RewardCatalog({ user, onRedeem }) {
  const qualified = user.streak >= STREAK_REQ && user.points >= POINTS_REQ

  const [catalog, setCatalog]       = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError]     = useState(false)
  const [confirmItem, setConfirmItem] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [justRedeemed, setJustRedeemed] = useState(null)

  async function loadCatalog() {
    setCatalogLoading(true)
    setCatalogError(false)
    try {
      const items = await fetchRewardCatalog()
      const active = items.filter(r => r.active !== false)
      setCatalog(shuffle(active))
    } catch {
      setCatalogError(true)
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => { loadCatalog() }, [])

  async function handleConfirm() {
    if (!confirmItem) return
    setSubmitting(true)
    setError('')
    try {
      await onRedeem(confirmItem)
      setJustRedeemed(confirmItem.name)
      setConfirmItem(null)
      setTimeout(() => setJustRedeemed(null), 4000)
    } catch (e) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Gift size={18} className="text-pink-500" /> แลกของรางวัล
        </h2>
        <button onClick={loadCatalog} disabled={catalogLoading}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
          <RefreshCw size={13} className={catalogLoading ? 'animate-spin' : ''} /> สุ่มใหม่
        </button>
      </div>

      {/* conditions */}
      <div className="flex gap-2 mb-3">
        {[
          { ok: user.streak >= STREAK_REQ, label: `Streak ${user.streak}/${STREAK_REQ} วัน` },
          { ok: user.points >= POINTS_REQ, label: `${user.points}/${POINTS_REQ} แต้ม` },
        ].map(({ ok, label }) => (
          <div key={label} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border ${
            ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {ok ? <Check size={13} /> : <Lock size={13} />} {label}
          </div>
        ))}
      </div>

      {!qualified && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 mb-3 flex items-start gap-3">
          <Lock size={17} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500 leading-relaxed">
            ต้องมี <span className="font-semibold text-slate-700">Streak ครบ {STREAK_REQ} วัน</span> และ
            <span className="font-semibold text-slate-700"> แต้ม {POINTS_REQ} ขึ้นไป</span> จึงจะแลกได้
          </p>
        </div>
      )}

      {justRedeemed && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <Check size={16} /> ส่งคำขอแลก "{justRedeemed}" แล้ว — รอ Admin อนุมัติ
        </div>
      )}

      {/* catalog grid */}
      {catalogLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : catalogError ? (
        <div className="text-center py-10 text-slate-400 space-y-2">
          <p className="text-sm">ไม่สามารถโหลดรายการรางวัลได้</p>
          <button onClick={loadCatalog} className="text-xs text-blue-500 underline">ลองอีกครั้ง</button>
        </div>
      ) : catalog.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Gift size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">ยังไม่มีของรางวัล</p>
          <p className="text-xs mt-1">Admin กำลังเพิ่มของรางวัลให้</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {catalog.map(r => {
            const canAfford = user.points >= r.cost
            const canRedeem = qualified && canAfford
            return (
              <div key={r.id} className={`bg-white rounded-2xl border-2 p-3.5 transition-all ${
                canRedeem ? 'border-yellow-200 shadow-sm' : 'border-slate-100 opacity-70'
              }`}>
                <div className="text-3xl mb-2">{r.emoji}</div>
                <p className="font-bold text-slate-800 text-sm leading-tight">{r.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-2 leading-tight line-clamp-2">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black flex items-center gap-1 ${canAfford ? 'text-yellow-600' : 'text-red-500'}`}>
                    <Star size={12} className={canAfford ? 'fill-yellow-400 text-yellow-400' : 'text-red-400'} />
                    {r.cost.toLocaleString()}
                  </span>
                  <button
                    onClick={() => { setError(''); setConfirmItem(r) }}
                    disabled={!canRedeem}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      canRedeem
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canRedeem ? 'แลก' : <Lock size={12} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* confirm modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="text-center">
              <span className="text-5xl">{confirmItem.emoji}</span>
              <h3 className="font-bold text-slate-800 text-lg mt-2">{confirmItem.name}</h3>
              <p className="text-slate-400 text-sm">{confirmItem.desc}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
              <p className="text-sm text-yellow-700">ใช้แต้ม <span className="font-black text-base">{confirmItem.cost.toLocaleString()}</span> แต้ม</p>
              <p className="text-xs text-yellow-600 mt-0.5">เหลือ {(user.points - confirmItem.cost).toLocaleString()} แต้ม</p>
            </div>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              คำขอจะส่งไปยัง Admin เพื่ออนุมัติ — แต้มจะถูกหักทันที
            </p>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setConfirmItem(null); setError('') }} disabled={submitting}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleConfirm} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-900 rounded-full animate-spin" /> กำลังส่ง...</>
                  : <><Gift size={15} /> ยืนยันแลก</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Redemption History ─────────────────────────────────────

function RedemptionHistory({ userId, claimRefunds }) {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [claiming, setClaiming]     = useState(false)
  const [refundMsg, setRefundMsg]   = useState('')

  async function load() {
    setLoading(true)
    try {
      const all = await fetchRedemptions()
      setItems(all.filter(r => r.userId === userId).reverse())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const pendingRefunds = items.filter(r => r.status === 'rejected' && r.refundPending && !r.refundClaimed)

  async function handleClaimRefunds() {
    setClaiming(true)
    try {
      const pts = await claimRefunds()
      if (pts > 0) {
        setRefundMsg(`ได้รับคืน ${pts} แต้มแล้ว`)
        setTimeout(() => setRefundMsg(''), 4000)
        await load()
      }
    } finally { setClaiming(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock size={18} className="text-blue-500" /> ประวัติการแลก
        </h2>
        <button onClick={load} disabled={loading} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> รีเฟรช
        </button>
      </div>

      {pendingRefunds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-3 flex items-center gap-3">
          <span className="text-xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-700">มีแต้มรอคืน {pendingRefunds.reduce((s, r) => s + r.pointsCost, 0)} แต้ม</p>
            <p className="text-xs text-orange-500">จากคำขอที่ถูกปฏิเสธ</p>
          </div>
          <button onClick={handleClaimRefunds} disabled={claiming}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">
            {claiming ? '...' : 'รับคืน'}
          </button>
        </div>
      )}

      {refundMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-3 text-sm text-green-700 font-medium flex items-center gap-2">
          <Check size={15} /> {refundMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Gift size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">ยังไม่มีประวัติการแลกของรางวัล</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(r => {
            const st = REDEEM_STATUS[r.status] || REDEEM_STATUS.pending
            return (
              <div key={r.id} className={`${st.bg} border ${st.border} rounded-2xl p-3.5 flex gap-3 items-start`}>
                <span className="text-2xl flex-shrink-0">{r.rewardEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{r.rewardName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(r.requestedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs font-semibold ${st.text}`}>{st.emoji} {st.label}</span>
                    <span className="text-xs text-slate-400">-{r.pointsCost} แต้ม</span>
                    {r.status === 'rejected' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        r.refundClaimed ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {r.refundClaimed ? '💰 คืนแต้มแล้ว' : '💰 รอรับคืนแต้ม'}
                      </span>
                    )}
                  </div>
                  {r.adminNote && (
                    <p className="text-xs text-slate-500 mt-1 bg-white/60 rounded-lg px-2 py-1">
                      💬 {r.adminNote}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function Rewards() {
  const { user, latestAssessment, bmiData, redeemReward, claimRefunds } = useHealth()
  const { level, progress, nextLevel } = getUserLevel(user.points)
  const badges = getBadges(user, latestAssessment, bmiData)
  const [tab, setTab] = useState('rewards')

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
          <Award size={20} className="text-yellow-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">แต้มสะสม & รางวัล</h1>
          <p className="text-xs text-slate-500">สะสมแต้มเพื่อแลกของรางวัล</p>
        </div>
      </div>

      <PointsCard points={user.points} level={level} progress={progress} nextLevel={nextLevel} streak={user.streak} />

      {/* tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        {[
          { key: 'rewards',  label: '🎁 แลกรางวัล' },
          { key: 'history',  label: '🕐 ประวัติ' },
          { key: 'badges',   label: '🏆 ความสำเร็จ' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              tab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'rewards' && (
        <>
          <RewardCatalog user={user} onRedeem={redeemReward} />
          <ShareCard user={user} score={latestAssessment?.overallScore} points={user.points} />
          <HowToEarn />
        </>
      )}

      {tab === 'history' && (
        <RedemptionHistory userId={user.id} claimRefunds={claimRefunds} />
      )}

      {tab === 'badges' && (
        <BadgeGrid badges={badges} />
      )}
    </div>
  )
}
