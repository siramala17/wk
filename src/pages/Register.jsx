import React, { useState, useRef, useEffect } from 'react'
import { Camera, User, ChevronRight, Check, RefreshCw, AlertCircle, Lock } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

export default function Register() {
  const { registerUser } = useHealth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ firstName: '', lastName: '', age: '', gender: '', pin: '', confirmPin: '' })
  const [errors, setErrors] = useState({})

  // step 2 — age verification
  const [ageConfirm, setAgeConfirm] = useState('')
  const [ageConfirmError, setAgeConfirmError] = useState(null)
  const [ageVerified, setAgeVerified] = useState(false)

  // camera
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
    if (step === 2 && ageVerified) startCamera()
    return () => stopCamera()
  }, [step, ageVerified])

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
    if (!form.gender) e.gender = 'กรุณาเลือกเพศ'
    if (!form.pin || form.pin.length !== 4) e.pin = 'กรุณาตั้ง PIN 4 หลัก'
    if (form.pin && form.confirmPin !== form.pin) e.confirmPin = 'PIN ไม่ตรงกัน'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validateStep1()) {
      setAgeConfirm('')
      setAgeVerified(false)
      setAgeConfirmError(null)
      setStep(2)
    }
  }

  function handleVerifyAge() {
    const entered = parseInt(ageConfirm)
    if (!ageConfirm || isNaN(entered)) {
      setAgeConfirmError('กรุณากรอกอายุ')
      return
    }
    if (entered !== parseInt(form.age)) {
      setAgeConfirmError('อายุไม่ตรงกับที่ลงทะเบียน กรุณาลองใหม่')
      setAgeConfirm('')
      return
    }
    setAgeConfirmError(null)
    setAgeVerified(true)
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
      gender: form.gender,
      pin: form.pin,
      faceImage: captured,
    })
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'
    } focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder-slate-400`

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* icon + title */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
            step === 1 ? 'bg-blue-100' : 'bg-yellow-100'
          }`}>
            {step === 1
              ? <User size={32} className="text-blue-600" />
              : <Camera size={32} className="text-yellow-600" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 ? 'ข้อมูลส่วนตัว' : 'ยืนยันตัวตน'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 ? 'กรอกข้อมูลของคุณเพื่อเริ่มใช้งาน' : 'ยืนยันอายุและสแกนใบหน้า'}
          </p>
        </div>

        {/* step indicator */}
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

        {/* ── STEP 1 ── */}
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">เพศ</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ชาย', emoji: '♂', bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-600', ring: 'ring-blue-400' },
                  { value: 'หญิง', emoji: '♀', bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-600', ring: 'ring-pink-400' },
                  { value: 'LGBTQ+', emoji: '🏳️‍🌈', bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', ring: 'ring-purple-400' },
                ].map(({ value, emoji, bg, border, text, ring }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setForm(p => ({ ...p, gender: value })); setErrors(p => ({ ...p, gender: undefined })) }}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${
                      form.gender === value
                        ? `${bg} ${border} ${text} ring-2 ${ring} ring-offset-1`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span>{value}</span>
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.gender}</p>}
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Lock size={13} className="inline mr-1 mb-0.5" />ตั้ง PIN 4 หลัก (สำหรับเข้าสู่ระบบ)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={form.pin}
                onChange={e => { setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '') })); setErrors(p => ({ ...p, pin: undefined })) }}
                placeholder="● ● ● ●"
                className={`${inputClass('pin')} text-center text-2xl tracking-[0.5em]`}
              />
              {errors.pin && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.pin}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ยืนยัน PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={form.confirmPin}
                onChange={e => { setForm(p => ({ ...p, confirmPin: e.target.value.replace(/\D/g, '') })); setErrors(p => ({ ...p, confirmPin: undefined })) }}
                placeholder="● ● ● ●"
                className={`${inputClass('confirmPin')} text-center text-2xl tracking-[0.5em]`}
              />
              {errors.confirmPin && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPin}</p>}
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              ถัดไป <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">

            {/* age verification block */}
            <div className={`rounded-2xl border-2 p-4 transition-colors ${
              ageVerified ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  ageVerified ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {ageVerified ? <Check size={14} className="text-white" /> : <Lock size={14} className="text-white" />}
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {ageVerified ? 'ยืนยันอายุสำเร็จ' : 'ยืนยันอายุของคุณ'}
                </p>
              </div>

              {ageVerified ? (
                <p className="text-green-700 text-sm text-center py-1">
                  อายุ {form.age} ปี — ผ่านการยืนยันแล้ว
                </p>
              ) : (
                <>
                  <p className="text-slate-500 text-xs mb-2">กรอกอายุของคุณอีกครั้งเพื่อยืนยัน</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ageConfirm}
                      onChange={e => { setAgeConfirm(e.target.value); setAgeConfirmError(null) }}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyAge()}
                      placeholder="กรอกอายุ"
                      min="1"
                      max="120"
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-sm ${
                        ageConfirmError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800`}
                    />
                    <button
                      onClick={handleVerifyAge}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      ยืนยัน
                    </button>
                  </div>
                  {ageConfirmError && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} />{ageConfirmError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* camera block — only visible after age verified */}
            {ageVerified && (
              <>
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square">
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
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`w-44 h-52 border-4 rounded-[50%] transition-colors ${
                          scanning ? 'border-yellow-400 animate-pulse' : 'border-white/70'
                        }`} />
                      </div>
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
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

                {!captured && !cameraError && (
                  <p className="text-center text-slate-400 text-xs -mt-2">
                    วางใบหน้าในกรอบวงรี แล้วกดปุ่มสแกน
                  </p>
                )}
                {captured && (
                  <p className="text-center text-green-600 text-sm font-medium -mt-2">
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
                </div>
              </>
            )}

            {!captured && (
              <button
                onClick={() => { stopCamera(); setAgeVerified(false); setAgeConfirm(''); setStep(1) }}
                className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-1"
              >
                ← ย้อนกลับ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
