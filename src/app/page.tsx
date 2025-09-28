'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Users, Target, BarChart3, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/intake' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Ready for your next career reality check?
            </p>
            <Link href="/intake">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Start New Reality Check
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Career Reality Coach
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Stop romanticizing careers. Get brutally honest answers about what it&apos;s 
            <em className="text-teal-600 font-semibold"> actually like</em> to work in your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6"
              onClick={() => handleSignIn('google')}
              disabled={isLoading}
            >
              Start Reality Check
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => handleSignIn('email')}
              disabled={isLoading}
            >
              Sign in with Email
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>1. Tell Us About You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Share your target career, location, age, and current qualifications. 
                  We'll customize the experience just for you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>2. Answer Brutally Honest Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our AI coach asks 12-20 specific yes/no questions about the reality 
                  of your chosen career. No fluff, just facts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>3. Get Your Reality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Receive a detailed fit score, mismatch analysis, next steps checklist, 
                  and alternative career suggestions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Career Reality Coach?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">US-First Data</h3>
                  <p className="text-slate-600">
                    All career facts, licensing requirements, and salary data are 
                    specific to your state and current market conditions.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Adaptive Questioning</h3>
                  <p className="text-slate-600">
                    Questions adapt based on your answers. Get personalized insights 
                    without wasting time on irrelevant questions.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Actionable Results</h3>
                  <p className="text-slate-600">
                    Get specific next steps, alternative career suggestions, and 
                    a downloadable report you can reference later.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Brutally Honest</h3>
                  <p className="text-slate-600">
                    We cut through the romanticized version of careers to show you 
                    what the work actually entails day-to-day.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Free at Launch</h3>
                  <p className="text-slate-600">
                    No credit card required. Get your complete career reality check 
                    and start making informed decisions today.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Privacy Focused</h3>
                  <p className="text-slate-600">
                    Your data is encrypted and never shared. You can delete your 
                    information at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-slate-900 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to face the reality?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of people who've discovered what their dream career 
            actually looks like.
          </p>
          <Button 
            size="lg" 
            className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6"
            onClick={() => handleSignIn('google')}
            disabled={isLoading}
          >
            Start Your Reality Check
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}