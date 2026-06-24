import React, { useState, useEffect } from 'react'
import {
  ChevronRight, Clock, Plus, BarChart2, Minus, ArrowLeft, Share2, Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useHealth } from '../context/HealthContext'
import { fetchBodyCompositions, deleteBodyComposition } from '../services/userSync'

const PURPLE = 'linear-gradient(135deg, #c4a7e7 0%, #9b72cf 100%)'
const PURPLE_SOLID = '#9b72cf'
const TEAL_SOLID = '#4fc3f7'

export default function BodyCompositionHistory() {
  const { user } = useHealth()
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('data')
  const [deleteMode, setDeleteMode] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    fetchBodyCompositions(String(user.id))
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  // Group by date (each date has exactly 1 record since docId = userId_date)
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  // Chart data — sorted ascending for left→right timeline
  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({
      date: r.date.slice(5), // MM-DD
      weight: r.result?.data?.weight ?? null,
      bmi: r.result?.data?.bmi ?? null,
    }))

  async function handleDelete(date) {
    if (!user?.id) return
    setDeleting(date)
    try {
      await deleteBodyComposition(String(user.id), date)
      setRecords(prev => prev.filter(r => r.date !== date))
    } catch {
      // silent
    } finally {
      setDeleting(null)
    }
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ background: '#f4f4f8' }}>

      {/* ── Purple Header ── */}
      <div style={{ background: PURPLE, paddingBottom: 0 }}>
        {/* Top bar */}
        <div className="flex items-center px-4 pt-4 pb-3 gap-3">
          <button
            onClick={() => navigate('/body-composition')}
            className="text-white p-1 -ml-1"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-white font-bold text-base leading-tight">
              ประวัติองค์ประกอบร่างกาย
            </h1>
            <p className="text-white/60 text-[11px]">HealthCheck</p>
          </div>

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
          >
            {initials}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pb-3">
          <button
            onClick={() => setActiveTab('data')}
            className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={activeTab === 'data'
              ? { background: '#fff', color: PURPLE_SOLID }
              : { color: 'rgba(255,255,255,0.75)' }}
          >
            ข้อมูล
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={activeTab === 'graph'
              ? { background: '#fff', color: PURPLE_SOLID }
              : { color: 'rgba(255,255,255,0.75)' }}
          >
            กราฟ
          </button>
          <button className="ml-auto text-white/70 p-1">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-4 pb-36">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${PURPLE_SOLID} transparent ${PURPLE_SOLID} ${PURPLE_SOLID}` }}
            />
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">ยังไม่มีข้อมูล</p>
        ) : activeTab === 'data' ? (

          /* ── Data Tab ── */
          <div className="space-y-5">
            {sortedDates.map(date => (
              <div key={date}>
                {/* Date header row */}
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="font-bold text-slate-800">{date}</span>
                  <span className="text-xs text-slate-400 font-medium">Kg | BMI</span>
                </div>

                {/* Record cards */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {grouped[date].map((record, idx) => {
                    const weight = record.result?.data?.weight ?? '–'
                    const bmi    = record.result?.data?.bmi    ?? '–'
                    const time   = record.time || '–'
                    const isDeleting = deleting === date

                    return (
                      <div
                        key={idx}
                        className="flex items-center px-4 py-3.5 border-b last:border-0"
                        style={{ borderColor: '#f1f5f9' }}
                      >
                        {/* Delete checkbox area */}
                        {deleteMode && (
                          <button
                            onClick={() => handleDelete(date)}
                            disabled={isDeleting}
                            className="mr-3 flex-shrink-0"
                          >
                            {isDeleting
                              ? <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 size={18} className="text-red-400" />}
                          </button>
                        )}

                        {/* Time */}
                        <button
                          className="flex-1 flex items-center gap-2 text-left"
                          onClick={() => !deleteMode && navigate('/body-composition', { state: { record } })}
                        >
                          <Clock size={15} className="text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 text-sm">{time}</span>

                          {/* Value */}
                          <span className="ml-auto text-slate-800 font-semibold text-sm">
                            {weight} | {bmi}
                          </span>
                          {!deleteMode && (
                            <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

        ) : (

          /* ── Graph Tab ── */
          <div className="space-y-4">
            {/* Weight chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 mb-3">น้ำหนัก (Kg)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="น้ำหนัก"
                    stroke={PURPLE_SOLID}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PURPLE_SOLID }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* BMI chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 mb-3">BMI</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bmi"
                    name="BMI"
                    stroke={TEAL_SOLID}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: TEAL_SOLID }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        )}
      </div>

      {/* ── FAB Buttons ── */}
      <div className="fixed bottom-28 right-4 flex flex-col gap-3 z-50">
        {/* Add new record */}
        <button
          onClick={() => navigate('/body-composition')}
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ background: PURPLE_SOLID }}
        >
          <Plus size={22} />
        </button>

        {/* Switch to graph tab */}
        <button
          onClick={() => setActiveTab(t => t === 'graph' ? 'data' : 'graph')}
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ background: TEAL_SOLID }}
        >
          <BarChart2 size={20} />
        </button>

        {/* Toggle delete mode */}
        <button
          onClick={() => setDeleteMode(v => !v)}
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ background: deleteMode ? '#64748b' : '#ef4444' }}
        >
          <Minus size={22} />
        </button>
      </div>
    </div>
  )
}
