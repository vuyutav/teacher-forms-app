// app/forms/[id]/responses/page.tsx
// Shows all student responses in a table with simple bar charts.

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { getResponses } from '@/lib/api'
import Navbar from '@/components/Navbar'
import FurinaCard from '@/components/FurinaCard'

type Answer = {
  question_id: number
  answer_text: string
}

type Response = {
  id: number
  respondent_name?: string
  submitted_at: string
  answers: Answer[]
}

type Question = {
  id: number
  question_text: string
  question_type: string
}

type FormData = {
  form: {
    title: string
  }
  questions: Question[]
  responses: Response[]
  total: number
}


export default function ResponsesPage() {
  const params  = useParams()
  const formId  = params.id as string

  const [data, setData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getResponses(formId)
      setData(result)
      setLoading(false)
    }
    load()
  }, [formId])

  // Count how many times each option was chosen for a question
  function countAnswers(questionId: number) {
    if (!data) return {}
    const counts: Record<string, number> = {}

    data.responses.forEach((r: Response) => {
      const answer = r.answers.find((a: Answer) => a.question_id === questionId)
      if (!answer || !answer.answer_text) return

      const text = answer.answer_text
      // Try to parse checkbox answers (stored as JSON arrays)
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          parsed.forEach((val: string) => {
            counts[val] = (counts[val] || 0) + 1
          })
          return
        }
      } catch {
        // Not JSON — treat as plain text
      }
      counts[text] = (counts[text] || 0) + 1
    })
    return counts
  }

  if (loading) return (
    <div className="min-h-screen bg-pearl flex items-center justify-center">
      <div className="animate-float text-4xl">📊</div>
    </div>
  )

  if (!data) return null

  const totalResponses = data?.total || 0

  return (
    <div className="min-h-screen bg-pearl">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl text-ocean font-bold">
            {data?.form?.title}
          </h1>
          <p className="text-navy/60 mt-1">
            {totalResponses} tanggapan{totalResponses !== 1 ? '' : ''} yang dikumpulkan
          </p>
        </motion.div>

        {totalResponses === 0 ? (
          <FurinaCard className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="font-serif text-2xl text-ocean font-semibold mb-2">
              Belum ada tanggapan
            </h2>
            <p className="text-navy/60">
              Bagikan tautan formulir anda kepada para siswa untuk mulai mengumpulkan jawaban
            </p>
          </FurinaCard>
        ) : (
          <div className="space-y-6">
            {/* Summary charts per question */}
            {data.questions.map((q: Question, i: number) => {
              const counts = countAnswers(q.id)
              const hasOptions = q.question_type !== 'text'
              const maxCount = Math.max(...Object.values(counts) as number[], 1)
              // Math.max finds the highest count (for scaling the bar chart)

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <FurinaCard>
                    <h3 className="font-medium text-navy mb-1">
                      <span className="text-ocean font-bold mr-2">{i + 1}.</span>
                      {q.question_text}
                    </h3>
                    <p className="text-navy/40 text-sm mb-4">
                      {Object.keys(counts).length} unique answer{Object.keys(counts).length !== 1 ? 's' : ''}
                    </p>

                    {hasOptions ? (
                      // Bar chart for option-based questions
                      <div className="space-y-3">
                        {Object.entries(counts)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          // Sort by count, highest first
                          .map(([option, count]) => (
                            <div key={option}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-navy">{option}</span>
                                <span className="text-navy/60">
                                  {count as number} ({Math.round((count as number) / totalResponses * 100)}%)
                                </span>
                              </div>
                              <div className="h-6 bg-ice rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(count as number) / maxCount * 100}%` }}
                                  transition={{ duration: 0.7, ease: 'easeOut' }}
                                  // Animated bar — grows from 0 to the correct width
                                  className="h-full bg-gradient-to-r from-ocean to-sky rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      // List of text answers
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {data.responses.map((r: Response) => {
                          const ans = r.answers.find((a: Answer) => a.question_id === q.id)
                          if (!ans?.answer_text) return null
                          return (
                            <div key={r.id}
                                 className="text-sm bg-ice rounded-lg px-3 py-2 text-navy">
                              <span className="text-navy/40 mr-2">
                                {r.respondent_name || 'Anonymous'}:
                              </span>
                              {ans.answer_text}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </FurinaCard>
                </motion.div>
              )
            })}

            {/* Raw responses table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FurinaCard>
                <h2 className="font-serif text-xl text-ocean font-semibold mb-4">
                  Semua Tanggapan
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/20">
                        <th className="text-left py-2 pr-4 text-navy/60 font-medium">
                          Nama
                        </th>
                        <th className="text-left py-2 pr-4 text-navy/60 font-medium">
                          Telah dikirim
                        </th>
                        {data.questions.map((q: Question) => (
                          <th key={q.id}
                              className="text-left py-2 pr-4 text-navy/60 font-medium
                                         max-w-32 truncate">
                            {q.question_text.slice(0, 20)}
                            {q.question_text.length > 20 ? '...' : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.responses.map((r: Response) => (
                        <tr key={r.id}
                            className="border-b border-gold/10 hover:bg-ice/50 transition-colors">
                          <td className="py-3 pr-4 text-navy font-medium">
                            {r.respondent_name || 'Anonymous'}
                          </td>
                          <td className="py-3 pr-4 text-navy/50">
                            {new Date(r.submitted_at).toLocaleDateString()}
                          </td>
                          {data.questions.map((q: Question) => {
                            const ans = r.answers.find((a: Answer) => a.question_id === q.id)
                            return (
                              <td key={q.id} className="py-3 pr-4 text-navy max-w-32 truncate">
                                {ans?.answer_text || '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FurinaCard>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}