'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, X, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Question {
  id: string
  text: string
  bucket: string
  weight: number
  order: number
}

interface Progress {
  current: number
  total: number
}

interface ScoringResult {
  fitScore: number
  color: 'green' | 'amber' | 'red'
  bucketScores: Record<string, number>
  mismatches: string[]
  confidence: number
  shouldStop: boolean
  stopReason?: string
}

export default function QuestionsPage({ params }: { params: { sessionId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      loadNextQuestion()
    }
  }, [status, params.sessionId])

  const loadNextQuestion = async () => {
    try {
      const response = await fetch('/api/question/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: params.sessionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to load question')
      }

      const data = await response.json()
      setCurrentQuestion(data.question)
      setProgress(data.progress)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading question:', error)
      toast.error('Failed to load question. Please try again.')
      router.push('/intake')
    }
  }

  const submitAnswer = async (value: boolean) => {
    if (!currentQuestion) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          questionId: currentQuestion.id,
          value,
          note: note.trim() || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await response.json()
      
      if (data.done) {
        // Session completed, redirect to results
        toast.success('Reality check complete! Generating your results...')
        router.push(`/results/${params.sessionId}`)
      } else {
        // Load next question
        setNote('')
        setShowNote(false)
        loadNextQuestion()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case 'personality': return 'bg-purple-100 text-purple-800'
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'commitment': return 'bg-orange-100 text-orange-800'
      case 'lifestyle': return 'bg-green-100 text-green-800'
      case 'entry': return 'bg-pink-100 text-pink-800'
      case 'unsexy': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBucketLabel = (bucket: string) => {
    switch (bucket) {
      case 'personality': return 'Personality Fit'
      case 'daily': return 'Daily Reality'
      case 'commitment': return 'Commitment'
      case 'lifestyle': return 'Lifestyle'
      case 'entry': return 'Entry Requirements'
      case 'unsexy': return 'Reality Check'
      default: return bucket
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            No more questions
          </h1>
          <p className="text-slate-600 mb-8">
            We have enough information to generate your results.
          </p>
          <Button onClick={() => router.push(`/results/${params.sessionId}`)}>
            View Results
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Career Reality Check
          </h1>
          <p className="text-slate-600">
            Answer honestly - this is about finding the right fit for you
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Question {progress.current} of {progress.total}</span>
            <span>{Math.round((progress.current / progress.total) * 100)}% complete</span>
          </div>
          <Progress value={(progress.current / progress.total) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBucketColor(currentQuestion.bucket)}`}>
                {getBucketLabel(currentQuestion.bucket)}
              </span>
              <span className="text-sm text-slate-500">
                Weight: {currentQuestion.weight}/10
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Note Section */}
            {showNote && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add a note (optional)
                </label>
                <Textarea
                  placeholder="Why did you answer this way? Any additional context?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Answer Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                size="lg"
                className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                onClick={() => submitAnswer(true)}
                disabled={isSubmitting}
              >
                <Check className="h-6 w-6 mr-2" />
                Yes
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1 h-16 text-lg"
                onClick={() => submitAnswer(false)}
                disabled={isSubmitting}
              >
                <X className="h-6 w-6 mr-2" />
                No
              </Button>
            </div>

            {/* Add Note Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowNote(!showNote)}
                className="text-slate-600 hover:text-slate-900"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showNote ? 'Hide note' : 'Add a note'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <div className="text-center text-sm text-slate-500">
          <p>Keyboard shortcuts: Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">1</kbd> for Yes, <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">2</kbd> for No</p>
        </div>
      </div>
    </div>
  )
}
