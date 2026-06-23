import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HealthProvider, useHealth } from './context/HealthContext'
import { LangProvider } from './context/LangContext'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Register from './pages/Register'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import Analytics from './pages/Analytics'
import Rewards from './pages/Rewards'
import Knowledge from './pages/Knowledge'
import NubCal from './pages/NubCal'
import Survey from './pages/Survey'
import SchoolDashboard from './pages/SchoolDashboard'
import BodyComposition from './pages/BodyComposition'

function AppContent() {
  const { isLoggedIn, showRegister } = useHealth()
  const { pathname } = useLocation()

  if (pathname === '/admin') return <Admin />
  if (pathname === '/school-dashboard') return <SchoolDashboard />

  if (showRegister) return <Register />

  if (!isLoggedIn) return <Login />

  return (
    <div className="min-h-screen bg-indigo-50">
      <Navbar />
      <Sidebar />
      <main className="pb-24 md:ml-56 md:pb-8 pl-safe pr-safe" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/bmi" element={<Navigate to="/assessment" replace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Navigate to="/analytics" replace />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Navigate to="/" replace />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/activity" element={<Navigate to="/rewards" replace />} />
          <Route path="/nubcal" element={<NubCal />} />
          <Route path="/body-composition" element={<BodyComposition />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <LangProvider>
        <HealthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </HealthProvider>
      </LangProvider>
    </ErrorBoundary>
  )
}
