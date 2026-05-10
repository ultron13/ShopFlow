'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Locale = 'en' | 'zu' | 've' | 'af' | 'xh' | 'nso' | 'st'

export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: 'en',  label: 'English',           nativeLabel: 'English'      },
  { code: 'zu',  label: 'isiZulu',            nativeLabel: 'isiZulu'      },
  { code: 've',  label: 'Tshivenda',          nativeLabel: 'Tshivenda'    },
  { code: 'af',  label: 'Afrikaans',          nativeLabel: 'Afrikaans'    },
  { code: 'xh',  label: 'isiXhosa',           nativeLabel: 'isiXhosa'     },
  { code: 'nso', label: 'Sepedi',             nativeLabel: 'Sepedi'       },
  { code: 'st',  label: 'Sesotho',            nativeLabel: 'Sesotho'      },
]

type Translations = typeof import('./locales/en').default

const translations: Record<Locale, () => Promise<Translations>> = {
  en:  () => import('./locales/en').then((m) => m.default),
  zu:  () => import('./locales/zu').then((m) => m.default),
  ve:  () => import('./locales/ve').then((m) => m.default),
  af:  () => import('./locales/af').then((m) => m.default),
  xh:  () => import('./locales/xh').then((m) => m.default),
  nso: () => import('./locales/nso').then((m) => m.default),
  st:  () => import('./locales/st').then((m) => m.default),
}

interface I18nCtx {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
}

import en from './locales/en'
const I18nContext = createContext<I18nCtx>({ locale: 'en', t: en, setLocale: () => {} })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [t, setT] = useState<Translations>(en)

  useEffect(() => {
    const saved = (localStorage.getItem('shopflow-locale') ?? 'en') as Locale
    if (saved !== 'en') loadLocale(saved)
    else setLocaleState('en')
  }, [])

  async function loadLocale(l: Locale) {
    const msgs = await translations[l]()
    setT(msgs)
    setLocaleState(l)
    localStorage.setItem('shopflow-locale', l)
  }

  return <I18nContext.Provider value={{ locale, t, setLocale: loadLocale }}>{children}</I18nContext.Provider>
}

export function useI18n() { return useContext(I18nContext) }
