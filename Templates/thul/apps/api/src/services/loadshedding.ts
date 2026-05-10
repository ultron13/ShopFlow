export interface LoadSheddingStatus {
  stage: number
  area?: string
  nextEvent?: string
}

export async function getLoadSheddingStatus(): Promise<LoadSheddingStatus> {
  const token = process.env['ESKOMSEPUSH_API_TOKEN']
  const areaId = process.env['ESKOMSEPUSH_AREA_ID'] ?? 'eskde-10-milnertonlighthousegor'

  if (!token) return { stage: 0 }

  try {
    const [statusRes, areaRes] = await Promise.all([
      fetch('https://developer.sepush.co.za/business/2.0/status', {
        headers: { Token: token },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`https://developer.sepush.co.za/business/2.0/area?id=${areaId}&test=current`, {
        headers: { Token: token },
        signal: AbortSignal.timeout(5000),
      }),
    ])

    const status = statusRes.ok ? await statusRes.json() : {}
    const area = areaRes.ok ? await areaRes.json() : {}

    const stage = Number(status?.status?.eskom?.stage ?? 0)
    const nextSlot = area?.events?.[0]
    const nextEvent = nextSlot
      ? new Date(nextSlot.start).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
      : undefined

    return { stage, area: area?.info?.name, nextEvent }
  } catch {
    return { stage: 0 }
  }
}
