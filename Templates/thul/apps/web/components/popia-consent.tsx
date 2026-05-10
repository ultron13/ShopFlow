'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export function PopiaConsent() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('popia-consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('popia-consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-gray-900 px-4 py-3 text-white sm:flex sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm">
        {t.popia.banner}{' '}
        <Link href="/privacy" className="underline hover:text-gray-300">
          {t.popia.learnMore}
        </Link>
      </p>
      <div className="mt-2 flex gap-3 sm:mt-0 sm:shrink-0">
        <button
          onClick={accept}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold hover:bg-indigo-500"
        >
          {t.popia.accept}
        </button>
      </div>
    </div>
  )
}
