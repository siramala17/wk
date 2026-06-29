import React, { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { MessageCircleQuestion, X, Send, Loader2 } from 'lucide-react'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM = `คุณคือ "WK Health AI" ผู้ช่วยด้านสุขภาพสำหรับนักเรียนมัธยมศึกษา
ตอบคำถามเกี่ยวกับสุขภาพ การออกกำลังกาย โภชนาการ การนอนหลับ และความเป็นอยู่ที่ดีเท่านั้น
ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย เหมาะกับวัยรุ่น ไม่เกิน 3-4 ประโยค
หากถามเรื่องที่ไม่เกี่ยวกับสุขภาพ ให้ตอบว่า "ฉันตอบได้เฉพาะเรื่องสุขภาพนะคะ 😊"`

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'สวัสดี! ฉันคือ WK Health AI 👋\nมีคำถามด้านสุขภาพอะไรให้ช่วยไหมคะ?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const updated = [...messages, { role: 'user', content: text }]
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
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'ขอโทษค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 🙏' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title="ถามผู้ช่วย AI"
        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <MessageCircleQuestion size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed top-16 right-4 w-80 flex flex-col z-50 overflow-hidden"
            style={{
              height: 420,
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleQuestion size={15} className="text-white/80" />
                <span className="text-white text-sm font-bold">WK Health AI</span>
                <span className="w-2 h-2 bg-green-300 rounded-full" />
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
                    style={{
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #4f46e5, #4338ca)'
                        : '#f1f5f9',
                      color: msg.role === 'user' ? 'white' : '#1e293b',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm" style={{ background: '#f1f5f9' }}>
                    <Loader2 size={13} className="animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="พิมพ์คำถามด้านสุขภาพ..."
                disabled={loading}
                className="flex-1 text-xs rounded-xl px-3 py-2 outline-none placeholder-slate-400 text-slate-800"
                style={{ background: '#f1f5f9' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
