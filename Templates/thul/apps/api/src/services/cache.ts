import Redis from 'ioredis'

export const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
})

redis.on('error', (err) => {
  console.error('Redis error:', err.message)
})

export async function cacheGet<T>(key: string): Promise<T | null> {
  const val = await redis.get(key)
  if (!val) return null
  return JSON.parse(val) as T
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60) {
  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function cacheDel(...keys: string[]) {
  if (keys.length) await redis.del(...keys)
}

export async function cacheDelPattern(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length) await redis.del(...keys)
}
