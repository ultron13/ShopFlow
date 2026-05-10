'use client'

import { useI18n, LOCALES } from '@/lib/i18n'

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      aria-label="Select language"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>{l.nativeLabel}</option>
      ))}
    </select>
  )
}
