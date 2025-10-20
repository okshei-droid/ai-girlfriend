// app/layout.tsx
import './globals.css'
import CodeExchange from '@/components/CodeExchange'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CodeExchange />
        {children}
      </body>
    </html>
  )
}
