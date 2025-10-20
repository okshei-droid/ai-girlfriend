// app/layout.tsx
import './globals.css'
import CodeExchange from '@/components/CodeExchange'
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Router-hook-komponenter måste ligga i Suspense */}
        <Suspense fallback={null}>
          <CodeExchange />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
