import React from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const msg = this.state.error?.message || ''
    const isFirebaseConfig = msg.includes('YOUR_') || msg.includes('invalid-api-key') || msg.includes('app/invalid-credential')

    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #0a1535 0%, #1a3a8f 100%)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            {isFirebaseConfig ? 'Firebase ยังไม่ได้ตั้งค่า' : 'เกิดข้อผิดพลาด'}
          </h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {isFirebaseConfig
              ? 'กรุณาแก้ไขไฟล์ src/config/firebase.js และใส่ค่าจาก Firebase Console'
              : 'แอปพลิเคชันพบปัญหาบางอย่าง กรุณาลองรีโหลดหน้าเว็บ'}
          </p>
          {!isFirebaseConfig && (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} /> รีโหลดหน้าเว็บ
            </button>
          )}
          {isFirebaseConfig && (
            <div className="bg-slate-50 rounded-xl p-3 text-left text-xs text-slate-500 font-mono">
              src/config/firebase.js
            </div>
          )}
        </div>
      </div>
    )
  }
}
