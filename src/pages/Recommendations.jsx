import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, Brain } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { generateRecommendations, getHealthLevel } from '../utils/healthScore'

function AiInsightBanner({ assessment }) {
  const level = getHealthLevel(assessment.overallScore)
  const weakAreas = [
    assessment.sleepScore     < 65 && 'การนอนหลับ',
    assessment.digitalScore   < 65 && 'เวลาหน้าจอ',
    assessment.stressScore    < 65 && 'ความเครียด',
    assessment.exerciseScore  < 65 && 'การออกกำลังกาย',
    assessment.waterScore     < 65 && 'การดื่มน้ำ',
    assessment.nutritionScore < 65 && 'โภชนาการ',
  ].filter(Boolean)

  return (
    <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-5 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-yellow-900" />
          </div>
          <div>
            <p className="text-blue-200 text-xs">AI Health Analysis</p>
            <p className="font-bold text-sm">วิเคราะห์สุขภาพอัจฉริยะ</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed">
          {level.emoji} สุขภาพโดยรวมของคุณอยู่ในระดับ <strong className="text-white">{level.label}</strong>
          {weakAreas.length > 0 && (
            <> จุดที่ต้องปรับปรุงคือ <strong className="text-yellow-300">{weakAreas.join(', ')}</strong></>
          )}
          {weakAreas.length === 0 && <> ทุกด้านอยู่ในเกณฑ์ดี รักษาต่อไปนะ!</>}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${assessment.overallScore}%` }} />
          </div>
          <span className="text-sm font-bold text-yellow-300">{assessment.overallScore}/100</span>
        </div>
      </div>
    </div>
  )
}

function RecCard({ rec, completedTips, toggleTip }) {
  const [expanded, setExpanded] = useState(true)
  const done = rec.tips.filter(t => completedTips.includes(t.id)).length
  const total = rec.tips.length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-blue-50/50 transition-colors">
        <span className="text-2xl">{rec.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">{rec.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priorityColor}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{done}/{total} เสร็จแล้ว</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-blue-50">
          <div className="bg-blue-50 rounded-xl p-3 my-3">
            <div className="flex items-start gap-2">
              <Brain size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">{rec.aiInsight}</p>
            </div>
          </div>
          <div className="space-y-2">
            {rec.tips.map(tip => {
              const done = completedTips.includes(tip.id)
              return (
                <button key={tip.id} onClick={() => toggleTip(tip.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    done ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-blue-50 border border-transparent'
                  }`}
                >
                  {done
                    ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Circle size={18} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  }
                  <span className={`text-sm leading-relaxed ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {tip.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AllGood() {
  return (
    <div className="text-center py-10">
      <p className="text-6xl mb-4">🌟</p>
      <h2 className="text-xl font-bold text-slate-800 mb-2">สุขภาพดีเยี่ยม!</h2>
      <p className="text-sm text-slate-500 mb-4">ทุกด้านของคุณอยู่ในเกณฑ์ที่ดีมาก รักษาสุขภาพนี้ต่อไปนะ</p>
    </div>
  )
}

export default function Recommendations() {
  const { latestAssessment, completedTips, toggleTip } = useHealth()

  if (!latestAssessment) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
        <p className="text-6xl mb-4">🤔</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีข้อมูลการประเมิน</h2>
        <p className="text-sm text-slate-500 mb-6">ทำแบบประเมินสุขภาพก่อนเพื่อรับคำแนะนำ AI ส่วนตัว</p>
        <Link to="/assessment" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
          เริ่มประเมินสุขภาพ
        </Link>
      </div>
    )
  }

  const recs = generateRecommendations(latestAssessment)
  const completedCount = completedTips.length
  const totalTips = recs.reduce((s, r) => s + r.tips.length, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
          <Lightbulb size={20} className="text-yellow-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">คำแนะนำ AI</h1>
          <p className="text-xs text-slate-500">วิเคราะห์จากผลประเมินล่าสุด</p>
        </div>
      </div>

      <AiInsightBanner assessment={latestAssessment} />

      {totalTips > 0 && (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-blue-50">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">ความคืบหน้า</p>
            <p className="text-xs text-slate-400">{completedCount} จาก {totalTips} คำแนะนำ</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-blue-700">{Math.round((completedCount / totalTips) * 100)}%</p>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden self-center">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(completedCount / totalTips) * 100}%` }} />
          </div>
        </div>
      )}

      {recs.length === 0 ? (
        <AllGood />
      ) : (
        <div className="space-y-3">
          {recs.map(rec => (
            <RecCard key={rec.id} rec={rec} completedTips={completedTips} toggleTip={toggleTip} />
          ))}
        </div>
      )}

      {/* General Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-yellow-800 mb-3">🌟 เคล็ดลับทั่วไปสำหรับวัยรุ่น</p>
        <div className="space-y-2">
          {[
            '😊 ใช้เวลากับคนที่รัก ลดความเครียดได้ดีที่สุด',
            '🌅 ออกไปรับแสงแดดตอนเช้า กระตุ้น Serotonin',
            '🎵 ฟังเพลงที่ชอบขณะออกกำลังกาย เพิ่มแรงบันดาลใจ',
            '📵 ลอง Digital Detox 1 ชั่วโมงก่อนนอน',
          ].map(tip => (
            <p key={tip} className="text-xs text-yellow-700 leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/assessment" className="text-sm text-blue-600 font-medium hover:underline">
          ประเมินสุขภาพใหม่ →
        </Link>
      </div>
    </div>
  )
}
