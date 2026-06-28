import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  pushUserToCloud, loginUserFromCloud, fetchUserById, syncUserPointsToCloud, updateUserAvatarInCloud,
  claimApprovedPoints, submitRedemption, claimRedemptionRefunds, saveAssessmentToCloud,
} from '../services/userSync'

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

  const [completedTips, setCompletedTips] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_tips')) ?? [] }
    catch { return [] }
  })

  const [calorieLog, setCalorieLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_calories')) ?? {} }
    catch { return {} }
  })

  const [waterLog, setWaterLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hc_water')) ?? {} }
    catch { return {} }
  })

  // ป้องกัน sync ระหว่างกำลัง hydrate จาก cloud
  const [isHydrating, setIsHydrating] = useState(true)

  // ดึงข้อมูลล่าสุดจาก Firestore ทุกครั้งที่เปิดแอป (session restore)
  // เพื่อป้องกัน localStorage เขียนทับแต้มที่ถูกต้องจากเครื่องอื่น
  useEffect(() => {
    if (!isLoggedIn || !user?.id) { setIsHydrating(false); return }
    fetchUserById(user.id)
      .then(cloud => {
        if (cloud) {
          setUser(prev => ({
            ...prev,
            ...cloud,
            // เก็บค่าสูงสุดเพื่อป้องกันการสูญเสียแต้มที่ได้จากเครื่องอื่น
            points: Math.max(prev.points ?? 0, cloud.points ?? 0),
            streak:  Math.max(prev.streak  ?? 0, cloud.streak  ?? 0),
          }))
        }
      })
      .catch(() => {})
      .finally(() => setIsHydrating(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ลบ hc_users เก่าออกเพื่อเพิ่มพื้นที่ localStorage
  useEffect(() => { localStorage.removeItem('hc_users') }, [])

  // migrate: ถ้า user ล็อกอินอยู่แต่ยังไม่มีใน hc_cloud_users ให้เพิ่มเข้าไป
  useEffect(() => {
    if (!isLoggedIn || !user.id) return
    try {
      const KEY = 'hc_cloud_users'
      const existing = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (!existing.some(u => String(u.id) === String(user.id))) {
        localStorage.setItem(KEY, JSON.stringify([...existing, { ...user, registeredAt: user.registeredAt || new Date().toISOString() }]))
      }
    } catch {}
  }, [isLoggedIn, user.id]) // eslint-disable-line

  useEffect(() => { localStorage.setItem('hc_user', JSON.stringify(user)) }, [user])
  useEffect(() => { if (latestAssessment) localStorage.setItem('hc_latest', JSON.stringify(latestAssessment)) }, [latestAssessment])
  useEffect(() => { localStorage.setItem('hc_history', JSON.stringify(history)) }, [history])
  useEffect(() => { if (bmiData) localStorage.setItem('hc_bmi', JSON.stringify(bmiData)) }, [bmiData])
  useEffect(() => { localStorage.setItem('hc_tips', JSON.stringify(completedTips)) }, [completedTips])
  useEffect(() => { localStorage.setItem('hc_calories', JSON.stringify(calorieLog)) }, [calorieLog])
  useEffect(() => { localStorage.setItem('hc_water', JSON.stringify(waterLog)) }, [waterLog])

  // sync points/streak ไป Firestore — รอให้ hydrate จาก cloud เสร็จก่อน
  useEffect(() => {
    if (isHydrating) return
    if (user.id && isLoggedIn) {
      syncUserPointsToCloud(user.id, user.points, user.streak).catch(() => {})
    }
  }, [user.points, user.streak, isHydrating]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loginByName(firstName, pin) {
    try {
      const found = await loginUserFromCloud(firstName, pin)
      if (!found) return false
      setUser(found)
      setIsLoggedIn(true)
      setShowRegister(false)
      localStorage.setItem('hc_session', 'true')
      localStorage.setItem('hc_user', JSON.stringify(found))
      return true
    } catch {
      return false
    }
  }

  async function login(userId, pin) {
    try {
      // ค้นหาจาก Firestore โดย id ตรงๆ ไม่ได้ จึงใช้ session ปัจจุบันถ้า id ตรง
      const cached = localStorage.getItem('hc_user')
      if (cached) {
        const u = JSON.parse(cached)
        if (String(u.id) === String(userId) && u.pin === pin) {
          const { pin: _, ...safe } = u
          setUser(safe)
          setIsLoggedIn(true)
          localStorage.setItem('hc_session', 'true')
          return true
        }
      }
      return false
    } catch {
      return false
    }
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

  async function registerUser({ firstName, lastName, age, gender, role, gradeLevel, pin, faceImage }) {
    const id = Date.now()
    const newEntry = {
      id,
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

    // Login ทันที — ไม่รอ cloud sync
    const { pin: _, faceImage: __, ...safeUser } = newEntry
    const userObj = { ...safeUser, name: firstName }
    setUser(userObj)
    setIsLoggedIn(true)
    setShowRegister(false)
    localStorage.setItem('hc_session', 'true')
    localStorage.setItem('hc_user', JSON.stringify(userObj))

    // Sync Firestore ใน background
    pushUserToCloud(newEntry).catch(e => {
      console.warn('[Register] Firestore sync failed:', e?.message)
      // เก็บ flag ให้ admin รู้ว่า Firestore อาจมีปัญหา
      try {
        localStorage.setItem('hc_sync_failed', JSON.stringify({ at: new Date().toISOString(), error: e?.message || 'unknown' }))
      } catch {}
    })
  }

  function saveAssessment(data) {
    const prevAssessment = latestAssessment
    const todayStr = new Date().toISOString().split('T')[0]
    const alreadyToday = history.some(h => h.fullDate === todayStr)

    setLatestAssessment(data)
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    const entry = {
      date: days[new Date().getDay()],
      fullDate: todayStr,
      sleep:     data.sleepScore     ?? 0,
      water:     data.waterScore     ?? 0,
      stress:    data.stressScore    ?? 0,
      screen:    data.digitalScore   ?? 0,
      exercise:  data.exerciseScore  ?? 0,
      nutrition: data.nutritionScore ?? 0,
      score:     data.overallScore,
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

    if (user.id) {
      saveAssessmentToCloud(user.id, user, data).catch(() => {})
    }

    return { pointsEarned, alreadyToday, prevAssessment }
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
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`
    const canEarn = bmiData?.lastBmiPointsMonth !== monthKey

    setBmiData({
      ...data,
      lastBmiPointsMonth: canEarn ? monthKey : (bmiData?.lastBmiPointsMonth ?? null),
      calculatedAt: now.toISOString(),
    })

    if (canEarn) {
      setUser(prev => ({ ...prev, points: prev.points + 15 }))
    }
    return canEarn
  }

  function toggleTip(id) {
    setCompletedTips(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function redeemReward(reward) {
    if (user.points < reward.cost) throw new Error('แต้มไม่เพียงพอ')
    if ((user.streak || 0) < 7) throw new Error('Streak ไม่ครบ 7 วัน')
    const entry = {
      id: Date.now(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`.trim(),
      userRole: user.role || '',
      gradeLevel: user.gradeLevel || '',
      rewardId: reward.id,
      rewardName: reward.name,
      rewardEmoji: reward.emoji,
      pointsCost: reward.cost,
      status: 'pending',
      adminNote: '',
      refundPending: false,
      refundClaimed: false,
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
    }
    await submitRedemption(entry)
    setUser(prev => ({ ...prev, points: prev.points - reward.cost }))
  }

  async function claimRefunds() {
    if (!user.id) return 0
    try {
      const pts = await claimRedemptionRefunds(user.id)
      if (pts > 0) setUser(prev => ({ ...prev, points: prev.points + pts }))
      return pts
    } catch { return 0 }
  }

  async function updateProfileImage(imageData) {
    setUser(prev => ({ ...prev, faceImage: imageData }))
    if (user.id) {
      try { await updateUserAvatarInCloud(user.id, imageData) } catch {}
    }
  }

  function deleteUser(userId) {
    if (String(user.id) === String(userId)) logout()
  }

  function addCalorieEntry(date, entry) {
    setCalorieLog(prev => ({ ...prev, [date]: [...(prev[date] || []), entry] }))
  }

  function deleteCalorieEntry(date, id) {
    setCalorieLog(prev => ({ ...prev, [date]: (prev[date] || []).filter(e => e.id !== id) }))
  }

  function addGlass(date) {
    setWaterLog(prev => ({ ...prev, [date]: (prev[date] || 0) + 1 }))
  }

  function removeGlass(date) {
    setWaterLog(prev => ({ ...prev, [date]: Math.max((prev[date] || 0) - 1, 0) }))
  }

  return (
    <HealthContext.Provider value={{
      isLoggedIn, login, loginByName, logout,
      claimActivityPoints,
      showRegister, setShowRegister,
      user, setUser,
      latestAssessment, saveAssessment,
      history,
      bmiData, saveBmi,
      completedTips, toggleTip,
      registerUser,
      calorieLog, addCalorieEntry, deleteCalorieEntry,
      waterLog, addGlass, removeGlass,
      redeemReward, claimRefunds,
      updateProfileImage,
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
