'use client'

import { useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Zap, X } from 'lucide-react'

export function LoadSheddingBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { data } = trpc.loadshedding.status.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    retry: false,
  })

  if (dismissed || !data?.stage || data.stage === 0) return null

  const stageColor =
    data.stage <= 2 ? 'bg-yellow-500' : data.stage <= 4 ? 'bg-orange-500' : 'bg-red-600'

  return (
    <div className={`${stageColor} text-white px-4 py-2 text-sm flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 shrink-0" />
        <span>
          <strong>Stage {data.stage} load shedding</strong> in effect
          {data.nextEvent ? ` · Next outage: ${data.nextEvent}` : ''}
          {data.area ? ` (${data.area})` : ''}
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 hover:opacity-70">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
