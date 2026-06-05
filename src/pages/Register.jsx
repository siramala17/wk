import React, { useState, useRef, useEffect } from 'react'
import { Camera, User, ChevronRight, Check, RefreshCw, AlertCircle, Lock, Upload } from 'lucide-react'
import { useHealth } from '../context/HealthContext'

const LANG = {
  th: {
    step1Title: 'ข้อมูลส่วนตัว',
    step2Title: 'ยืนยันตัวตน',
    step1Sub: 'กรอกข้อมูลของคุณเพื่อเริ่มใช้งาน',
    step2Sub: 'ยืนยันอายุและสแกนใบหน้า',
    firstName: 'ชื่อ', firstNamePh: 'กรอกชื่อของคุณ',
    lastName: 'นามสกุล', lastNamePh: 'กรอกนามสกุลของคุณ',
    age: 'อายุ', agePh: 'กรอกอายุของคุณ',
    gender: 'เพศ',
    role: 'สถานะ',
    gradeLevel: 'ระดับชั้น',
    gMale: 'ชาย', gFemale: 'หญิง',
    rStudent: 'นักเรียน', rTeacher: 'ครู', rGeneral: 'บุคคลทั่วไป',
    grpElem: 'ประถมศึกษา', grpJunior: 'มัธยมศึกษาตอนต้น',
    grpSenior: 'มัธยมศึกษาตอนปลาย', grpVoc: 'อาชีวศึกษา',
    pin: 'ตั้ง PIN 4 หลัก (สำหรับเข้าสู่ระบบ)', confirmPin: 'ยืนยัน PIN',
    next: 'ถัดไป',
    ageVerifiedLabel: 'ยืนยันอายุสำเร็จ', ageVerifyLabel: 'ยืนยันอายุของคุณ',
    ageConfirmGuide: 'กรอกอายุของคุณอีกครั้งเพื่อยืนยัน',
    ageConfirmPh: 'กรอกอายุ', ageConfirmBtn: 'ยืนยัน',
    ageVerifiedMsg: (age) => `อายุ ${age} ปี — ผ่านการยืนยันแล้ว`,
    openingCamera: 'กำลังเปิดกล้อง...',
    faceGuide: 'วางใบหน้าในกรอบวงรี แล้วกดปุ่มสแกน',
    faceCaptured: 'สแกนใบหน้าสำเร็จ!',
    getStarted: 'เริ่มใช้งาน', retake: 'สแกนใหม่', tryAgain: 'ลองอีกครั้ง',
    scanning: 'กำลังสแกน...', scanFace: 'สแกนใบหน้า',
    or: 'หรือ', upload: 'อัปโหลดรูปจากเครื่อง', back: '← ย้อนกลับ',
    errFirstName: 'กรุณากรอกชื่อ', errLastName: 'กรุณากรอกนามสกุล',
    errAge: 'กรุณากรอกอายุที่ถูกต้อง (1-120 ปี)',
    errGender: 'กรุณาเลือกเพศ', errRole: 'กรุณาเลือกสถานะของคุณ',
    errGrade: 'กรุณาเลือกระดับชั้น', errPin: 'กรุณาตั้ง PIN 4 หลัก',
    errPinMatch: 'PIN ไม่ตรงกัน', errAgeEmpty: 'กรุณากรอกอายุ',
    errAgeMismatch: 'อายุไม่ตรงกับที่ลงทะเบียน กรุณาลองใหม่',
    errCamera: 'ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์',
  },
  en: {
    step1Title: 'Personal Info',
    step2Title: 'Identity Verification',
    step1Sub: 'Enter your details to get started',
    step2Sub: 'Verify age and scan your face',
    firstName: 'First Name', firstNamePh: 'Enter your first name',
    lastName: 'Last Name', lastNamePh: 'Enter your last name',
    age: 'Age', agePh: 'Enter your age',
    gender: 'Gender',
    role: 'Role',
    gradeLevel: 'Grade Level',
    gMale: 'Male', gFemale: 'Female',
    rStudent: 'Student', rTeacher: 'Teacher', rGeneral: 'General',
    grpElem: 'Elementary', grpJunior: 'Junior Secondary',
    grpSenior: 'Senior Secondary', grpVoc: 'Vocational',
    pin: 'Set 4-digit PIN (for login)', confirmPin: 'Confirm PIN',
    next: 'Next',
    ageVerifiedLabel: 'Age Verified', ageVerifyLabel: 'Verify Your Age',
    ageConfirmGuide: 'Re-enter your age to confirm',
    ageConfirmPh: 'Enter age', ageConfirmBtn: 'Confirm',
    ageVerifiedMsg: (age) => `Age ${age} — Verified`,
    openingCamera: 'Opening camera...',
    faceGuide: 'Position face in the oval, then tap Scan',
    faceCaptured: 'Face scan successful!',
    getStarted: 'Get Started', retake: 'Retake', tryAgain: 'Try Again',
    scanning: 'Scanning...', scanFace: 'Scan Face',
    or: 'or', upload: 'Upload from device', back: '← Back',
    errFirstName: 'Please enter first name', errLastName: 'Please enter last name',
    errAge: 'Please enter valid age (1-120)',
    errGender: 'Please select gender', errRole: 'Please select your role',
    errGrade: 'Please select grade level', errPin: 'Please set a 4-digit PIN',
    errPinMatch: 'PINs do not match', errAgeEmpty: 'Please enter age',
    errAgeMismatch: "Age doesn't match. Please try again.",
    errCamera: 'Cannot access camera. Please allow camera in your browser.',
  },
}

export default function Register() {
  const { registerUser } = useHealth()
  const [step, setStep] = useState(1)
  const [lang, setLang] = useState('th')
  const [form, setForm] = useState({ firstName: '', lastName: '', age: '', gender: '', role: '', gradeLevel: '', pin: '', confirmPin: '' })
  const [errors, setErrors] = useState({})
  const [registering, setRegistering] = useState(false)

  const t = LANG[lang]

  // step 2 — age verification
  const [ageConfirm, setAgeConfirm] = useState('')
  const [ageConfirmError, setAgeConfirmError] = useState(null)
  const [ageVerified, setAgeVerified] = useState(false)

  // camera
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const uploadRef = useRef(null)
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
      streamRef.current.getTracks().forEach(tr => tr.stop())
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
      setCameraError(t.errCamera)
    }
  }

  function validateStep1() {
    const e = {}
    if (!form.firstName.trim()) e.firstName = t.errFirstName
    if (!form.lastName.trim()) e.lastName = t.errLastName
    const age = parseInt(form.age)
    if (!form.age || isNaN(age) || age < 1 || age > 120) e.age = t.errAge
    if (!form.gender) e.gender = t.errGender
    if (!form.role) e.role = t.errRole
    if (form.role === 'นักเรียน' && !form.gradeLevel) e.gradeLevel = t.errGrade
    if (!form.pin || form.pin.length !== 4) e.pin = t.errPin
    if (form.pin && form.confirmPin !== form.pin) e.confirmPin = t.errPinMatch
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
      setAgeConfirmError(t.errAgeEmpty)
      return
    }
    if (entered !== parseInt(form.age)) {
      setAgeConfirmError(t.errAgeMismatch)
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

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setCaptured(ev.target.result)
      stopCamera()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleRegister(faceImage = captured) {
    setRegistering(true)
    try {
      await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        role: form.role,
        gradeLevel: form.role === 'นักเรียน' ? form.gradeLevel : '',
        pin: form.pin,
        faceImage: faceImage ?? null,
      })
    } finally {
      setRegistering(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'
    } focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder-slate-400`

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* language toggle */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-500 transition-colors"
          >
            {lang === 'th' ? '🇺🇸 EN' : '🇹🇭 ไทย'}
          </button>
        </div>

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
            {step === 1 ? t.step1Title : t.step2Title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 ? t.step1Sub : t.step2Sub}
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.firstName}</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => { setForm(p => ({ ...p, firstName: e.target.value })); setErrors(p => ({ ...p, firstName: undefined })) }}
                placeholder={t.firstNamePh}
                className={inputClass('firstName')}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.lastName}</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => { setForm(p => ({ ...p, lastName: e.target.value })); setErrors(p => ({ ...p, lastName: undefined })) }}
                placeholder={t.lastNamePh}
                className={inputClass('lastName')}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.age}</label>
              <input
                type="number"
                value={form.age}
                onChange={e => { setForm(p => ({ ...p, age: e.target.value })); setErrors(p => ({ ...p, age: undefined })) }}
                placeholder={t.agePh}
                min="1"
                max="120"
                className={inputClass('age')}
              />
              {errors.age && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.gender}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ชาย',   label: t.gMale,   emoji: '♂',       bg: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-600',   ring: 'ring-blue-400' },
                  { value: 'หญิง',  label: t.gFemale, emoji: '♀',       bg: 'bg-pink-50',   border: 'border-pink-400',   text: 'text-pink-600',   ring: 'ring-pink-400' },
                  { value: 'LGBTQ+',label: 'LGBTQ+',  emoji: '🏳️‍🌈', bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', ring: 'ring-purple-400' },
                ].map(({ value, label, emoji, bg, border, text, ring }) => (
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
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.gender}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.role}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'นักเรียน',     label: t.rStudent, emoji: '🎒',  color: 'blue' },
                  { value: 'ครู',           label: t.rTeacher, emoji: '👩‍🏫', color: 'green' },
                  { value: 'บุคคลทั่วไป', label: t.rGeneral, emoji: '👤',  color: 'slate' },
                ].map(({ value, label, emoji, color }) => {
                  const active = form.role === value
                  const styles = {
                    blue:  { active: 'bg-blue-50 border-blue-400 text-blue-700 ring-blue-400',    inactive: '' },
                    green: { active: 'bg-green-50 border-green-400 text-green-700 ring-green-400', inactive: '' },
                    slate: { active: 'bg-slate-100 border-slate-500 text-slate-700 ring-slate-400', inactive: '' },
                  }
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setForm(p => ({ ...p, role: value, gradeLevel: '' }))
                        setErrors(p => ({ ...p, role: undefined, gradeLevel: undefined }))
                      }}
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${
                        active
                          ? `${styles[color].active} ring-2 ring-offset-1`
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-xs leading-tight text-center">{label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.role && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.role}</p>}
            </div>

            {/* Grade level — only for นักเรียน */}
            {form.role === 'นักเรียน' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.gradeLevel}</label>
                <div className="space-y-2">
                  {[
                    { group: t.grpElem,   grades: ['ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'] },
                    { group: t.grpJunior, grades: ['ม.1','ม.2','ม.3'] },
                    { group: t.grpSenior, grades: ['ม.4','ม.5','ม.6'] },
                    { group: t.grpVoc,    grades: ['ปวช.1','ปวช.2','ปวช.3','ปวส.1','ปวส.2'] },
                  ].map(({ group, grades }) => (
                    <div key={group}>
                      <p className="text-[11px] text-slate-400 font-medium mb-1.5 uppercase tracking-wide">{group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {grades.map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setForm(p => ({ ...p, gradeLevel: g }))
                              setErrors(p => ({ ...p, gradeLevel: undefined }))
                            }}
                            className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${
                              form.gradeLevel === g
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.gradeLevel && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.gradeLevel}</p>}
              </div>
            )}

            {/* PIN */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Lock size={13} className="inline mr-1 mb-0.5" />{t.pin}
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.confirmPin}</label>
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
              {t.next} <ChevronRight size={18} />
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
                  {ageVerified ? t.ageVerifiedLabel : t.ageVerifyLabel}
                </p>
              </div>

              {ageVerified ? (
                <p className="text-green-700 text-sm text-center py-1">
                  {t.ageVerifiedMsg(form.age)}
                </p>
              ) : (
                <>
                  <p className="text-slate-500 text-xs mb-2">{t.ageConfirmGuide}</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ageConfirm}
                      onChange={e => { setAgeConfirm(e.target.value); setAgeConfirmError(null) }}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyAge()}
                      placeholder={t.ageConfirmPh}
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
                      {t.ageConfirmBtn}
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
                          <p className="text-sm">{t.openingCamera}</p>
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
                    {t.faceGuide}
                  </p>
                )}
                {captured && (
                  <p className="text-center text-green-600 text-sm font-medium -mt-2">
                    {t.faceCaptured}
                  </p>
                )}

                <div className="space-y-3">
                  {captured ? (
                    <>
                      <button
                        onClick={() => handleRegister(captured)}
                        disabled={registering}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70"
                      >
                        {registering
                          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> กำลังสมัคร...</>
                          : <><Check size={18} /> {t.getStarted}</>}
                      </button>
                      <button
                        onClick={retake}
                        disabled={registering}
                        className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={15} /> {t.retake}
                      </button>
                    </>
                  ) : cameraError ? (
                    <>
                      <button
                        onClick={() => { setCameraError(null); startCamera() }}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {t.tryAgain}
                      </button>
                      <button
                        onClick={() => handleRegister(null)}
                        disabled={registering}
                        className="w-full py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <ChevronRight size={15} />
                        {lang === 'th' ? 'ข้ามขั้นตอนนี้ (ไม่มีรูปโปรไฟล์)' : 'Skip (no profile photo)'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startScan}
                        disabled={!cameraReady || scanning}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera size={18} />
                        {scanning ? t.scanning : t.scanFace}
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400">{t.or}</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <button
                        onClick={() => uploadRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-500 hover:text-blue-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <Upload size={16} /> {t.upload}
                      </button>
                      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-300">{t.or}</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                      <button
                        onClick={() => handleRegister(null)}
                        disabled={registering}
                        className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 text-sm font-medium hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <ChevronRight size={15} />
                        {lang === 'th' ? 'ข้ามขั้นตอนนี้ (เพิ่มรูปภายหลังได้)' : 'Skip for now (add photo later)'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {!captured && (
              <button
                onClick={() => { stopCamera(); setAgeVerified(false); setAgeConfirm(''); setStep(1) }}
                className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-1"
              >
                {t.back}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
