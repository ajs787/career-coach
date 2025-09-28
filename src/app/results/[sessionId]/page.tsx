'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Mail, 
  Share2, 
  RotateCcw,
  TrendingUp,
  Users,
  Clock,
  Heart
} from 'lucide-react'
import { toast } from 'sonner'

interface Verdict {
  id: string
  fitScore: number
  color: 'green' | 'amber' | 'red'
  summary: string
  bucketScores: Record<string, number>
  mismatches: string[]
  nextSteps: string[]
  altCareers: Array<{ title: string; reason: string }>
  createdAt: string
}

interface Session {
  id: string
  targetRole: string
  state: string
  ageRange: string
  hasQuals: boolean
  constraints: string
  verdict: Verdict | null
}

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessionData, setSessionData] = useState<Session | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      loadResults()
    }
  }, [status, params.sessionId])

  const loadResults = async () => {
    try {
      // First try to get existing verdict
      const verdictResponse = await fetch(`/api/verdict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: params.sessionId }),
      })

      if (verdictResponse.ok) {
        const data = await verdictResponse.json()
        setVerdict(data.verdict)
        setSessionData({
          id: params.sessionId,
          targetRole: 'Loading...', // We'd need to fetch this from session
          state: 'Loading...',
          ageRange: 'Loading...',
          hasQuals: false,
          constraints: '',
          verdict: data.verdict
        })
      } else {
        // Generate new verdict
        setIsGenerating(true)
        const generateResponse = await fetch(`/api/verdict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: params.sessionId }),
        })

        if (generateResponse.ok) {
          const data = await generateResponse.json()
          setVerdict(data.verdict)
          setSessionData({
            id: params.sessionId,
            targetRole: 'Loading...',
            state: 'Loading...',
            ageRange: 'Loading...',
            hasQuals: false,
            constraints: '',
            verdict: data.verdict
          })
        } else {
          throw new Error('Failed to generate verdict')
        }
      }
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load results. Please try again.')
      router.push('/intake')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const getColorVerdict = (color: string) => {
    switch (color) {
      case 'green': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
      case 'amber': return { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertTriangle }
      case 'red': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle }
    }
  }

  const getBucketColor = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getBucketLabel = (bucket: string) => {
    switch (bucket) {
      case 'personality': return 'Personality Fit'
      case 'daily': return 'Daily Reality'
      case 'commitment': return 'Commitment'
      case 'lifestyle': return 'Lifestyle'
      default: return bucket
    }
  }

  const handleExportPDF = async () => {
    toast.info('PDF export coming soon!')
  }

  const handleEmailReport = async () => {
    toast.info('Email report coming soon!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Career Reality Check Results',
          text: `I just completed a career reality check for ${sessionData?.targetRole}. Check out my results!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isGenerating ? 'Generating your results...' : 'Loading your results...'}
          </p>
        </div>
      </div>
    )
  }

  if (!verdict) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Results not found
          </h1>
          <p className="text-slate-600 mb-8">
            We couldn't find your results. Please try again.
          </p>
          <Button onClick={() => router.push('/intake')}>
            Start New Reality Check
          </Button>
        </div>
      </div>
    )
  }

  const colorVerdict = getColorVerdict(verdict.color)
  const IconComponent = colorVerdict.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Your Reality Check Results
          </h1>
          <p className="text-xl text-slate-600">
            Here's what we discovered about your fit for {sessionData?.targetRole}
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-slate-900">{verdict.fitScore}</span>
            </div>
            <CardTitle className="text-2xl">Overall Fit Score</CardTitle>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${colorVerdict.bg} ${colorVerdict.text}`}>
              <IconComponent className="h-5 w-5 mr-2" />
              {verdict.color.toUpperCase()} FIT
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-slate-600 text-lg leading-relaxed">
              {verdict.summary}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Tabs defaultValue="breakdown" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="mismatches">Mismatches</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          </TabsList>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  How you scored in each important area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(verdict.bucketScores).map(([bucket, score]) => (
                  <div key={bucket} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{getBucketLabel(bucket)}</span>
                      <span className="text-slate-600">{score}%</span>
                    </div>
                    <Progress 
                      value={score} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mismatches Tab */}
          <TabsContent value="mismatches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Mismatches</CardTitle>
                <CardDescription>
                  Areas where your preferences don't align with this career
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verdict.mismatches.length > 0 ? (
                  <div className="space-y-3">
                    {verdict.mismatches.map((mismatch, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-red-800">{mismatch}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p>No significant mismatches found!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Action Plan</CardTitle>
                <CardDescription>
                  Specific steps to move forward with this career
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verdict.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-sm flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alternatives Tab */}
          <TabsContent value="alternatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alternative Careers</CardTitle>
                <CardDescription>
                  Other careers that might be a better fit for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verdict.altCareers.length > 0 ? (
                  <div className="grid gap-4">
                    {verdict.altCareers.map((career, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <h3 className="font-semibold text-slate-900 mb-2">{career.title}</h3>
                        <p className="text-slate-600 text-sm">{career.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <TrendingUp className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                    <p>This career appears to be a great fit for you!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Save, share, or start a new reality check
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={handleExportPDF} variant="outline" className="h-12">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleEmailReport} variant="outline" className="h-12">
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </Button>
              <Button onClick={handleShare} variant="outline" className="h-12">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button onClick={() => router.push('/intake')} className="h-12 bg-teal-600 hover:bg-teal-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
