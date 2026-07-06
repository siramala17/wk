import React, { useState } from 'react'
import { Check, ChevronLeft, AlertCircle, FlaskConical } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { submitResearchConsent } from '../services/userSync'

const GRADE_OPTIONS = [
  'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6',
  'มัธยมศึกษาปีที่ 1', 'มัธยมศึกษาปีที่ 2', 'มัธยมศึกษาปีที่ 3',
  'มัธยมศึกษาปีที่ 4', 'มัธยมศึกษาปีที่ 5', 'มัธยมศึกษาปีที่ 6',
  'ปวช./ปวส.', 'อื่น ๆ',
]

const CONSENT_ITEMS = [
  { key: 'consentData',   label: 'ยินยอมให้นำข้อมูลส่วนตัวไปใช้เพื่อการวิจัย (ปกปิดตัวตน)', required: true },
  { key: 'consentHealth', label: 'ยินยอมให้นำข้อมูลสุขภาพไปใช้เพื่อการวิจัยและพัฒนาระบบ', required: true },
  { key: 'consentPublish', label: 'ยินยอมให้เผยแพร่ผลการวิจัยในรูปแบบภาพรวม (ไม่ระบุชื่อ)', required: true },
  { key: 'consentContact', label: 'ยินยอมให้ติดต่อกลับเพื่อติดตามผลการวิจัย (ไม่บังคับ)', required: false },
]

export default function ResearchRegister() {
  const { setShowResearch } = useHealth()

  const [step, setStep] = useState(1) // 1=ข้อมูล 2=ยินยอม 3=สำเร็จ
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', gender: '',
    school: '', gradeLevel: '', parentPhone: '', phone: '',
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
    return ''
  }

  function validateStep2() {
    const missing = CONSENT_ITEMS.filter(c => c.required && !consent[c.key])
    if (missing.length > 0) return 'กรุณายินยอมทุกข้อที่มีเครื่องหมาย *'
    return ''
  }

  function handleNext() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  async function handleSubmit() {
    const err = validateStep2()
    if (err) { setError(err); return }
    setError('')
    setSubmitting(true)
    try {
      await submitResearchConsent({
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
      })
      setStep(3)
    } catch (e) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 bg-white shadow-sm">
        <button onClick={() => setShowResearch(false)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-purple-600" />
          <span className="font-bold text-slate-800 text-sm">ลงทะเบียนผู้เข้าร่วมวิจัย</span>
        </div>
        {step < 3 && (
          <div className="ml-auto flex items-center gap-1.5">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-purple-600' : s < step ? 'w-3 bg-purple-300' : 'w-3 bg-slate-200'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full">

        {/* ── Step 1: ข้อมูลผู้เข้าร่วม ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">ข้อมูลผู้เข้าร่วมวิจัย</h1>
              <p className="text-sm text-slate-500 mt-0.5">กรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียน</p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 flex gap-3">
              <FlaskConical size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700 leading-relaxed">
                โครงการวิจัย: <span className="font-semibold">W.K. Smart Teen Health AI</span><br/>
                ข้อมูลทั้งหมดจะถูกเก็บรักษาความลับและใช้เพื่อการวิจัยเท่านั้น
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
              {/* ชื่อ-นามสกุล */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อ <span className="text-red-400">*</span></label>
                  <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    placeholder="ชื่อจริง" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">นามสกุล <span className="text-red-400">*</span></label>
                  <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    placeholder="นามสกุล" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>

              {/* อายุ + เพศ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">อายุ <span className="text-red-400">*</span></label>
                  <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                    placeholder="อายุ (ปี)" min="1" max="120"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เพศ <span className="text-red-400">*</span></label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">เลือก</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="อื่น ๆ">อื่น ๆ</option>
                  </select>
                </div>
              </div>

              {/* โรงเรียน */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">โรงเรียน / สถาบัน <span className="text-red-400">*</span></label>
                <input value={form.school} onChange={e => set('school', e.target.value)}
                  placeholder="เช่น โรงเรียนวังน้ำเย็นวิทยาคม"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>

              {/* ระดับชั้น */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ระดับชั้น <span className="text-red-400">*</span></label>
                <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                  <option value="">เลือกระดับชั้น</option>
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* เบอร์โทร */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรผู้ปกครอง</label>
                  <input type="tel" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรตนเอง</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button onClick={handleNext}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-base shadow-md transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              ถัดไป →
            </button>
          </div>
        )}

        {/* ── Step 2: ใบยินยอม ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">ใบยินยอมเข้าร่วมวิจัย</h1>
              <p className="text-sm text-slate-500 mt-0.5">กรุณาอ่านและยินยอมก่อนดำเนินการต่อ</p>
            </div>

            {/* ข้อมูลวิจัย */}
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3 text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-800">📋 รายละเอียดโครงการวิจัย</p>
              <p>ชื่อโครงการ: <span className="font-semibold">การพัฒนาและประเมินประสิทธิภาพระบบ W.K. Smart Teen Health AI สำหรับส่งเสริมพฤติกรรมสุขภาพวัยรุ่น</span></p>
              <p>ผู้วิจัย: คณะวิจัย W.K. Health</p>
              <p>วัตถุประสงค์: เพื่อพัฒนาและประเมินระบบส่งเสริมสุขภาพวัยรุ่นโดยใช้ AI</p>
              <p>ระยะเวลา: ตลอดช่วงที่ใช้งานแอปพลิเคชัน</p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                ⚠️ ผู้เข้าร่วมสามารถถอนตัวจากการวิจัยได้ทุกเมื่อ โดยแจ้งผู้วิจัยโดยตรง
              </div>
            </div>

            {/* checkboxes */}
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <p className="text-sm font-bold text-slate-700 mb-2">การยินยอม</p>
              {CONSENT_ITEMS.map(item => (
                <button key={item.key} onClick={() => toggleConsent(item.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    consent[item.key] ? 'bg-purple-50 border-purple-300' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                    consent[item.key] ? 'bg-purple-600' : 'bg-slate-200'
                  }`}>
                    {consent[item.key] && <Check size={12} className="text-white" />}
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">
                    {item.label}
                    {item.required && <span className="text-red-400 ml-1">*</span>}
                  </p>
                </button>
              ))}
              <p className="text-[11px] text-slate-400 mt-1">* ต้องยินยอมทุกข้อที่มีเครื่องหมาย * เพื่อดำเนินการต่อ</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setStep(1); setError('') }}
                className="px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                ← กลับ
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</span>
                  : 'ยืนยันและลงทะเบียน ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: สำเร็จ ── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={40} className="text-green-600" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">ลงทะเบียนสำเร็จ!</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                ขอบคุณ คุณ{form.firstName} {form.lastName}<br/>
                ที่ร่วมเป็นส่วนหนึ่งของโครงการวิจัย W.K. Health<br/>
                ข้อมูลของคุณได้รับการบันทึกเรียบร้อยแล้ว
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 w-full text-left space-y-1.5">
              <p className="text-xs font-semibold text-purple-700 mb-2">สรุปข้อมูลที่ลงทะเบียน</p>
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
              className="w-full py-3.5 rounded-2xl font-bold text-white text-base shadow-md transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              กลับหน้าหลัก
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
