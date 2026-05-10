import { router, publicProcedure } from '../trpc'
import { getLoadSheddingStatus } from '../services/loadshedding'

// Cache result for 5 minutes to avoid hammering the EskomSePush API
let cache: { data: Awaited<ReturnType<typeof getLoadSheddingStatus>>; at: number } | null = null

export const loadsheddingRouter = router({
  status: publicProcedure.query(async () => {
    const now = Date.now()
    if (cache && now - cache.at < 5 * 60 * 1000) return cache.data
    const data = await getLoadSheddingStatus()
    cache = { data, at: now }
    return data
  }),
})
