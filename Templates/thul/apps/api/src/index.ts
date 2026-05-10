import path from 'path'
import { config as loadEnv } from 'dotenv'
loadEnv({ path: path.resolve(__dirname, '../../../.env') })

import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers/index'
import { createContext } from './context'
import { stripeWebhookHandler } from './webhooks/stripe'
import { rateLimiter, authRateLimiter } from './middleware/rateLimit'

const app = express()

app.use(
  cors({
    origin: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
    credentials: true,
  })
)

// Stripe webhook needs raw body — must be before express.json()
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
)

app.use(express.json({ limit: '10mb' }))
app.use(rateLimiter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(
  '/trpc',
  authRateLimiter,
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      if (error.code !== 'NOT_FOUND') {
        console.error(`tRPC error on /${path}:`, error)
      }
    },
  })
)

const PORT = process.env['PORT'] ?? 4000
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`)
})
