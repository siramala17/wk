import React, { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('wk_lang') || 'th')

  function toggleLang() {
    const next = lang === 'th' ? 'en' : 'th'
    setLang(next)
    localStorage.setItem('wk_lang', next)
  }

  function setLangDirect(l) {
    setLang(l)
    localStorage.setItem('wk_lang', l)
  }

  const t = translations[lang]

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLang: setLangDirect, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
