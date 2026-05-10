'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { trpc } from '@/lib/trpc'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { I18nProvider } from '@/lib/i18n'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'}/trpc`,
          transformer: superjson,
          headers() {
            if (typeof window === 'undefined') return {}
            const token = localStorage.getItem('sf-token')
            return token ? { Authorization: `Bearer ${token}` } : {}
          },
        }),
      ],
    })
  )

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            {children}
            <Toaster position="top-right" />
          </I18nProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}
