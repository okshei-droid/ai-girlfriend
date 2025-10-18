import CodeExchange from '@/components/CodeExchange'

export const metadata = {
  title: 'AI Girlfriend',
  description: 'Luna',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f6e7f1" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <CodeExchange />
        {children}
        {/* SW-registrering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
`}}
        />
      </body>
    </html>
  )
}
