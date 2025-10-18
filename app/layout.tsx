import './globals.css'
import CodeExchange from '@/components/CodeExchange' // ta bort denna rad om du inte använder CodeExchange

export const metadata = {
  title: 'Luna — AI Companion',
  description: 'Warm, romantic AI companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA-bas */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f6e7f1" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {/* Ta bort denna rad om du inte använder CodeExchange */}
        <CodeExchange />

        {children}

        {/* Registrera service worker för PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
          `,
          }}
        />
      </body>
    </html>
  )
}
