// components/Navbar.tsx
// The top navigation bar — shown on all authenticated pages.

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RippleButton from './RippleButton'
import Image from 'next/image'

export default function Navbar() {
  const router = useRouter()
  // useRouter() lets us navigate programmatically (redirect in code)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // localStorage is the browser's key-value store.
    // We save the token here at login and remove it at logout.
    router.push('/login')
    // Redirect to the login page
  }

  return (
    <nav className="bg-white border-b border-gold/30 px-6 py-4 
                    flex items-center justify-between sticky top-0 z-50">
      {/* sticky top-0 = stays at the top when you scroll */}
      {/* z-50 = sits on top of other elements */}

      <Link href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Logo"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="font-serif text-xl text-ocean font-bold">
          Fontaine Formulir
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/dashboard"
              className="text-navy/70 hover:text-ocean transition-colors text-sm">
          Dashboard
        </Link>
        <RippleButton onClick={handleLogout} className="btn-secondary text-sm px-4 py-2">
          Logout
        </RippleButton>
      </div>
    </nav>
  )
}