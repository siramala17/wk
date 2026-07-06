import React, { useState } from 'react'
import { Check, ChevronLeft, AlertCircle, FlaskConical, Lock } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { submitResearchConsent } from '../services/userSync'

const GRADE_OPTIONS = [
  'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6',
  'มัธยมศึกษาปีที่ 1', 'มัธยมศึกษาปีที่ 2', 'มัธยมศึกษาปีที่ 3',
  'มัธยมศึกษาปีที่ 4', 'มัธยมศึกษาปีที่ 5', 'มัธยมศึกษาปีที่ 6',
  'ปวช./ปวส.', 'อื่น ๆ',
]

// map full grade name → short key used in user account
const GRADE_MAP = {
  'ประถมศึกษาปีที่ 4': 'ป.4', 'ประถมศึกษาปีที่ 5': 'ป.5', 'ประถมศึกษาปีที่ 6': 'ป.6',
  'มัธยมศึกษาปีที่ 1': 'ม.1', 'มัธยมศึกษาปีที่ 2': 'ม.2', 'มัธยมศึกษาปีที่ 3': 'ม.3',
  'มัธยมศึกษาปีที่ 4': 'ม.4', 'มัธยมศึกษาปีที่ 5': 'ม.5', 'มัธยมศึกษาปีที่ 6': 'ม.6',
  'ปวช./ปวส.': 'ปวช./ปวส.', 'อื่น ๆ': 'อื่น ๆ',
}

const CONSENT_ITEMS = [
  { key: 'consentData',    label: 'ยินยอมให้นำข้อมูลส่วนตัวไปใช้เพื่อการวิจัย (ปกปิดตัวตน)', required: true },
  { key: 'consentHealth',  label: 'ยินยอมให้นำข้อมูลสุขภาพไปใช้เพื่อการวิจัยและพัฒนาระบบ',   required: true },
  { key: 'consentPublish', label: 'ยินยอมให้เผยแพร่ผลการวิจัยในรูปแบบภาพรวม (ไม่ระบุชื่อ)', required: true },
  { key: 'consentContact', label: 'ยินยอมให้ติดต่อกลับเพื่อติดตามผลการวิจัย (ไม่บังคับ)',     required: false },
]

export default function ResearchRegister() {
  const { setShowResearch, registerUser } = useHealth()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', gender: '',
    school: '', gradeLevel: '', parentPhone: '', phone: '',
    pin: '', confirmPin: '',
  })
  const [consent, setConsent] = useState({
    consentData: false, consentHealth: false, consentPublish: false, consentContact: false,
  })

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); setError('') }
  function toggleConsent(key) { setConsent(p => ({ ...p, [key]: !p[key] })); setError('') }

  function validateStep1() {
    if (!form.firstName.trim()) return 'กรุณากรอกชื่อ'
    if (!form.lastName.trim()) return 'กรุณากรอกนามสกุล'
    if (!form.age || isNaN(form.age) || +form.age < 1 || +form.age > 120) return 'กรุณากรอกอายุที่ถูกต้อง'
    if (!form.gender) return 'กรุณาเลือกเพศ'
    if (!form.school.trim()) return 'กรุณากรอกชื่อโรงเรียน/สถาบัน'
    if (!form.gradeLevel) return 'กรุณาเลือกระดับชั้น'
    if (!form.pin || form.pin.length !== 4) return 'กรุณาตั้ง PIN 4 หลัก'
    if (form.pin !== form.confirmPin) return 'PIN ไม่ตรงกัน'
    return ''
  }

  function handleNext() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError(''); setStep(2)
  }

  async function handleSubmit() {
    const missing = CONSENT_ITEMS.filter(c => c.required && !consent[c.key])
    if (missing.length) { setError('กรุณายินยอมทุกข้อที่มีเครื่องหมาย *'); return }
    setError(''); setSubmitting(true)
    try {
      // สร้าง user account เพื่อเข้าใช้แอปได้เลย
      await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: +form.age,
        gender: form.gender,
        role: 'นักเรียน',
        gradeLevel: GRADE_MAP[form.gradeLevel] || form.gradeLevel,
        pin: form.pin,
        faceImage: null,
      })
      // บันทึกข้อมูลวิจัยแยกใน Firestore (background)
      submitResearchConsent({
        id: Date.now(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: +form.age,
        gender: form.gender,
        school: form.school.trim(),
        gradeLevel: form.gradeLevel,
        parentPhone: form.parentPhone.trim(),
        phone: form.phone.trim(),
        consent,
        registeredAt: new Date().toISOString(),
      }).catch(() => {})
      setStep(3)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  const inp = 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 placeholder-slate-400 text-sm'

  function renderForm() {
    return (
      <div>
        {/* Back + title */}
        <div className="flex items-center gap-2 mb-5">
          {step < 3 && (
            <button
              onClick={step === 1 ? () => setShowResearch(false) : () => { setStep(1); setError('') }}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-100">
              <FlaskConical size={16} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 leading-none">ลงทะเบียนผู้เข้าร่วมวิจัย</div>
              <div className="text-[10px] text-slate-400 mt-0.5">W.K. Smart Teen Health AI</div>
            </div>
          </div>
          {step < 3 && (
            <div className="ml-auto flex items-center gap-1.5">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-purple-600' : s < step ? 'w-3 bg-purple-300' : 'w-3 bg-slate-200'}`} />
              ))}
            </div>
          )}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">ข้อมูลผู้เข้าร่วมวิจัย</h1>
              <p className="text-slate-400 text-xs mt-1">กรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียนและเข้าใช้งานแอป</p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 flex gap-3">
              <FlaskConical size={15} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700 leading-relaxed">
                โครงการวิจัย: <span className="font-semibold">W.K. Smart Teen Health AI</span><br/>
                ข้อมูลทั้งหมดจะถูกเก็บรักษาความลับและใช้เพื่อการวิจัยเท่านั้น
              </p>
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อ <span className="text-red-400">*</span></label>
                <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="ชื่อจริง" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">นามสกุล <span className="text-red-400">*</span></label>
                <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="นามสกุล" className={inp} />
              </div>
            </div>

            {/* อายุ + เพศ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">อายุ <span className="text-red-400">*</span></label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="อายุ (ปี)" min="1" max="120" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">เพศ <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { v: 'ชาย',    e: '♂',        cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
                    { v: 'หญิง',   e: '♀',        cls: 'bg-pink-50 border-pink-400 text-pink-700' },
                    { v: 'อื่น ๆ', e: '🏳️‍🌈',  cls: 'bg-purple-50 border-purple-400 text-purple-700' },
                  ].map(({ v, e, cls }) => (
                    <button key={v} type="button" onClick={() => set('gender', v)}
                      className={`flex flex-col items-center py-2 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 ${form.gender === v ? cls : 'border-slate-200 text-slate-500'}`}>
                      <span>{e}</span><span className="leading-tight">{v}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* โรงเรียน */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">โรงเรียน / สถาบัน <span className="text-red-400">*</span></label>
              <input value={form.school} onChange={e => set('school', e.target.value)} placeholder="เช่น โรงเรียนวังน้ำเย็นวิทยาคม" className={inp} />
            </div>

            {/* ระดับชั้น */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ระดับชั้น <span className="text-red-400">*</span></label>
              <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)} className={inp + ' bg-white'}>
                <option value="">เลือกระดับชั้น</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* เบอร์โทร */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">เบอร์โทรผู้ปกครอง</label>
                <input type="tel" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} placeholder="0xx-xxx-xxxx" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">เบอร์โทรตนเอง</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0xx-xxx-xxxx" className={inp} />
              </div>
            </div>

            {/* PIN */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Lock size={12} /> ตั้งรหัส PIN สำหรับเข้าสู่ระบบครั้งถัดไป
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">PIN 4 หลัก <span className="text-red-400">*</span></label>
                  <input
                    type="password" inputMode="numeric" maxLength={4}
                    value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))}
                    placeholder="● ● ● ●"
                    className={inp + ' text-center text-2xl tracking-[0.5em]'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">ยืนยัน PIN <span className="text-red-400">*</span></label>
                  <input
                    type="password" inputMode="numeric" maxLength={4}
                    value={form.confirmPin} onChange={e => set('confirmPin', e.target.value.replace(/\D/g, ''))}
                    placeholder="● ● ● ●"
                    className={inp + ' text-center text-2xl tracking-[0.5em]'}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button onClick={handleNext}
              className="w-full mt-2 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              ถัดไป <ChevronLeft size={18} className="rotate-180" />
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">ใบยินยอมเข้าร่วมวิจัย</h1>
              <p className="text-slate-400 text-xs mt-1">กรุณาอ่านและยินยอมก่อนดำเนินการต่อ</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
              <p className="font-bold text-slate-800 text-sm">📋 รายละเอียดโครงการวิจัย</p>
              <p className="text-xs text-slate-600">ชื่อโครงการ: <span className="font-semibold">การพัฒนาและประเมินประสิทธิภาพระบบ W.K. Smart Teen Health AI สำหรับส่งเสริมพฤติกรรมสุขภาพวัยรุ่น</span></p>
              <p className="text-xs text-slate-600">ผู้วิจัย: คณะวิจัย W.K. Health · ระยะเวลา: ตลอดช่วงที่ใช้งานแอปพลิเคชัน</p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700">
                ⚠️ ผู้เข้าร่วมสามารถถอนตัวจากการวิจัยได้ทุกเมื่อ โดยแจ้งผู้วิจัยโดยตรง
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-sm font-bold text-slate-700">การยินยอม</p>
              {CONSENT_ITEMS.map(item => (
                <button key={item.key} onClick={() => toggleConsent(item.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${consent[item.key] ? 'bg-purple-50 border-purple-300' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${consent[item.key] ? 'bg-purple-600' : 'bg-slate-200'}`}>
                    {consent[item.key] && <Check size={12} className="text-white" />}
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">
                    {item.label}
                    {item.required && <span className="text-red-400 ml-1">*</span>}
                  </p>
                </button>
              ))}
              <p className="text-[11px] text-slate-400">* ต้องยินยอมทุกข้อที่มีเครื่องหมาย * เพื่อดำเนินการต่อ</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> กำลังสร้างบัญชี...</>
                : <><Check size={18} /> ยืนยันและเริ่มใช้งาน</>}
            </button>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={40} className="text-green-600" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">ลงทะเบียนสำเร็จ!</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                ยินดีต้อนรับ คุณ{form.firstName} {form.lastName}<br/>
                บัญชีของคุณพร้อมใช้งานแล้ว
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 w-full text-left space-y-1.5">
              <p className="text-xs font-semibold text-purple-700 mb-2">ข้อมูลที่ลงทะเบียน</p>
              {[
                ['ชื่อ-นามสกุล', `${form.firstName} ${form.lastName}`],
                ['อายุ', `${form.age} ปี`],
                ['เพศ', form.gender],
                ['โรงเรียน', form.school],
                ['ระดับชั้น', form.gradeLevel],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-700">{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowResearch(false)}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              เข้าสู่แอปพลิเคชัน →
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backgroundImage: 'url(/bg-login.jpg)',
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,20,80,0.45)', pointerEvents: 'none' }} />

      {/* desktop left */}
      <div className="hidden lg:flex" style={{ position: 'absolute', left: 0, bottom: 0, width: '20%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ fontSize: 'clamp(80px,9vw,140px)', lineHeight: 1, filter: 'drop-shadow(0 0 24px rgba(139,92,246,.6))' }}>🔬</div>
        <div style={{ width: '85%', height: 3, background: 'linear-gradient(90deg,transparent,#7c3aed,transparent)', marginTop: 4 }} />
      </div>

      {/* desktop right */}
      <div className="hidden lg:flex" style={{ position: 'absolute', right: 0, bottom: 0, width: '20%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ fontSize: 'clamp(80px,9vw,140px)', lineHeight: 1, filter: 'drop-shadow(0 0 24px rgba(245,158,11,.6))', transform: 'scaleX(-1)' }}>🧬</div>
        <div style={{ width: '85%', height: 3, background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)', marginTop: 4 }} />
      </div>

      {/* logo top center */}
      <div className="hidden lg:flex" style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', alignItems: 'center', gap: 8, zIndex: 20 }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔬</div>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '.5px', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>W.K. Health Research</span>
      </div>

      {/* ══ PHONE FRAME (lg+) ══ */}
      <div className="hidden lg:block" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          width: 390, background: '#0f172a', borderRadius: 52, padding: '12px 10px 20px',
          boxShadow: '0 0 0 2px #1e293b, 0 0 0 4px #334155, 0 32px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', left: -4, top: 110, width: 4, height: 36, background: '#1e293b', borderRadius: '3px 0 0 3px' }} />
          <div style={{ position: 'absolute', left: -4, top: 158, width: 4, height: 56, background: '#1e293b', borderRadius: '3px 0 0 3px' }} />
          <div style={{ position: 'absolute', left: -4, top: 224, width: 4, height: 56, background: '#1e293b', borderRadius: '3px 0 0 3px' }} />
          <div style={{ position: 'absolute', right: -4, top: 148, width: 4, height: 72, background: '#1e293b', borderRadius: '0 3px 3px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 0', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>9:41</span>
            <div style={{ width: 90, height: 20, background: '#0f172a', borderRadius: 20, border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e293b' }} />
              <div style={{ width: 40, height: 8, borderRadius: 4, background: '#1e293b' }} />
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>●●●</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>▊</span>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 42, overflow: 'hidden', height: 680, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#f8fafc', padding: '8px 20px 4px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔬</div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#4c1d95' }}>W.K. Health Research</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 16px' }}>
              {renderForm()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 10px', flexShrink: 0 }}>
              <div style={{ width: 100, height: 4, background: '#cbd5e1', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE / TABLET ══ */}
      <div className="lg:hidden w-full" style={{ position: 'relative', zIndex: 10, maxWidth: 460, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔬</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>W.K. Health Research</span>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-2xl p-6">
          {renderForm()}
        </div>
      </div>
    </div>
  )
}
