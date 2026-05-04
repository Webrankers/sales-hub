import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hub',
  description: 'Holy Moly Breda · Spinola Breda',
  icons: {
    icon:     '/icon.png',
    shortcut: '/favicon.ico',
    apple:    '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="h-full">
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch{}` }} />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-950 antialiased">{children}</body>
    </html>
  )
}
