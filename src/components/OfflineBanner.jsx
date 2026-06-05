import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOnline, setShowOnline] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      setShowOnline(true)
      setTimeout(() => setShowOnline(false), 3000)
    }
    function handleOffline() {
      setIsOnline(false)
      setShowOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showOnline) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-amber-500 text-white'
      }`}
    >
      {isOnline
        ? <><Wifi size={15} /> กลับมาออนไลน์แล้ว</>
        : <><WifiOff size={15} /> ไม่มีการเชื่อมต่ออินเทอร์เน็ต — ฟีเจอร์บางอย่างอาจใช้ไม่ได้</>
      }
    </div>
  )
}
