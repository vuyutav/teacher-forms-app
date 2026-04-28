// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// AnimatePresence lets elements animate OUT when they're removed from the DOM
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getForms, deleteForm, createForm } from '@/lib/api'
import Navbar from '@/components/Navbar'
import FurinaCard from '@/components/FurinaCard'
import RippleButton from '@/components/RippleButton'

type Form = {
  id: number
  title: string
  is_published: boolean
  question_count: number
  created_at: string
}

type User = {
  name: string
}

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // useEffect runs code AFTER the component first appears on screen.
  // The [] at the end means "run only once, not on every re-render".
useEffect(() => {
  const stored = localStorage.getItem('user')
  if (!stored) {
    router.push('/login')
    return
  }
  try {
    setUser(JSON.parse(stored))
  } catch {
    localStorage.removeItem('user')
    router.push('/login')
  }
  loadForms()
}, [router])

  async function loadForms() {
    setLoading(true)
    const data: { forms: Form[] } = await getForms()
    setForms(data.forms || [])
    setLoading(false)
  }
  async function handleCreate() {
    if (!newTitle.trim()) return
    // .trim() removes whitespace from both ends
    setCreating(true)
  type CreateFormResponse = {
    form: Form
  }

  const data: CreateFormResponse = await createForm(newTitle, newDesc)
    if (data.form) {
      setForms((prev: Form[]) => [data.form, ...prev])
      // prev is the old forms array. We add the new form at the front.
      setShowCreate(false)
      setNewTitle('')
      setNewDesc('')
      router.push(`/forms/${data.form.id}/edit`)
      // Go straight to the edit page for the new form
    }
    setCreating(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this form? This cannot be undone.')) return

    await deleteForm(String(id))
    setForms((prev: Form[]) => prev.filter(f => f.id !== id))
  }

  return (
    <div className="min-h-screen bg-pearl">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-serif text-4xl text-ocean font-bold">
              {user ? `Welcome, ${user.name}` : 'Your Dashboard'}
            </h1>
            <p className="text-navy/60 mt-1">
              {forms.length} formulir{forms.length !== 1 ? '' : ''} dalam koleksi Anda
            </p>
          </div>
          <RippleButton
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            + Formulir Baru
          </RippleButton>
        </motion.div>

        {/* Create Form Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // exit runs when the element is removed (AnimatePresence enables this)
              className="fixed inset-0 bg-navy/50 flex items-center
                         justify-center z-50 px-4"
              onClick={e => e.target === e.currentTarget && setShowCreate(false)}
              // Close when clicking the dark overlay (not the card itself)
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{    scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
              >
                <FurinaCard>
                  <h2 className="font-serif text-2xl text-ocean font-bold mb-6">
                    Buat Formulir Baru
                  </h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="Judul Formulir"
                      className="furina-input"
                      autoFocus
                    />
                    <textarea
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder="Deskripsi (opsional)"
                      rows={3}
                      className="furina-input resize-none"
                    />
                    <div className="flex gap-3">
                      <RippleButton
                        onClick={handleCreate}
                        disabled={creating}
                        className="btn-primary flex-1 text-center"
                      >
                        {creating ? 'Membuat Form...' : 'Buat Form'}
                      </RippleButton>
                      <RippleButton
                        onClick={() => setShowCreate(false)}
                        className="btn-secondary flex-1 text-center"
                      >
                        Cancel
                      </RippleButton>
                    </div>
                  </div>
                </FurinaCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms Grid */}
        {loading ? (
          <div className="text-center py-20 text-navy/40">
            Loading formulir anda...
          </div>
        ) : forms.length === 0 ? (
          <FurinaCard className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-serif text-2xl text-ocean font-semibold mb-2">
              Belum ada formulir
            </h2>
            <p className="text-navy/60 mb-6">Buat formulir pertama anda untuk memulai</p>
            <RippleButton
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              Buat Formulir Pertama
            </RippleButton>
          </FurinaCard>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {forms.map((form: Form, i: number) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  // Stagger: each card animates 0.05s after the previous
                >
                  <FurinaCard className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-xl text-ocean font-semibold truncate">
                          {form.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${form.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gold/10 text-gold'}`}>
                          {form.is_published ? 'Diterbitkan' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-navy/50 text-sm">
                        {form.question_count} Pertanyaan{form.question_count !== 1 ? '' : ''}
                        · Dibuat {new Date(form.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/forms/${form.id}/responses`}
                            className="btn-secondary text-sm px-3 py-2">
                        Responden
                      </Link>
                      <Link href={`/forms/${form.id}/edit`}
                            className="btn-primary text-sm px-3 py-2">
                        Edit
                      </Link>
                      <RippleButton
                        onClick={() => handleDelete(form.id)}
                        className="text-red-400 hover:text-red-600 p-2
                                   hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑
                      </RippleButton>
                    </div>
                  </FurinaCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}