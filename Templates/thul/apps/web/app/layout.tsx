import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PopiaConsent } from '@/components/popia-consent'
import { LoadSheddingBanner } from '@/components/loadshedding-banner'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'

export const metadata: Metadata = {
  title: { default: 'ShopFlow SA', template: '%s | ShopFlow SA' },
  description: 'Buy fresh fruit & veg direct from SA street vendors near you.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32',   type: 'image/png' },
      { url: '/icon-192.png',   sizes: '192x192',  type: 'image/png' },
    ],
    apple: [{ url: '/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'ShopFlow SA' },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <LoadSheddingBanner />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PopiaConsent />
          <PwaInstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
