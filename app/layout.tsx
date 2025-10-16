import CodeExchange from '@/components/CodeExchange'

export const metadata = {
  title: 'AI Girlfriend',
  description: 'Luna',
}

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
