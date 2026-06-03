import React from 'react'
import { User, Calendar, Star, Flame, Shield } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const GENDER_STYLE = {
  'ชาย':   { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '♂' },
  'หญิง':  { bg: 'bg-pink-100',   text: 'text-pink-700',   emoji: '♀' },
  'LGBTQ+': { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🏳️‍🌈' },
}

export default function Profile() {
  const { user } = useHealth()

  const registeredAt = user.registeredAt
    ? new Date(user.registeredAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const gender = user.gender || ''
  const gs = GENDER_STYLE[gender]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* card หลัก */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

        {/* banner */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-700" />

        {/* avatar */}
        <div className="flex flex-col items-center -mt-12 px-6 pb-6">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex items-center justify-center">
            {user.faceImage
              ? <img src={user.faceImage} alt="face" className="w-full h-full object-cover" />
              : <User size={40} className="text-blue-400" />
            }
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-800">
            {user.firstName || user.name} {user.lastName || ''}
          </h1>

          {gs && (
            <span className={`mt-1.5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-sm font-semibold ${gs.bg} ${gs.text}`}>
              <span>{gs.emoji}</span> {gender}
            </span>
          )}
        </div>

        {/* ข้อมูล */}
        <div className="divide-y divide-slate-100 mx-6 mb-6 rounded-2xl border border-slate-100 overflow-hidden">
          <Row label="อายุ" value={user.age ? `${user.age} ปี` : '—'} />
          <Row label="เพศ" value={gender || '—'} />
          {registeredAt && <Row label="วันที่ลงทะเบียน" value={registeredAt} icon={<Calendar size={15} className="text-slate-400" />} />}
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3 mx-6 mb-6">
          <StatCard
            icon={<Star size={20} className="text-yellow-500 fill-yellow-400" />}
            label="คะแนนสะสม"
            value={user.points ?? 0}
            bg="bg-yellow-50"
          />
          <StatCard
            icon={<Flame size={20} className="text-orange-500" />}
            label="วันติดต่อกัน"
            value={`${user.streak ?? 0} วัน`}
            bg="bg-orange-50"
          />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500 flex items-center gap-1.5">
        {icon}{label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col items-center gap-1`}>
      {icon}
      <span className="text-xl font-bold text-slate-800">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}
