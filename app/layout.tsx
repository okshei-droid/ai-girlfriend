// app/layout.tsx
import './globals.css'
import CodeExchange from '@/components/CodeExchange'
import Pwa from '@/components/Pwa'
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteName = 'Luna — AI Companion'
  const theme = '#f6e7f1'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={theme} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>{siteName}</title>
      </head>
      <body>
        {/* Växla ?code=... -> session och rensa URL */}
        <Suspense fallback={null}>
          <CodeExchange />
        </Suspense>

        {/* Registrera service worker för PWA */}
        <Pwa />

        {children}
      </body>
    </html>
  )
}
