'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/lib/api'
import RippleButton from '@/components/RippleButton'
import FurinaCard from '@/components/FurinaCard'
import Image from 'next/image'

export default function RegisterPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    if (!name || !email || !password) {
      setError('Harap isi semua kolom')
      return
    }
    if (password.length < 6) {
      setError('Kata sandi harus terdiri dari minimal 6 karakter')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await registerUser(name, email, password)
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user',  JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registrasi Gagal')
      }
    } catch {
      setError('Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-pearl flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="link-underline text-navy/60">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 animate-float overflow-hidden flex items-center justify-center bg-gold">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          </Link>
          <h1 className="font-serif text-4xl text-ocean font-bold mb-2">
            Bergabung dengan Kami
          </h1>
          <p className="text-navy/60">Buat akun guru Anda</p>
        </div>

        <FurinaCard>
          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700
                              rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy/70 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Miss Furina"
                className="furina-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy/70 mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@gmail.com"
                className="furina-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy/70 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Minimal 6 karakter"
                className="furina-input"
              />
            </div>

            <RippleButton
              onClick={handleSubmit}
              disabled={loading}
              className="btn-gold w-full text-center"
            >
              {loading ? 'Sedang Membuat Akun...' : 'Buat Akun'}
            </RippleButton>
          </div>

          <div className="furina-divider mt-6">
            <span className="text-gold text-sm">✦</span>
          </div>

          <p className="text-center text-sm text-navy/60">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-ocean hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </FurinaCard>
      </motion.div>
    </main>
  )
}