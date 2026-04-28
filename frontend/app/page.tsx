// app/page.tsx
// The landing page — first thing visitors see.
// Animated hero with Furina theme and CTA buttons.

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import RippleButton from '@/components/RippleButton'
import { useRouter } from 'next/navigation'
import Image from "next/image"


// motion.div is Framer Motion's animated version of a regular div.
// You add animate, initial, and transition props to control the animation.

export default function LandingPage() {
  const router = useRouter()
  const text = "Alirkan Keadilan".split("")

  return (
    <main className="min-h-screen bg-pearl">

      {/* ── Water wave background decoration ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Fixed: stays in place as you scroll */}
        {/* pointer-events-none: can't be clicked, just decoration */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full
                        bg-sky/10 animate-water-wave" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full
                        bg-ocean/5 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full
                        bg-gold/5 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Navbar ─────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5
                      border-b border-gold/20 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        {/* backdrop-blur-sm: frosted glass effect — blurs content behind */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          
          <span className="font-serif text-2xl text-ocean font-bold">
            Fontaine Formulir
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/login"
                className="btn-secondary text-sm px-4 py-2">
            Masuk
          </Link>
          <Link href="/register"
                className="btn-primary text-sm px-4 py-2">
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────── */}
      <section className="flex flex-col items-center justify-center
                          min-h-[80vh] text-center px-6 py-20">

        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          // initial: starting state (invisible, 20px above)
          // animate: ending state (visible, normal position)
          // transition: how long and how it moves
        className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 
        text-gold text-sm px-4 py-2 rounded-full mb-8 font-medium 
          animate-[goldGlow_2s_ease-in-out_infinite]"
        >
          ✦ The Fontainers · Pembuat Formulir
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl text-ocean
                    font-bold leading-tight mb-6 max-w-4xl"
        >
          {/* 🌊 ULTRA WAVY LETTER ANIMATION */}
          <span className="inline-block">
            {text.map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                animate={{
                  y: [0, -12, 0, 12, 0],
                  rotate: [0, -5, 0, 5, 0],
                  skewY: [0, -10, 0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.06,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>

          <span className="text-gold block mt-2 
          drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]">
            Sajikan Pertunjukan
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-navy/60 text-xl max-w-2xl mb-10 leading-relaxed"
        >
          Buat kuis dan survei yang menarik untuk siswa anda.
          Bagikan melalui tautan. Lihat tanggapan di dashboard anda.
          Semuanya dalam satu ruang yang elegan.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <RippleButton
            onClick={() => router.push('/register')}
            className="btn-primary text-lg px-8 py-4"
          >
            Mulai Secara Gratis
          </RippleButton>
          <RippleButton
            onClick={() => router.push('/login')}
            className="btn-secondary text-lg px-8 py-4"
          >
            Login Guru
          </RippleButton>
        </motion.div>

        {/* Fleur-de-lis divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="furina-divider w-full max-w-md mt-16"
        >
          <span className="text-gold text-xl">𓆩༺♕༻𓆪</span>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl w-full"
        >
          {[
            { icon: '📋', title: 'Berbagai Jenis Pertanyaan',
              desc: 'Teks, pilihan ganda, checkbox, menu dropdown' },
            { icon: '🔗', title: 'Bagikan Dengan Tautan',
              desc: 'Siswa mengisi formulir tanpa perlu membuat akun' },
            { icon: '📊', title: 'Lihat Tanggapan',
              desc: 'Lihat semua jawaban dalam dashboard yang rapi' },
          ].map((feature, i) => (
            // .map() loops over the array and returns a card for each item
            <div key={i} className="furina-card text-center animate-fade-up"
                 style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-serif text-lg text-ocean font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-navy/60 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────── */}
      <footer className="bg-white border-t border-gold/20 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h2 className="font-serif text-xl text-ocean font-bold mb-3">
              Fontaine Formulir
            </h2>
            <p className="text-sm text-navy/60 leading-relaxed">
              Platform pembuat kuis & survei elegan untuk pendidikan modern.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-ocean mb-3">Navigasi</h3>
            <ul className="space-y-2 text-sm text-navy/70">
              <li><Link href="/" className="link-underline">Beranda</Link></li>
              <li><Link href="/login" className="link-underline">Masuk</Link></li>
              <li><Link href="/register" className="link-underline">Daftar</Link></li>
            </ul>
          </div>

          {/* Team */}
          <div>
            <h3 className="font-semibold text-ocean mb-3">Tim Kami</h3>
            <ul className="space-y-2 text-sm text-navy/70">
              <li><a href="https://ibrahim789.pythonanywhere.com/" target="_blank" rel="noopener noreferrer" className="link-underline">
               Ibrahim Rafii — Full Stack Developer</a>
              </li>
              <li><a href="https://www.instagram.com/rrkingloved/" target="_blank" rel="noopener noreferrer" className="link-underline">
                Ravi Kinglove — Asset Specialist
              </a></li>
              <li><a href="https://www.instagram.com/yaser_as1/" target="_blank" rel="noopener noreferrer" className="link-underline">
                M. Yaser Asysauqi — Technical Writer
              </a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-ocean mb-3">Kontak</h3>
            <ul className="space-y-2 text-sm text-navy/70">
              <li><a href="mailto:ibrahimrafii789@gmail.com" className="link-underline">
                Email: ibrahimrafii789@gmail.com
              </a></li>
              <li><a href="https://www.instagram.com/prodigy.11pplg/" target="_blank" rel="noopener noreferrer" className="link-underline">
                Instagram: @prodigy.11pplg
              </a></li>
              <li><a href="https://github.com/vuyutav" target="_blank" rel="noopener noreferrer" className="link-underline">
                Github: vuyutav
              </a></li>
            </ul>
          </div>

        </div>

        {/* Bottom line */}
        <div className="border-t border-gold/10 text-center py-4 text-sm text-navy/50">
          © {new Date().getFullYear()} Fontaine Formulir — All rights reserved.
        </div>
      </footer>

    </main>
  )
}