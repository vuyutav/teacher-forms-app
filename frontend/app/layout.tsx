// app/layout.tsx
// This is the ROOT layout — it wraps every single page in the app.
// Fonts loaded here are available everywhere.
// Think of it like the <html> and <body> tags of your whole site.
import './globals.css'
import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'

// next/font/google downloads the font at BUILD TIME (not from Google's
// servers at runtime). This is faster and more private for users.
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  // variable: makes the font available as a CSS variable
  // So you can use: font-family: var(--font-playfair) anywhere
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title:       'Fontaine Formulir — Pembuat Formulir Guru',
  description: 'Buat dan bagikan formulir kepada siswa anda',
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  // children = whatever page is currently being shown
}) {
  return (
    <html lang="en">
      <body className={`
        ${playfair.variable}
        ${inter.variable}
        font-sans
        bg-pearl
        text-navy
        min-h-screen
      `}>
        {/* font-sans uses var(--font-inter) from our tailwind config */}
        {/* bg-pearl is our custom pearl white background */}
        {children}
      </body>
    </html>
  )
}