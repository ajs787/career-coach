'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const AGE_RANGES = [
  '18-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60+'
]

interface IntakeData {
  targetRole: string
  state: string
  ageRange: string
  hasQuals: boolean
  constraints: string
}

export default function IntakePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<IntakeData>({
    targetRole: '',
    state: '',
    ageRange: '',
    hasQuals: false,
    constraints: ''
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/')
    return null
  }

  const steps = [
    { number: 1, title: 'Target Career', description: 'What career are you considering?' },
    { number: 2, title: 'Location', description: 'Which state are you in?' },
    { number: 3, title: 'Age Range', description: 'How old are you?' },
    { number: 4, title: 'Qualifications', description: 'Do you have relevant qualifications?' },
    { number: 5, title: 'Constraints', description: 'Any specific constraints or preferences?' }
  ]

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!data.targetRole || !data.state || !data.ageRange) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const { sessionId } = await response.json()
      router.push(`/questions/${sessionId}`)
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to start your reality check. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return data.targetRole.trim() !== ''
      case 2: return data.state !== ''
      case 3: return data.ageRange !== ''
      case 4: return data.hasQuals !== undefined
      case 5: return true
      default: return false
    }
  }

  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Let's get to know you
          </h1>
          <p className="text-slate-600">
            We'll customize your career reality check based on your situation
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Step {currentStep} of 5</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.number
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <div className="text-center mt-2">
                <div className="text-xs font-medium text-slate-900">{step.title}</div>
                <div className="text-xs text-slate-500 hidden sm:block">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Target Career */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Label htmlFor="targetRole">What career are you considering? *</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g., Registered Nurse, Software Engineer, Real Estate Agent"
                  value={data.targetRole}
                  onChange={(e) => setData({ ...data, targetRole: e.target.value })}
                  className="text-lg"
                />
                <p className="text-sm text-slate-500">
                  Be specific about the role you're interested in. This helps us ask the right questions.
                </p>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Label htmlFor="state">Which US state are you in? *</Label>
                <Select value={data.state} onValueChange={(value) => setData({ ...data, state: value })}>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  We'll customize licensing requirements and salary data for your state.
                </p>
              </div>
            )}

            {/* Step 3: Age Range */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Label htmlFor="ageRange">What's your age range? *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {AGE_RANGES.map((range) => (
                    <Button
                      key={range}
                      variant={data.ageRange === range ? 'default' : 'outline'}
                      onClick={() => setData({ ...data, ageRange: range })}
                      className="h-12"
                    >
                      {range}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  This helps us understand your career stage and timeline.
                </p>
              </div>
            )}

            {/* Step 4: Qualifications */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Label>Do you have relevant qualifications for this career? *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={data.hasQuals === true ? 'default' : 'outline'}
                    onClick={() => setData({ ...data, hasQuals: true })}
                    className="h-16 text-lg"
                  >
                    Yes, I have qualifications
                  </Button>
                  <Button
                    variant={data.hasQuals === false ? 'default' : 'outline'}
                    onClick={() => setData({ ...data, hasQuals: false })}
                    className="h-16 text-lg"
                  >
                    No, I don't have qualifications
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  This affects the questions we ask about training and entry requirements.
                </p>
              </div>
            )}

            {/* Step 5: Constraints */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <Label htmlFor="constraints">Any specific constraints or preferences?</Label>
                <Textarea
                  id="constraints"
                  placeholder="e.g., Can't work nights, need to work from home, have family obligations, budget constraints..."
                  value={data.constraints}
                  onChange={(e) => setData({ ...data, constraints: e.target.value })}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-slate-500">
                  Optional: Tell us about any limitations or preferences that might affect your career choice.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || isLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? 'Starting...' : 'Start Reality Check'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
