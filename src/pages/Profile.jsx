import React, { useState, useRef, useEffect } from 'react'
import {
  User, Calendar, Star, Flame, LogOut,
  Camera, Upload, RefreshCw, Check, X, AlertCircle, Pencil,
} from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const GENDER_STYLE = {
  'ชาย':    { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '♂' },
  'หญิง':   { bg: 'bg-pink-100',   text: 'text-pink-700',   emoji: '♀' },
  'LGBTQ+': { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🏳️‍🌈' },
}

const ROLE_STYLE = {
  'นักเรียน':     { bg: 'bg-sky-100',     text: 'text-sky-700',     emoji: '🎒' },
  'ครู':           { bg: 'bg-emerald-100', text: 'text-emerald-700', emoji: '👩‍🏫' },
  'บุคคลทั่วไป': { bg: 'bg-slate-100',   text: 'text-slate-600',   emoji: '👤' },
}

export default function Profile() {
  const { user, logout, updateProfileImage } = useHealth()

  // ── avatar modal state ──────────────────────────────────
  const [showModal, setShowModal]       = useState(false)
  const [mode, setMode]                 = useState('upload') // 'upload' | 'scan'
  const [preview, setPreview]           = useState(null)

  // camera
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)
  const fileRef    = useRef(null)
  const [cameraReady, setCameraReady]   = useState(false)
  const [cameraError, setCameraError]   = useState(null)
  const [scanning, setScanning]         = useState(false)
  const [countdown, setCountdown]       = useState(null)
  const [flash, setFlash]               = useState(false)

  useEffect(() => {
    if (showModal && mode === 'scan' && !preview) startCamera()
    if (!showModal || mode === 'upload') stopCamera()
    return () => { stopCamera() }
  }, [showModal, mode])

  useEffect(() => { return () => stopCamera() }, [])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
    setCameraError(null)
  }

  async function startCamera() {
    setCameraReady(false)
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 320 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setCameraReady(true)
        }
      }
    } catch {
      setCameraError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์')
    }
  }

  function startScan() {
    setScanning(true)
    let count = 3
    setCountdown(count)
    const interval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        clearInterval(interval)
        setCountdown(null)
        captureFrame()
      }
    }, 1000)
  }

  function captureFrame() {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = 240
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    const size = Math.min(video.videoWidth, video.videoHeight)
    const sx = (video.videoWidth - size) / 2
    const sy = (video.videoHeight - size) / 2
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 240, 240)
    setFlash(true)
    setTimeout(() => setFlash(false), 250)
    setPreview(canvas.toDataURL('image/jpeg', 0.6))
    setScanning(false)
    stopCamera()
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSave() {
    if (!preview) return
    updateProfileImage(preview)
    closeModal()
  }

  function openModal() {
    setShowModal(true)
    setMode('upload')
    setPreview(null)
  }

  function closeModal() {
    stopCamera()
    setShowModal(false)
    setPreview(null)
    setScanning(false)
    setCountdown(null)
  }

  function switchMode(m) {
    stopCamera()
    setPreview(null)
    setScanning(false)
    setCountdown(null)
    setMode(m)
  }

  // ── derived display data ────────────────────────────────
  const registeredAt = user.registeredAt
    ? new Date(user.registeredAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const gs = GENDER_STYLE[user.gender]
  const rs = ROLE_STYLE[user.role]

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

        {/* banner */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-700" />

        {/* avatar + name */}
        <div className="flex flex-col items-center -mt-12 px-6 pb-6">
          {/* avatar with edit overlay */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                {user.faceImage
                  ? <img src={user.faceImage} alt="avatar" className="w-full h-full object-cover" />
                  : <User size={40} className="text-blue-400" />
                }
              </div>
              <button
                onClick={openModal}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Pencil size={20} className="text-white" />
              </button>
              {/* always-visible edit badge */}
              <button
                onClick={openModal}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full border-2 border-white flex items-center justify-center shadow transition-colors"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Pencil size={13} className="text-white" />
              </button>
            </div>

            {/* CTA เมื่อยังไม่มีรูปโปรไฟล์ */}
            {!user.faceImage && (
              <button
                onClick={openModal}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors border border-blue-200"
              >
                <Camera size={13} /> เพิ่มรูปโปรไฟล์
              </button>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-800">
            {user.firstName || user.name} {user.lastName || ''}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {gs && (
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-sm font-semibold ${gs.bg} ${gs.text}`}>
                {gs.emoji} {user.gender}
              </span>
            )}
            {rs && (
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-sm font-semibold ${rs.bg} ${rs.text}`}>
                {rs.emoji} {user.role}{user.gradeLevel ? ` ${user.gradeLevel}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* info rows */}
        <div className="divide-y divide-slate-100 mx-6 mb-6 rounded-2xl border border-slate-100 overflow-hidden">
          <Row label="อายุ"    value={user.age ? `${user.age} ปี` : '—'} />
          <Row label="เพศ"    value={user.gender || '—'} />
          {user.role && (
            <Row label="สถานะ" value={user.role + (user.gradeLevel ? ` — ${user.gradeLevel}` : '')} />
          )}
          {registeredAt && (
            <Row label="ลงทะเบียน" value={registeredAt} icon={<Calendar size={15} className="text-slate-400" />} />
          )}
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

        {/* logout */}
        <div className="px-6 pb-6">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-100 text-red-500 font-semibold hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* ── Avatar modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md flex flex-col max-h-[92vh]">

            {/* modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800">เปลี่ยนรูปโปรไฟล์</h3>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            {/* mode tabs */}
            <div className="flex gap-1 p-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              {[
                { key: 'upload', icon: <Upload size={15} />, label: 'อัปโหลดรูป' },
                { key: 'scan',   icon: <Camera size={15} />, label: 'สแกนใบหน้า' },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === key
                      ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">

              {/* ── UPLOAD MODE ── */}
              {mode === 'upload' && (
                <>
                  {!preview ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-blue-200 rounded-2xl py-12 flex flex-col items-center gap-3 text-blue-400 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <Upload size={36} strokeWidth={1.5} />
                      <div className="text-center">
                        <p className="font-semibold text-sm text-blue-600">คลิกเพื่อเลือกรูป</p>
                        <p className="text-xs mt-0.5">รองรับ JPG, PNG, HEIC</p>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full aspect-square object-cover rounded-2xl"
                        />
                        <button
                          onClick={() => { setPreview(null) }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <RefreshCw size={14} /> เลือกรูปใหม่
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </>
              )}

              {/* ── SCAN MODE ── */}
              {mode === 'scan' && (
                <>
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square">
                    {cameraError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 p-6">
                        <AlertCircle size={40} />
                        <p className="text-sm text-center">{cameraError}</p>
                        <button
                          onClick={() => { setCameraError(null); startCamera() }}
                          className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                        >
                          ลองอีกครั้ง
                        </button>
                      </div>
                    ) : preview ? (
                      <>
                        <img src={preview} alt="face" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check size={32} className="text-white" strokeWidth={3} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`w-44 h-52 border-4 rounded-[50%] transition-colors ${
                            scanning ? 'border-yellow-400 animate-pulse' : 'border-white/70'
                          }`} />
                        </div>
                        <div className="absolute top-3 left-3 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl-md" />
                        <div className="absolute top-3 right-3 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr-md" />
                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl-md" />
                        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br-md" />
                        {!cameraReady && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-slate-900/80">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">กำลังเปิดกล้อง...</p>
                          </div>
                        )}
                        {countdown !== null && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="text-white text-8xl font-black drop-shadow-2xl">{countdown}</span>
                          </div>
                        )}
                        {flash && <div className="absolute inset-0 bg-white" />}
                      </>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />

                  {preview ? (
                    <div className="space-y-2">
                      <p className="text-center text-green-600 text-sm font-medium">สแกนสำเร็จ!</p>
                      <button
                        onClick={() => { setPreview(null); startCamera() }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <RefreshCw size={14} /> สแกนใหม่
                      </button>
                    </div>
                  ) : !cameraError && (
                    <>
                      <p className="text-center text-slate-400 text-xs -mt-2">
                        วางใบหน้าในกรอบวงรี แล้วกดสแกน
                      </p>
                      <button
                        onClick={startScan}
                        disabled={!cameraReady || scanning}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Camera size={18} />
                        {scanning ? 'กำลังสแกน...' : 'สแกนใบหน้า'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* action buttons */}
            <div className="flex gap-2 p-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={!preview}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Check size={15} /> บันทึกรูปใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500 flex items-center gap-1.5">{icon}{label}</span>
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
