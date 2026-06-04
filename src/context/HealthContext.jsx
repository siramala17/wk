import React, { createContext, useContext, useState, useEffect } from 'react'
import { pushUserToCloud, claimApprovedPoints } from '../services/userSync'

const HealthContext = createContext(null)

const BLANK_USER = { name: 'ผู้ใช้งาน', firstName: '', lastName: '', age: 18, gender: '', role: '', gradeLevel: '', points: 0, streak: 0, faceImage: null }

export function HealthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    localStorage.getItem('hc_session') === 'true'
  )
  const [showRegister, setShowRegister] = useState(false)

  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('hc_user')
      return s ? JSON.parse(s) : BLANK_USER
    } catch { return BLANK_USER }
  })

  const [latestAssessment, setLatestAssessment] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_latest')) ?? null }
    catch { return null }
  })

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_history')) ?? [] }
    catch { return [] }
  })

  const [bmiData, setBmiData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_bmi')) ?? null }
    catch { return null }
  })

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_users')) ?? [] }
    catch { return [] }
  })

  const [completedTips, setCompletedTips] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_tips')) ?? [] }
    catch { return [] }
  })

  const [calorieLog, setCalorieLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_calories')) ?? {} }
    catch { return {} }
  })

  useEffect(() => { localStorage.setItem('hc_user', JSON.stringify(user)) }, [user])
  useEffect(() => { if (latestAssessment) localStorage.setItem('hc_latest', JSON.stringify(latestAssessment)) }, [latestAssessment])
  useEffect(() => { localStorage.setItem('hc_history', JSON.stringify(history)) }, [history])
  useEffect(() => { if (bmiData) localStorage.setItem('hc_bmi', JSON.stringify(bmiData)) }, [bmiData])
  useEffect(() => { localStorage.setItem('hc_tips', JSON.stringify(completedTips)) }, [completedTips])
  useEffect(() => { localStorage.setItem('hc_users', JSON.stringify(registeredUsers)) }, [registeredUsers])
  useEffect(() => { localStorage.setItem('hc_calories', JSON.stringify(calorieLog)) }, [calorieLog])

  function login(userId, pin) {
    const found = registeredUsers.find(u => u.id === userId)
    if (!found || found.pin !== pin) return false
    const { pin: _, ...safeUser } = found
    setUser(safeUser)
    setIsLoggedIn(true)
    setShowRegister(false)
    localStorage.setItem('hc_session', 'true')
    localStorage.setItem('hc_user', JSON.stringify(safeUser))
    return true
  }

  function loginByName(firstName, pin) {
    const found = registeredUsers.find(
      u => u.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() && u.pin === pin
    )
    if (!found) return false
    const { pin: _, ...safeUser } = found
    setUser(safeUser)
    setIsLoggedIn(true)
    setShowRegister(false)
    localStorage.setItem('hc_session', 'true')
    localStorage.setItem('hc_user', JSON.stringify(safeUser))
    return true
  }

  function logout() {
    setIsLoggedIn(false)
    setUser(BLANK_USER)
    setLatestAssessment(null)
    setHistory([])
    setBmiData(null)
    setCompletedTips([])
    localStorage.removeItem('hc_session')
    localStorage.removeItem('hc_latest')
    localStorage.removeItem('hc_history')
    localStorage.removeItem('hc_bmi')
    localStorage.removeItem('hc_tips')
  }

  function registerUser({ firstName, lastName, age, gender, role, gradeLevel, pin, faceImage }) {
    const name = firstName
    const newEntry = {
      id: Date.now(),
      firstName,
      lastName,
      age,
      gender,
      role: role || '',
      gradeLevel: gradeLevel || '',
      pin,
      faceImage,
      registeredAt: new Date().toISOString(),
      points: 0,
      streak: 0,
    }
    setRegisteredUsers(prev => [...prev, newEntry])
    const { pin: _, ...safeUser } = newEntry
    setUser({ ...safeUser, name })
    setIsLoggedIn(true)
    setShowRegister(false)
    localStorage.setItem('hc_session', 'true')
    pushUserToCloud(newEntry).catch(() => {})
  }

  function saveAssessment(data) {
    const todayStr = new Date().toISOString().split('T')[0]
    const alreadyToday = history.some(h => h.fullDate === todayStr)

    setLatestAssessment(data)
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    const entry = {
      date: days[new Date().getDay()],
      fullDate: todayStr,
      sleep: data.sleepScore ?? 0,
      water: data.waterScore ?? 0,
      stress: data.stressScore ?? 0,
      screen: data.digitalScore ?? 0,
      exercise: data.exerciseScore ?? 0,
      score: data.overallScore,
    }
    setHistory(prev => {
      const filtered = prev.filter(h => h.fullDate !== todayStr)
      return [...filtered.slice(-6), entry]
    })

    let pointsEarned = 0
    if (!alreadyToday) {
      pointsEarned = Math.floor(data.overallScore / 10) * 5 + 10
      setUser(prev => ({ ...prev, points: prev.points + pointsEarned, streak: prev.streak + 1 }))
    }
    setCompletedTips([])
    return { pointsEarned, alreadyToday }
  }

  async function claimActivityPoints() {
    if (!user.id) return 0
    try {
      const pts = await claimApprovedPoints(user.id)
      if (pts > 0) setUser(prev => ({ ...prev, points: prev.points + pts }))
      return pts
    } catch { return 0 }
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

  function deleteUser(userId) {
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId))
    if (user.id === userId) logout()
  }

  function addCalorieEntry(date, entry) {
    setCalorieLog(prev => ({ ...prev, [date]: [...(prev[date] || []), entry] }))
  }

  function deleteCalorieEntry(date, id) {
    setCalorieLog(prev => ({ ...prev, [date]: (prev[date] || []).filter(e => e.id !== id) }))
  }

  return (
    <HealthContext.Provider value={{
      isLoggedIn, login, loginByName, logout,
      claimActivityPoints,
      showRegister, setShowRegister,
      registeredUsers,
      user, setUser,
      latestAssessment, saveAssessment,
      history,
      bmiData, saveBmi,
      completedTips, toggleTip,
      registerUser,
      calorieLog, addCalorieEntry, deleteCalorieEntry,
      deleteUser,
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
