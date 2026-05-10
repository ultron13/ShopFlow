import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@shopflow/trpc'

export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env['API_URL'] ?? 'http://localhost:4000'}/trpc`,
      transformer: superjson,
    }),
  ],
})
