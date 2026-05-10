'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  return (
    <div className="fixed bottom-16 left-4 right-4 z-50 rounded-xl border bg-white p-4 shadow-xl sm:left-auto sm:right-4 sm:w-80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">Install ShopFlow</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Add to your home screen for offline access — works without internet.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-gray-300 hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={async () => { await prompt.prompt(); setPrompt(null) }}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" /> Install
        </button>
        <button onClick={() => setDismissed(true)} className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">
          Not now
        </button>
      </div>
    </div>
  )
}
