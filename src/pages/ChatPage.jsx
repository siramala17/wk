import React, { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { Send, Loader2, RotateCcw } from 'lucide-react'
import { useLang } from '../context/LangContext'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM = `คุณคือ "WK Health AI" ผู้ช่วยด้านสุขภาพสำหรับนักเรียนมัธยมศึกษา
ตอบคำถามเกี่ยวกับสุขภาพ การออกกำลังกาย โภชนาการ การนอนหลับ และความเป็นอยู่ที่ดีเท่านั้น
ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย เหมาะกับวัยรุ่น ไม่เกิน 3-4 ประโยค
หากถามเรื่องที่ไม่เกี่ยวกับสุขภาพ ให้ตอบว่า "ฉันตอบได้เฉพาะเรื่องสุขภาพนะคะ 😊"`

const INIT = [{ role: 'assistant', content: 'สวัสดี! ฉันคือ WK Health AI 👋\nมีคำถามด้านสุขภาพอะไรให้ช่วยไหมคะ?' }]

const SUGGESTIONS = [
  'วิธีนอนหลับให้หลับง่ายขึ้น',
  'อาหารเช้าที่ดีสำหรับวัยรุ่น',
  'ออกกำลังกายขั้นต่ำแค่ไหนต่อวัน',
  'วิธีลดความเครียดตอนสอบ',
]

export default function ChatPage() {
  const { lang } = useLang()
  const isEn = lang === 'en'
  const [messages, setMessages] = useState(INIT)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    const updated = [...messages, { role: 'user', content: msg }]
    setMessages(updated)
    setInput('')
    setLoading(true)
    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM,
        messages: updated,
      })
      const reply = response.content[0]?.text ?? 'ขอโทษค่ะ ไม่สามารถตอบได้'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'ขอโทษค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 🙏' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{ height: 'calc(100dvh - 112px)' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="rounded-3xl p-4 text-white flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <div>
              <p className="font-bold text-base">WK Health AI</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-300 rounded-full" />
                <span className="text-white/75 text-xs">{isEn ? 'Online · Health assistant' : 'ออนไลน์ · ผู้ช่วยด้านสุขภาพ'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setMessages(INIT)}
            className="p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-colors"
            title={isEn ? 'Clear chat' : 'ล้างการสนทนา'}>
            <RotateCcw size={15} className="text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mr-2 mt-1"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                🤖
              </div>
            )}
            <div className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg,#4f46e5,#4338ca)'
                  : '#f1f5f9',
                color: msg.role === 'user' ? 'white' : '#1e293b',
              }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mr-2"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>🤖</div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#f1f5f9' }}>
              <Loader2 size={15} className="animate-spin text-indigo-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — show only on initial state */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">{isEn ? 'Try asking:' : 'ลองถามเช่น'}</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-slate-200 px-3 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={isEn ? 'Ask a health question...' : 'พิมพ์คำถามด้านสุขภาพ...'}
            disabled={loading}
            className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 bg-transparent"
          />
          <button onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#4338ca)' }}>
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-1.5">
          {isEn ? 'AI answers health topics only · Not a medical diagnosis' : 'AI ตอบเฉพาะเรื่องสุขภาพ · ไม่ใช่คำวินิจฉัยทางการแพทย์'}
        </p>
      </div>
    </div>
  )
}
