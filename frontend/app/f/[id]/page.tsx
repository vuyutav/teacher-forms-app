// app/f/[id]/page.tsx
// The public form page — what students see when they follow the shared link.
// No login required. Fully public.

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { getPublicForm, submitResponse } from '@/lib/api'
import FurinaCard from '@/components/FurinaCard'
import RippleButton from '@/components/RippleButton'

type Question = {
  id: number
  question_text: string
  question_type: string
  options?: string[]
}

type Form = {
  id: string
  title: string
  description?: string
  is_published: boolean
  questions: Question[]
}

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [name,       setName]       = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    async function loadForm() {
      const data = await getPublicForm(formId)
      if (data.form && data.form.is_published) {
        setForm(data.form)
        setQuestions(data.form.questions || [])
      } else {
        setError('Formulir ini tidak tersedia.')
      }
      setLoading(false)
    }

    loadForm()
  }, [formId])


  function handleAnswer(questionId: number, value: string | string[]){
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Spread previous answers and update/add the answer for this question
  }

  function handleCheckbox(questionId: number, option: string, checked: boolean) {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || []
      // current = the already-selected options for this question (array)
      if (checked) {
        return { ...prev, [questionId]: [...current, option] }
        // Add the option to the array
      } else {
        return { ...prev, [questionId]: current.filter((o: string) => o !== option) }
        // Remove the option from the array
      }
    })
  }

  async function handleSubmit() {
    setSubmitting(true)

    const answersPayload = questions.map(q => ({
      question_id:  q.id,
      answer_text:  answers[q.id] ?? ''
      // ?? '' means: use empty string if the answer is undefined
    }))

    const data = await submitResponse(formId, {
      respondent_name: name || 'Anonymous',
      answers: answersPayload
    })

    if (data.message) {
      setSubmitted(true)
    } else {
      setError('Submission failed. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-pearl flex items-center justify-center">
      <div className="animate-float text-4xl">🌊</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-4">
      <FurinaCard className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-2xl text-ocean font-bold mb-2">
          Formulir Tidak Tersedia
        </h2>
        <p className="text-navy/60">{error}</p>
      </FurinaCard>
    </div>
  )
  if (!form) return null

  // Success screen after submission
  if (submitted) return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        className="w-full max-w-md"
      >
        <FurinaCard className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl mb-4"
          >
            ✨
          </motion.div>
          <h2 className="font-serif text-3xl text-ocean font-bold mb-2">
            Tanggapan telah dikirim!
          </h2>
          <div className="furina-divider">
            <span className="text-gold">❧</span>
          </div>
          <p className="text-navy/60">
            Terima kasih, {name || 'siswa'}. Jawaban Anda telah direkam.
          </p>
        </FurinaCard>
      </motion.div>
    </div>
  )

  return (
    <main className="min-h-screen bg-pearl py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Form header card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <FurinaCard className="text-center">
            <h1 className="font-serif text-3xl text-ocean font-bold mb-2">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-navy/60">{form.description}</p>
            )}
          </FurinaCard>
        </motion.div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <FurinaCard>
            <label className="block text-sm font-medium text-navy/70 mb-2">
              Nama Anda <span className="text-navy/30">(opsional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="furina-input"
            />
          </FurinaCard>
        </motion.div>

        {/* Questions */}
        {questions.map((q: Question, i: number) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="mb-4"
          >
            <FurinaCard>
              <p className="font-medium text-navy mb-4">
                <span className="text-ocean font-bold mr-2">{i + 1}.</span>
                {q.question_text}
              </p>

              {/* Render the right input based on question type */}
              {q.question_type === 'text' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswer(q.id, e.target.value)}
                  placeholder="Jawaban Anda..."
                  rows={3}
                  className="furina-input resize-none"
                />
              )}

              {q.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt: string, j: number) => (
                    <label key={j}
                           className="flex items-center gap-3 p-3 rounded-xl
                                      border border-sky/20 cursor-pointer
                                      hover:border-ocean hover:bg-ice/50
                                      transition-all has-[:checked]:border-ocean
                                      has-[:checked]:bg-ice">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                        className="accent-ocean"
                        // accent-ocean uses our custom color for the radio dot
                      />
                      <span className="text-navy">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === 'checkbox' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt: string, j: number) => (
                    <label key={j}
                           className="flex items-center gap-3 p-3 rounded-xl
                                      border border-sky/20 cursor-pointer
                                      hover:border-ocean hover:bg-ice/50 transition-all">
                      <input
                        type="checkbox"
                        checked={(answers[q.id] || []).includes(opt)}
                        onChange={e => handleCheckbox(q.id, opt, e.target.checked)}
                        className="accent-ocean w-4 h-4"
                      />
                      <span className="text-navy">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === 'dropdown' && (
                <select
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswer(q.id, e.target.value)}
                  className="furina-input"
                >
                  <option value="">Pilih sebuah opsi...</option>
                  {(q.options || []).map((opt: string, j: number) => (
                    <option key={j} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </FurinaCard>
          </motion.div>
        ))}

        {/* Submit button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + questions.length * 0.07 }}
        >
          <RippleButton
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-gold w-full text-center text-lg py-4"
          >
            {submitting ? 'Mengirim...' : 'Kirim Tanggapan ✦'}
          </RippleButton>
        </motion.div>
      </div>
    </main>
  )
}