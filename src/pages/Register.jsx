import React, { useState, useRef, useEffect } from 'react'
import { Camera, User, ChevronRight, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

export default function Register() {
  const { registerUser } = useHealth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ firstName: '', lastName: '', age: '' })
  const [errors, setErrors] = useState({})

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [captured, setCaptured] = useState(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (step === 2) startCamera()
    return () => stopCamera()
  }, [step])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
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

  function validateStep1() {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'กรุณากรอกชื่อ'
    if (!form.lastName.trim()) e.lastName = 'กรุณากรอกนามสกุล'
    const age = parseInt(form.age)
    if (!form.age || isNaN(age) || age < 1 || age > 120) e.age = 'กรุณากรอกอายุที่ถูกต้อง (1-120 ปี)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validateStep1()) setStep(2)
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
    const video = videoRef.current
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
    setCaptured(canvas.toDataURL('image/jpeg', 0.6))
    setScanning(false)
    stopCamera()
  }

  function retake() {
    setCaptured(null)
    setCameraReady(false)
    startCamera()
  }

  function handleRegister() {
    registerUser({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      age: parseInt(form.age),
      faceImage: captured,
    })
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'
    } focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder-slate-400`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
            step === 1 ? 'bg-blue-100' : 'bg-yellow-100'
          }`}>
            {step === 1
              ? <User size={32} className="text-blue-600" />
              : <Camera size={32} className="text-yellow-600" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 ? 'ข้อมูลส่วนตัว' : 'สแกนใบหน้า'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 ? 'กรอกข้อมูลของคุณเพื่อเริ่มใช้งาน' : 'ยืนยันตัวตนเพื่อความปลอดภัย'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-400'
          }`}>
            {step > 1 ? <Check size={16} /> : '1'}
          </div>
          <div className={`h-1 w-16 rounded-full transition-colors ${step > 1 ? 'bg-blue-500' : 'bg-blue-100'}`} />
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step === 2 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-400'
          }`}>
            2
          </div>
        </div>

        {/* ── STEP 1: personal info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อ</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => { setForm(p => ({ ...p, firstName: e.target.value })); setErrors(p => ({ ...p, firstName: undefined })) }}
                placeholder="กรอกชื่อของคุณ"
                className={inputClass('firstName')}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">นามสกุล</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => { setForm(p => ({ ...p, lastName: e.target.value })); setErrors(p => ({ ...p, lastName: undefined })) }}
                placeholder="กรอกนามสกุลของคุณ"
                className={inputClass('lastName')}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">อายุ</label>
              <input
                type="number"
                value={form.age}
                onChange={e => { setForm(p => ({ ...p, age: e.target.value })); setErrors(p => ({ ...p, age: undefined })) }}
                placeholder="กรอกอายุของคุณ"
                min="1"
                max="120"
                className={inputClass('age')}
              />
              {errors.age && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.age}</p>}
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              ถัดไป <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: face scan ── */}
        {step === 2 && (
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square mb-4">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 p-4">
                  <AlertCircle size={40} />
                  <p className="text-sm text-center">{cameraError}</p>
                </div>
              ) : captured ? (
                <>
                  <img src={captured} alt="face" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check size={40} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                  {/* face outline */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-44 h-52 border-4 rounded-[50%] transition-colors ${
                      scanning ? 'border-yellow-400 animate-pulse' : 'border-white/70'
                    }`} />
                  </div>
                  {/* corner guides */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  {/* loading overlay */}
                  {!cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-slate-900/80">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm">กำลังเปิดกล้อง...</p>
                    </div>
                  )}
                  {/* countdown */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-white text-8xl font-black drop-shadow-2xl">{countdown}</span>
                    </div>
                  )}
                  {/* flash */}
                  {flash && <div className="absolute inset-0 bg-white animate-ping" />}
                </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {!captured && !cameraError && (
              <p className="text-center text-slate-400 text-xs mb-4">
                วางใบหน้าในกรอบวงรี แล้วกดปุ่มสแกน
              </p>
            )}
            {captured && (
              <p className="text-center text-green-600 text-sm font-medium mb-4">
                สแกนใบหน้าสำเร็จ!
              </p>
            )}

            <div className="space-y-3">
              {captured ? (
                <>
                  <button
                    onClick={handleRegister}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    <Check size={18} /> เริ่มใช้งาน
                  </button>
                  <button
                    onClick={retake}
                    className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw size={15} /> สแกนใหม่
                  </button>
                </>
              ) : cameraError ? (
                <button
                  onClick={() => { setCameraError(null); startCamera() }}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  ลองอีกครั้ง
                </button>
              ) : (
                <button
                  onClick={startScan}
                  disabled={!cameraReady || scanning}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={18} />
                  {scanning ? 'กำลังสแกน...' : 'สแกนใบหน้า'}
                </button>
              )}

              {!captured && (
                <button
                  onClick={() => { stopCamera(); setStep(1) }}
                  className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-1"
                >
                  ← ย้อนกลับ
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
