// app/forms/[id]/edit/page.tsx
// The form builder — teachers add and manage questions here.
// [id] is a dynamic segment — Next.js fills it with the actual form ID from the URL.

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { getForm, addQuestion, updateForm } from '@/lib/api'
import Navbar from '@/components/Navbar'
import FurinaCard from '@/components/FurinaCard'
import RippleButton from '@/components/RippleButton'

type QuestionType = 'text' | 'multiple_choice' | 'checkbox' | 'dropdown'


type Question = {
  id: number
  question_text: string
  question_type: QuestionType
  options?: string[]
}

type Form = {
  id: number
  title: string
  description?: string
  is_published: boolean
  questions: Question[]
}



const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'text',            label: 'Jawaban Singkat',     icon: '✏️' },
  { value: 'multiple_choice', label: 'Pilihan Ganda',  icon: '◎' },
  { value: 'checkbox',        label: 'Kotak Centang',       icon: '☑' },
  { value: 'dropdown',        label: 'Dropdown',         icon: '▾' },
]

export default function EditFormPage() {
  
  const params   = useParams()
  const router   = useRouter()
  const formId   = params.id as string
  // useParams() reads the [id] from the URL.
  // If URL is /forms/3/edit, then params.id = "3"

  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,     setLoading]     = useState(true)
  const [publishing,  setPublishing]  = useState(false)
  const [shareUrl,    setShareUrl]    = useState('')

  // New question form state
  const [showAddQ,    setShowAddQ]    = useState(false)
  const [qText,       setQText]       = useState('')
  const [qType, setQType] = useState<QuestionType>('text')
  const [qOptions,    setQOptions]    = useState(['', ''])
  // Options for multiple choice / checkbox / dropdown
  const [addingQ,     setAddingQ]     = useState(false)

  useEffect(() => {
    loadForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

  async function loadForm() {
    const data: { form: Form } = await getForm(formId)
    if (data.form) {
      setForm(data.form)
      setQuestions(data.form.questions || [])
      setShareUrl(`${window.location.origin}/f/${formId}`)
    }
    setLoading(false)
  }

  async function handleAddQuestion() {
    if (!qText.trim()) return
    setAddingQ(true)

    const needsOptions = ['multiple_choice', 'checkbox', 'dropdown']
      .includes(qType)
    // needsOptions is true for question types that have option lists

    type QuestionPayload = {
      question_text: string
      question_type: QuestionType
      options?: string[]
    }

    const payload: QuestionPayload = {
      question_text: qText,
      question_type: qType,
    }
    if (needsOptions) {
      payload.options = qOptions.filter(o => o.trim() !== '')
      // filter() removes any empty option fields
    }

    const data = await addQuestion(formId, payload)
    if (data.question) {
      setQuestions(prev => [...prev, data.question])
      // Spread the old array and add the new question at the end
      setQText('')
      setQType('text')
      setQOptions(['', ''])
      setShowAddQ(false)
    }
    setAddingQ(false)
  }

  async function handlePublishToggle() {
    setPublishing(true)
    if (!form) return

    const data: { form: Form } = await updateForm(formId, {
      is_published: !form.is_published
    })

    if (data.form) {
      setForm(data.form)

      // ✅ ADD THIS LINE (THIS FIXES YOUR ERROR)
      router.push('/dashboard')
    }

    setPublishing(false)
  }

  function addOption() {
    setQOptions(prev => [...prev, ''])
    // Add a new empty option input
  }

  function updateOption(index: number, value: string) {
    setQOptions(prev => prev.map((o, i) => i === index ? value : o))
    // Update only the option at the given index, keep others unchanged
  }

  function removeOption(index: number) {
    setQOptions(prev => prev.filter((_, i) => i !== index))
    // Remove the option at the given index
  }

  if (loading) return (
    <div className="min-h-screen bg-pearl flex items-center justify-center">
      <div className="animate-float text-4xl">⚖️</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-pearl">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Form header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-3xl text-ocean font-bold">
                {form?.title}
              </h1>
              {form?.description && (
                <p className="text-navy/60 mt-1">{form.description}</p>
              )}
            </div>
            <div className="flex gap-3">
              <RippleButton
                onClick={handlePublishToggle}
                disabled={publishing}
                className={form?.is_published ? 'btn-secondary text-sm' : 'btn-gold text-sm'}
              >
                {form?.is_published ? 'Batalkan publikasi' : 'Kirim Formulir'}
              </RippleButton>
            </div>
          </div>

          {/* Share URL — only shows when published */}
          {form?.is_published && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 bg-green-50 border border-green-200
                         rounded-xl p-4 flex items-center gap-3"
            >
              <span className="text-green-600 text-sm flex-1 font-mono truncate">
                {shareUrl}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="text-green-700 text-sm font-medium hover:underline shrink-0"
              >
                Salin Tautan
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Questions list */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {questions.map((q: Question, i: number) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <FurinaCard className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-ocean/10 rounded-full flex items-center
                                  justify-center text-ocean text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-navy font-medium">{q.question_text}</p>
                    <p className="text-navy/40 text-sm mt-1">
                      {QUESTION_TYPES.find(t => t.value === q.question_type)?.label}
                    </p>
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.options.map((opt: string, j: number) => (
                          <span key={j}
                                className="text-xs bg-ice border border-sky/20
                                           text-ocean px-3 py-1 rounded-full">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </FurinaCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {questions.length === 0 && (
            <div className="text-center py-10 text-navy/40">
              Belum ada pertanyaan — silakan ajukan pertanyaan pertama anda di bawah ini
            </div>
          )}
        </div>

        {/* Add Question Panel */}
        {!showAddQ ? (
          <RippleButton
            onClick={() => setShowAddQ(true)}
            className="btn-primary w-full text-center"
          >
            + Tambahkan Pertanyaan
          </RippleButton>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FurinaCard>
              <h3 className="font-serif text-xl text-ocean font-semibold mb-4">
                Pertanyaan Baru
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  placeholder="Masukkan pertanyaan anda..."
                  className="furina-input"
                  autoFocus
                />

                {/* Question type selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {QUESTION_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setQType(type.value)}
                      className={`p-3 rounded-xl border text-sm font-medium
                                  transition-all text-center
                        ${qType === type.value
                          ? 'border-ocean bg-ocean text-white'
                          : 'border-sky/30 text-navy/70 hover:border-ocean'}`}
                    >
                      <span className="block text-lg mb-1">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Options editor — shows for non-text types */}
                {['multiple_choice', 'checkbox', 'dropdown'].includes(qType) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy/70">
                      Opsi Jawaban
                    </label>
                    {qOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={e => updateOption(i, e.target.value)}
                          placeholder={`Opsi ${i + 1}`}
                          className="furina-input"
                        />
                        {qOptions.length > 2 && (
                          // Only show remove button if there are more than 2 options
                          <button
                            onClick={() => removeOption(i)}
                            className="text-red-400 hover:text-red-600 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="text-ocean text-sm hover:underline"
                    >
                      + Tambahkan Opsi
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <RippleButton
                    onClick={handleAddQuestion}
                    disabled={addingQ}
                    className="btn-primary flex-1 text-center"
                  >
                    {addingQ ? 'Menambahkan...' : 'Tambahkan Pertanyaan'}
                  </RippleButton>
                  <RippleButton
                    onClick={() => setShowAddQ(false)}
                    className="btn-secondary flex-1 text-center"
                  >
                    Batal
                  </RippleButton>
                </div>
              </div>
            </FurinaCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}