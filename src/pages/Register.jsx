import React, { useState, useRef, useEffect } from 'react'
import { Camera, User, ChevronRight, Check, RefreshCw, AlertCircle, Lock, Upload, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
    consentTitle: 'นโยบายความเป็นส่วนตัว',
    consentSub: 'กรุณาอ่านและยินยอมก่อนสมัครสมาชิก',
    consentDataLabel: 'ยินยอมให้ใช้ข้อมูลเพื่อการศึกษาและวิจัย',
    consentDataDesc: 'ข้อมูลสุขภาพของคุณจะถูกนำไปใช้เพื่อการศึกษาและพัฒนาระบบ โดยปกปิดข้อมูลส่วนตัวทั้งหมด',
    consentCameraLabel: 'ยินยอมให้เข้าถึงกล้องถ่ายรูป',
    consentCameraDesc: 'ใช้กล้องสำหรับสแกนใบหน้าเพื่อยืนยันตัวตนในขั้นตอนสมัครสมาชิก',
    consentFilesLabel: 'ยินยอมให้เข้าถึงไฟล์และรูปภาพ',
    consentFilesDesc: 'ใช้สำหรับอัปโหลดรูปโปรไฟล์จากอุปกรณ์ของคุณ',
    consentAcceptBtn: 'ยืนยันและดำเนินการต่อ',
    consentDeclineBtn: 'ปฏิเสธ / กลับหน้าเข้าสู่ระบบ',
    consentNote: '* ต้องยินยอมทุกข้อเพื่อดำเนินการต่อ',
    consentHeaderSub: 'W.K. Health — กรุณาอ่านก่อนสมัครสมาชิก',
    consentCloseBtn: 'ปิด',
    consentDoc1Title: 'วัตถุประสงค์ของการเก็บข้อมูล',
    consentDoc1Body: 'ระบบ W.K. Health เก็บข้อมูลเพื่อประเมินและติดตามสุขภาพของผู้ใช้ นำเสนอคำแนะนำสุขภาพที่เหมาะสมเฉพาะบุคคล และวิเคราะห์แนวโน้มสุขภาพเพื่อการวิจัยและพัฒนาระบบ',
    consentDoc2Title: 'ข้อมูลที่ระบบเก็บรวบรวม',
    consentDoc2PersonalTitle: '👤 ข้อมูลส่วนตัว',
    consentDoc2PersonalItems: ['ชื่อ-นามสกุล, อายุ, เพศ, บทบาท และระดับชั้น', 'รูปภาพใบหน้า (สำหรับยืนยันตัวตน)', 'รหัส PIN สำหรับเข้าสู่ระบบ'],
    consentDoc2HealthTitle: '📊 ข้อมูลสุขภาพ',
    consentDoc2HealthItems: ['น้ำหนัก, ส่วนสูง, ค่า BMI และองค์ประกอบร่างกาย', 'ผลการประเมินสุขภาพและกิจกรรมทางกาย', 'ประวัติการประเมินสุขภาพย้อนหลัง'],
    consentDoc3Title: 'การใช้ข้อมูลและการเปิดเผย',
    consentDoc3Items: [['3.1', 'ใช้เพื่อแสดงผลสุขภาพและคำแนะนำเฉพาะบุคคลเท่านั้น'], ['3.2', 'ข้อมูลนิรนามอาจใช้เพื่อการวิจัยและพัฒนาระบบสุขภาพ'], ['3.3', 'ไม่เปิดเผยข้อมูลส่วนตัวต่อบุคคลหรือองค์กรภายนอก']],
    consentDoc4Title: 'การรักษาความปลอดภัยของข้อมูล',
    consentDoc4Items: ['การเข้ารหัสข้อมูลระหว่างการรับ-ส่งและการจัดเก็บ', 'การกำหนดสิทธิ์การเข้าถึงตามบทบาทหน้าที่ของผู้ใช้', 'การบันทึกประวัติการเข้าใช้งานระบบ (Audit Log)'],
    consentDoc5Title: 'ข้อปฏิบัติสำหรับผู้ใช้งาน',
    consentDoc5Items: ['รักษาชื่อผู้ใช้และรหัส PIN เป็นความลับ ห้ามให้ผู้อื่นใช้แทน', 'ห้ามแก้ไข เพิ่มเติม หรือลบข้อมูลของผู้ใช้คนอื่น', 'ห้ามนำข้อมูลในระบบไปใช้เพื่อประโยชน์ส่วนตัว', 'หากพบข้อผิดพลาด กรุณาแจ้งผู้ดูแลระบบทันที'],
    consentPdpaLabel: '⚠️ หมายเหตุ:',
    consentPdpaText: 'ข้อมูลส่วนบุคคลทั้งหมดได้รับความคุ้มครองตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) การสมัครสมาชิกถือว่าท่านยินยอมให้เก็บและใช้ข้อมูลตามวัตถุประสงค์ที่ระบุข้างต้น',
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
    consentTitle: 'Privacy & Permissions',
    consentSub: 'Please read and agree before registering',
    consentDataLabel: 'Allow data use for research',
    consentDataDesc: 'Your health data will be used for educational and system development, with personal details kept anonymous.',
    consentCameraLabel: 'Allow camera access',
    consentCameraDesc: 'Used to scan your face for identity verification during registration.',
    consentFilesLabel: 'Allow file & image access',
    consentFilesDesc: 'Used to upload a profile photo from your device.',
    consentAcceptBtn: 'Confirm & Continue',
    consentDeclineBtn: 'Decline / Back to Login',
    consentNote: '* All consents are required to proceed',
    consentHeaderSub: 'W.K. Health — Please read before registering',
    consentCloseBtn: 'Close',
    consentDoc1Title: 'Purpose of Data Collection',
    consentDoc1Body: "W.K. Health collects data to assess and monitor users' health, provide personalized health recommendations, and analyze health trends for research and system development.",
    consentDoc2Title: 'Data Collected by the System',
    consentDoc2PersonalTitle: '👤 Personal Information',
    consentDoc2PersonalItems: ['Full name, age, gender, role, and grade level', 'Face photo (for identity verification)', '4-digit PIN for login'],
    consentDoc2HealthTitle: '📊 Health Information',
    consentDoc2HealthItems: ['Weight, height, BMI, and body composition', 'Health assessment and physical activity results', 'Health assessment history'],
    consentDoc3Title: 'Data Usage and Disclosure',
    consentDoc3Items: [['3.1', 'Used only to display health results and personalized recommendations'], ['3.2', 'Anonymous data may be used for health research and system development'], ['3.3', 'Personal information is not disclosed to external individuals or organizations']],
    consentDoc4Title: 'Data Security',
    consentDoc4Items: ['Encryption of data during transmission and storage', 'Role-based access control for system users', 'System access audit logging'],
    consentDoc5Title: 'User Guidelines',
    consentDoc5Items: ['Keep your username and PIN confidential — do not share with others', "Do not modify, add, or delete other users' data", 'Do not use system data for personal benefit', 'Report any errors or issues to the administrator immediately'],
    consentPdpaLabel: '⚠️ Note:',
    consentPdpaText: 'All personal data is protected under the Personal Data Protection Act B.E. 2562 (PDPA). By registering, you consent to the collection and use of your data as described above.',
  },
}

export default function Register() {
  const { registerUser, setShowRegister } = useHealth()
  const navigate = useNavigate()
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

  const [consentAccepted, setConsentAccepted] = useState(false)
  const [consents, setConsents] = useState({ data: false, camera: false, files: false })

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
    } focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 placeholder-slate-400`

  // ── single form render (refs live here only) ──────────────
  function renderForm() {
    return (
      <div>
        {/* language toggle */}
        <div className="flex justify-end mb-2">
          <button onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-500 transition-colors">
            {lang === 'th' ? '🇺🇸 EN' : '🇹🇭 ไทย'}
          </button>
        </div>

        {/* icon + title */}
        <div className="text-center mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2.5 ${step === 1 ? 'bg-indigo-100' : 'bg-yellow-100'}`}>
            {step === 1 ? <User size={28} className="text-indigo-600" /> : <Camera size={28} className="text-yellow-600" />}
          </div>
          <h1 className="text-xl font-bold text-slate-800">{step === 1 ? t.step1Title : t.step2Title}</h1>
          <p className="text-slate-400 text-xs mt-1">{step === 1 ? t.step1Sub : t.step2Sub}</p>
        </div>

        {/* step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-400'}`}>
            {step > 1 ? <Check size={14} /> : '1'}
          </div>
          <div className={`h-1 w-14 rounded-full transition-colors ${step > 1 ? 'bg-indigo-500' : 'bg-indigo-100'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-400'}`}>2</div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.firstName}</label>
              <input type="text" value={form.firstName} onChange={e => { setForm(p => ({ ...p, firstName: e.target.value })); setErrors(p => ({ ...p, firstName: undefined })) }} placeholder={t.firstNamePh} className={inputClass('firstName')} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.lastName}</label>
              <input type="text" value={form.lastName} onChange={e => { setForm(p => ({ ...p, lastName: e.target.value })); setErrors(p => ({ ...p, lastName: undefined })) }} placeholder={t.lastNamePh} className={inputClass('lastName')} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.age}</label>
              <input type="number" value={form.age} onChange={e => { setForm(p => ({ ...p, age: e.target.value })); setErrors(p => ({ ...p, age: undefined })) }} placeholder={t.agePh} min="1" max="120" className={inputClass('age')} />
              {errors.age && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.gender}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value:'ชาย',   label:t.gMale,   emoji:'♂',        bg:'bg-indigo-50',   border:'border-indigo-400',   text:'text-indigo-600',   ring:'ring-indigo-400' },
                  { value:'หญิง',  label:t.gFemale, emoji:'♀',        bg:'bg-pink-50',   border:'border-pink-400',   text:'text-pink-600',   ring:'ring-pink-400' },
                  { value:'LGBTQ+',label:'LGBTQ+',  emoji:'🏳️‍🌈',  bg:'bg-purple-50', border:'border-purple-400', text:'text-purple-600', ring:'ring-purple-400' },
                ].map(({ value, label, emoji, bg, border, text, ring }) => (
                  <button key={value} type="button" onClick={() => { setForm(p => ({ ...p, gender: value })); setErrors(p => ({ ...p, gender: undefined })) }}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${form.gender === value ? `${bg} ${border} ${text} ring-2 ${ring} ring-offset-1` : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <span className="text-xl">{emoji}</span><span>{label}</span>
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.gender}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.role}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value:'นักเรียน',    label:t.rStudent, emoji:'🎒',   color:'blue' },
                  { value:'ครู',          label:t.rTeacher, emoji:'👩‍🏫', color:'green' },
                  { value:'บุคคลทั่วไป',label:t.rGeneral, emoji:'👤',   color:'slate' },
                ].map(({ value, label, emoji, color }) => {
                  const active = form.role === value
                  const s = { blue:'bg-indigo-50 border-indigo-400 text-indigo-700 ring-indigo-400', green:'bg-green-50 border-green-400 text-green-700 ring-green-400', slate:'bg-slate-100 border-slate-500 text-slate-700 ring-slate-400' }
                  return (
                    <button key={value} type="button" onClick={() => { setForm(p => ({ ...p, role: value, gradeLevel: '' })); setErrors(p => ({ ...p, role: undefined, gradeLevel: undefined })) }}
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${active ? `${s[color]} ring-2 ring-offset-1` : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <span className="text-xl">{emoji}</span><span className="text-xs leading-tight text-center">{label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.role && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.role}</p>}
            </div>
            {form.role === 'นักเรียน' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.gradeLevel}</label>
                <div className="space-y-2">
                  {[
                    { group:t.grpElem,   grades:['ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'] },
                    { group:t.grpJunior, grades:['ม.1','ม.2','ม.3'] },
                    { group:t.grpSenior, grades:['ม.4','ม.5','ม.6'] },
                    { group:t.grpVoc,    grades:['ปวช.1','ปวช.2','ปวช.3','ปวส.1','ปวส.2'] },
                  ].map(({ group, grades }) => (
                    <div key={group}>
                      <p className="text-[11px] text-slate-400 font-medium mb-1.5 uppercase tracking-wide">{group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {grades.map(g => (
                          <button key={g} type="button" onClick={() => { setForm(p => ({ ...p, gradeLevel: g })); setErrors(p => ({ ...p, gradeLevel: undefined })) }}
                            className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${form.gradeLevel === g ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}>
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5"><Lock size={13} className="inline mr-1 mb-0.5" />{t.pin}</label>
              <input type="password" inputMode="numeric" maxLength={4} value={form.pin} onChange={e => { setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g,'') })); setErrors(p => ({ ...p, pin: undefined })) }} placeholder="● ● ● ●" className={`${inputClass('pin')} text-center text-2xl tracking-[0.5em]`} />
              {errors.pin && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.pin}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.confirmPin}</label>
              <input type="password" inputMode="numeric" maxLength={4} value={form.confirmPin} onChange={e => { setForm(p => ({ ...p, confirmPin: e.target.value.replace(/\D/g,'') })); setErrors(p => ({ ...p, confirmPin: undefined })) }} placeholder="● ● ● ●" className={`${inputClass('confirmPin')} text-center text-2xl tracking-[0.5em]`} />
              {errors.confirmPin && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPin}</p>}
            </div>
            <button onClick={handleNext} className="w-full mt-2 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all">
              {t.next} <ChevronRight size={18} />
            </button>
            <div className="text-center pt-2 border-t border-slate-100">
              <button onClick={() => navigate('/admin')} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <Shield size={12} /> สำหรับผู้ดูแลระบบ
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className={`rounded-2xl border-2 p-4 transition-colors ${ageVerified ? 'border-green-400 bg-green-50' : 'border-indigo-200 bg-indigo-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${ageVerified ? 'bg-green-500' : 'bg-indigo-500'}`}>
                  {ageVerified ? <Check size={14} className="text-white" /> : <Lock size={14} className="text-white" />}
                </div>
                <p className="text-sm font-semibold text-slate-700">{ageVerified ? t.ageVerifiedLabel : t.ageVerifyLabel}</p>
              </div>
              {ageVerified ? (
                <p className="text-green-700 text-sm text-center py-1">{t.ageVerifiedMsg(form.age)}</p>
              ) : (
                <>
                  <p className="text-slate-500 text-xs mb-2">{t.ageConfirmGuide}</p>
                  <div className="flex gap-2">
                    <input type="number" value={ageConfirm} onChange={e => { setAgeConfirm(e.target.value); setAgeConfirmError(null) }} onKeyDown={e => e.key === 'Enter' && handleVerifyAge()} placeholder={t.ageConfirmPh} min="1" max="120"
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-sm ${ageConfirmError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800`} />
                    <button onClick={handleVerifyAge} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">{t.ageConfirmBtn}</button>
                  </div>
                  {ageConfirmError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{ageConfirmError}</p>}
                </>
              )}
            </div>
            {ageVerified && (
              <>
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 p-4">
                      <AlertCircle size={40} /><p className="text-sm text-center">{cameraError}</p>
                    </div>
                  ) : captured ? (
                    <>
                      <img src={captured} alt="face" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg"><Check size={40} className="text-white" strokeWidth={3} /></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`w-44 h-52 border-4 rounded-[50%] transition-colors ${scanning ? 'border-yellow-400 animate-pulse' : 'border-white/70'}`} />
                      </div>
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
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
                {!captured && !cameraError && <p className="text-center text-slate-400 text-xs -mt-2">{t.faceGuide}</p>}
                {captured && <p className="text-center text-green-600 text-sm font-medium -mt-2">{t.faceCaptured}</p>}
                <div className="space-y-3">
                  {captured ? (
                    <>
                      <button onClick={() => handleRegister(captured)} disabled={registering} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70">
                        {registering ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> กำลังสมัคร...</> : <><Check size={18} /> {t.getStarted}</>}
                      </button>
                      <button onClick={retake} disabled={registering} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50">
                        <RefreshCw size={15} /> {t.retake}
                      </button>
                    </>
                  ) : cameraError ? (
                    <>
                      <button onClick={() => { setCameraError(null); startCamera() }} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">{t.tryAgain}</button>
                      <button onClick={() => handleRegister(null)} disabled={registering} className="w-full py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <ChevronRight size={15} />{lang === 'th' ? 'ข้ามขั้นตอนนี้ (ไม่มีรูปโปรไฟล์)' : 'Skip (no profile photo)'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={startScan} disabled={!cameraReady || scanning} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Camera size={18} />{scanning ? t.scanning : t.scanFace}
                      </button>
                      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">{t.or}</span><div className="flex-1 h-px bg-slate-200" /></div>
                      <button onClick={() => uploadRef.current?.click()} className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                        <Upload size={16} /> {t.upload}
                      </button>
                      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-100" /><span className="text-xs text-slate-300">{t.or}</span><div className="flex-1 h-px bg-slate-100" /></div>
                      <button onClick={() => handleRegister(null)} disabled={registering} className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 text-sm font-medium hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <ChevronRight size={15} />{lang === 'th' ? 'ข้ามขั้นตอนนี้ (เพิ่มรูปภายหลังได้)' : 'Skip for now (add photo later)'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {!captured && (
              <button onClick={() => { stopCamera(); setAgeVerified(false); setAgeConfirm(''); setStep(1) }} className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-1">
                {t.back}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      minHeight:'100dvh', position:'relative', overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px',
      backgroundImage:'url(/bg-login.jpg)',
      backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat',
    }}>
      {/* overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,20,80,0.45)', pointerEvents:'none' }} />

      {/* ── Left character (desktop only) ── */}
      <div className="hidden lg:flex" style={{ position:'absolute', left:0, bottom:0, width:'20%', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', pointerEvents:'none', userSelect:'none' }}>
        <div style={{ fontSize:'clamp(80px,9vw,140px)', lineHeight:1, filter:'drop-shadow(0 0 24px rgba(59,130,246,.6))' }}>🏃</div>
        <div style={{ width:'85%', height:3, background:'linear-gradient(90deg,transparent,#6366f1,transparent)', marginTop:4 }} />
      </div>

      {/* ── Right character (desktop only) ── */}
      <div className="hidden lg:flex" style={{ position:'absolute', right:0, bottom:0, width:'20%', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', pointerEvents:'none', userSelect:'none' }}>
        <div style={{ fontSize:'clamp(80px,9vw,140px)', lineHeight:1, filter:'drop-shadow(0 0 24px rgba(251,191,36,.6))', transform:'scaleX(-1)' }}>💪</div>
        <div style={{ width:'85%', height:3, background:'linear-gradient(90deg,transparent,#fbbf24,transparent)', marginTop:4 }} />
      </div>

      {/* ── Logo top center (desktop) ── */}
      <div className="hidden lg:flex" style={{ position:'absolute', top:18, left:'50%', transform:'translateX(-50%)', alignItems:'center', gap:8, zIndex:20 }}>
        <div style={{ width:32, height:32, background:'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🏥</div>
        <span style={{ fontSize:15, fontWeight:800, color:'#fff', letterSpacing:'.5px', textShadow:'0 2px 8px rgba(0,0,0,.4)' }}>W.K. Health</span>
      </div>

      {/* ══ PHONE FRAME (desktop lg+) ══ */}
      <div className="hidden lg:block" style={{ position:'relative', zIndex:10 }}>
        {/* Outer phone shell */}
        <div style={{
          width:390, background:'#0f172a',
          borderRadius:52, padding:'12px 10px 20px',
          boxShadow:'0 0 0 2px #1e293b, 0 0 0 4px #334155, 0 32px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)',
          position:'relative',
        }}>
          {/* Side buttons */}
          <div style={{ position:'absolute', left:-4, top:110, width:4, height:36, background:'#1e293b', borderRadius:'3px 0 0 3px' }} />
          <div style={{ position:'absolute', left:-4, top:158, width:4, height:56, background:'#1e293b', borderRadius:'3px 0 0 3px' }} />
          <div style={{ position:'absolute', left:-4, top:224, width:4, height:56, background:'#1e293b', borderRadius:'3px 0 0 3px' }} />
          <div style={{ position:'absolute', right:-4, top:148, width:4, height:72, background:'#1e293b', borderRadius:'0 3px 3px 0' }} />

          {/* Status bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 22px 0', marginBottom:4 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#f1f5f9' }}>9:41</span>
            <div style={{ width:90, height:20, background:'#0f172a', borderRadius:20, border:'2px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#1e293b' }} />
              <div style={{ width:40, height:8, borderRadius:4, background:'#1e293b' }} />
            </div>
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <span style={{ fontSize:10, color:'#94a3b8' }}>●●●</span>
              <span style={{ fontSize:10, color:'#94a3b8' }}>▊</span>
            </div>
          </div>

          {/* Screen */}
          <div style={{ background:'white', borderRadius:42, overflow:'hidden', height:680, display:'flex', flexDirection:'column' }}>
            {/* Notch bar */}
            <div style={{ background:'#f8fafc', padding:'8px 20px 4px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
              <div style={{ width:28, height:28, background:'linear-gradient(135deg,#4f46e5,#4338ca)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🏥</div>
              <span style={{ fontSize:13, fontWeight:800, color:'#312e81' }}>W.K. Health</span>
              <div style={{ marginLeft:'auto', display:'flex', gap:3 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#34d399' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#f87171' }} />
              </div>
            </div>
            {/* Scrollable form inside phone */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 16px' }}>
              {renderForm()}
            </div>
            {/* Home indicator */}
            <div style={{ display:'flex', justifyContent:'center', padding:'8px 0 10px', flexShrink:0 }}>
              <div style={{ width:100, height:4, background:'#cbd5e1', borderRadius:2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE / TABLET (below lg) — plain card ══ */}
      <div className="lg:hidden w-full" style={{ position:'relative', zIndex:10, maxWidth:460, margin:'0 auto' }}>
        {/* Mobile top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🏥</div>
          <span style={{ fontSize:14, fontWeight:800, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,.4)' }}>W.K. Health</span>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-2xl p-6">
          {renderForm()}
        </div>
      </div>

      {/* ── Consent Modal ── */}
      {!consentAccepted && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          background: 'rgba(5, 12, 55, 0.96)',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            width: '100%', maxWidth: 440,
            background: 'white', borderRadius: 24,
            display: 'flex', flexDirection: 'column',
            maxHeight: '88vh',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>🔒</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{t.consentTitle}</h2>
                  <p style={{ margin: 0, fontSize: 10.5, color: '#64748b' }}>{t.consentHeaderSub}</p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>

              {/* Section 1 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>1</div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{t.consentDoc1Title}</p>
                </div>
                <p style={{ margin: '0 0 0 28px', fontSize: 11.5, color: '#475569', lineHeight: 1.65 }}>
                  {t.consentDoc1Body}
                </p>
              </div>

              {/* Section 2 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>2</div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{t.consentDoc2Title}</p>
                </div>
                <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '9px 12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11.5, fontWeight: 700, color: '#334155' }}>{t.consentDoc2PersonalTitle}</p>
                    {t.consentDoc2PersonalItems.map((item, i) => (
                      <p key={i} style={{ margin: 0, fontSize: 11, color: '#64748b', paddingLeft: 10 }}>• {item}</p>
                    ))}
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '9px 12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11.5, fontWeight: 700, color: '#334155' }}>{t.consentDoc2HealthTitle}</p>
                    {t.consentDoc2HealthItems.map((item, i) => (
                      <p key={i} style={{ margin: 0, fontSize: 11, color: '#64748b', paddingLeft: 10 }}>• {item}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>3</div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{t.consentDoc3Title}</p>
                </div>
                <div style={{ marginLeft: 28 }}>
                  {t.consentDoc3Items.map(([num, text]) => (
                    <p key={num} style={{ margin: '0 0 4px', fontSize: 11.5, color: '#475569', lineHeight: 1.55 }}>
                      <span style={{ fontWeight: 700, color: '#4f46e5' }}>{num}</span> {text}
                    </p>
                  ))}
                </div>
              </div>

              {/* Section 4 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>4</div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{t.consentDoc4Title}</p>
                </div>
                <div style={{ marginLeft: 28 }}>
                  {t.consentDoc4Items.map((item, i) => (
                    <p key={i} style={{ margin: '0 0 3px', fontSize: 11.5, color: '#475569' }}>• {item}</p>
                  ))}
                </div>
              </div>

              {/* Section 5 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>5</div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{t.consentDoc5Title}</p>
                </div>
                <div style={{ marginLeft: 28 }}>
                  {t.consentDoc5Items.map((item, i) => (
                    <p key={i} style={{ margin: '0 0 4px', fontSize: 11.5, color: '#475569', lineHeight: 1.55 }}>• {item}</p>
                  ))}
                </div>
              </div>

              {/* PDPA Notice */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '10px 13px', marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#92400e', lineHeight: 1.65 }}>
                  <span style={{ fontWeight: 700 }}>{t.consentPdpaLabel}</span> {t.consentPdpaText}
                </p>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { key: 'data',   label: t.consentDataLabel,   icon: '📊' },
                  { key: 'camera', label: t.consentCameraLabel, icon: '📷' },
                  { key: 'files',  label: t.consentFilesLabel,  icon: '📁' },
                ].map(({ key, label, icon }) => (
                  <label key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10,
                    border: `1.5px solid ${consents[key] ? '#4f46e5' : '#e2e8f0'}`,
                    background: consents[key] ? '#eef2ff' : '#f8fafc',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={consents[key]}
                      onChange={e => setConsents(p => ({ ...p, [key]: e.target.checked }))}
                      style={{ width: 15, height: 15, accentColor: '#4f46e5', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>{icon} {label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowRegister(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 11,
                  background: 'transparent', color: '#94a3b8',
                  fontWeight: 600, fontSize: 12.5,
                  border: '1.5px solid #e2e8f0', cursor: 'pointer',
                }}
              >{t.consentCloseBtn}</button>
              <button
                onClick={() => { if (consents.data && consents.camera && consents.files) setConsentAccepted(true) }}
                disabled={!(consents.data && consents.camera && consents.files)}
                style={{
                  flex: 2, padding: '10px 0', borderRadius: 11,
                  background: (consents.data && consents.camera && consents.files) ? '#4f46e5' : '#cbd5e1',
                  color: 'white', fontWeight: 700, fontSize: 13,
                  border: 'none', cursor: (consents.data && consents.camera && consents.files) ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
              >{t.consentAcceptBtn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
