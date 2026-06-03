import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HealthProvider, useHealth } from './context/HealthContext'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import BMI from './pages/BMI'
import Analytics from './pages/Analytics'
import Recommendations from './pages/Recommendations'
import Rewards from './pages/Rewards'
import Profile from './pages/Profile'

function AppContent() {
  const { isRegistered } = useHealth()
  const { pathname } = useLocation()

  if (pathname === '/admin') {
    return <Admin />
  }

  if (!isRegistered) {
    return <Register />
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <main className="pt-14 pb-20 md:pb-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/bmi" element={<BMI />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <HealthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HealthProvider>
  )
}
