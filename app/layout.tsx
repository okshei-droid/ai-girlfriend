export const metadata = {
  title: 'AI Girlfriend',
  description: 'Luna',
}

import CodeExchange from '@/components/CodeExchange'
import './globals.css' // ta bort denna rad om du inte har en globals.css

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
