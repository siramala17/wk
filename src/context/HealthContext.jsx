import React, { createContext, useContext, useState, useEffect } from 'react'

const HealthContext = createContext(null)

function generateSampleHistory() {
  const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return {
      date: days[d.getDay()],
      fullDate: d.toISOString().split('T')[0],
      sleep: +(4.5 + Math.random() * 4).toFixed(1),
      water: Math.floor(3 + Math.random() * 6),
      stress: Math.floor(2 + Math.random() * 7),
      screen: +(2 + Math.random() * 7).toFixed(1),
      exercise: Math.random() > 0.45 ? 1 : 0,
      score: Math.floor(45 + Math.random() * 45),
    }
  })
}

export function HealthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('hc_user')
      return s ? JSON.parse(s) : { name: 'ผู้ใช้งาน', age: 18, points: 120, streak: 3 }
    } catch { return { name: 'ผู้ใช้งาน', age: 18, points: 120, streak: 3 } }
  })

  const [latestAssessment, setLatestAssessment] = useState(() => {
    try {
      const s = localStorage.getItem('hc_latest')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const [history, setHistory] = useState(() => {
    try {
      const s = localStorage.getItem('hc_history')
      return s ? JSON.parse(s) : generateSampleHistory()
    } catch { return generateSampleHistory() }
  })

  const [bmiData, setBmiData] = useState(() => {
    try {
      const s = localStorage.getItem('hc_bmi')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const [completedTips, setCompletedTips] = useState(() => {
    try {
      const s = localStorage.getItem('hc_tips')
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('hc_user', JSON.stringify(user)) }, [user])
  useEffect(() => { if (latestAssessment) localStorage.setItem('hc_latest', JSON.stringify(latestAssessment)) }, [latestAssessment])
  useEffect(() => { localStorage.setItem('hc_history', JSON.stringify(history)) }, [history])
  useEffect(() => { if (bmiData) localStorage.setItem('hc_bmi', JSON.stringify(bmiData)) }, [bmiData])
  useEffect(() => { localStorage.setItem('hc_tips', JSON.stringify(completedTips)) }, [completedTips])

  function saveAssessment(data) {
    setLatestAssessment(data)
    const todayStr = new Date().toISOString().split('T')[0]
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    const entry = {
      date: days[new Date().getDay()],
      fullDate: todayStr,
      sleep: data.sleepHours,
      water: data.waterGlasses,
      stress: data.stressLevel,
      screen: data.screenHours,
      exercise: data.exerciseDays > 0 ? 1 : 0,
      score: data.overallScore,
    }
    setHistory(prev => {
      const filtered = prev.filter(h => h.fullDate !== todayStr)
      return [...filtered.slice(-6), entry]
    })
    const pts = Math.floor(data.overallScore / 10) * 5 + 10
    setUser(prev => ({ ...prev, points: prev.points + pts, streak: prev.streak + 1 }))
    setCompletedTips([])
  }

  function saveBmi(data) {
    setBmiData(data)
    setUser(prev => ({ ...prev, points: prev.points + 15 }))
  }

  function toggleTip(id) {
    setCompletedTips(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  return (
    <HealthContext.Provider value={{
      user, setUser,
      latestAssessment, saveAssessment,
      history,
      bmiData, saveBmi,
      completedTips, toggleTip,
    }}>
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth() {
  const ctx = useContext(HealthContext)
  if (!ctx) throw new Error('useHealth must be inside HealthProvider')
  return ctx
}
