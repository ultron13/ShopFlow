'use client'

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@shopflow/trpc'

export const trpc = createTRPCReact<AppRouter>()
