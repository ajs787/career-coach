'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Database, 
  FileText, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface CareerFact {
  id: string
  state: string
  role: string
  licensing: string | null
  training: string | null
  costsUSD: string | null
  salaryUSD: string | null
  links: string[]
}

interface QuestionTemplate {
  id: string
  bucket: string
  pattern: string
  weight: number
  isActive: boolean
}

interface Session {
  id: string
  targetRole: string
  state: string
  status: string
  createdAt: string
  verdict: {
    fitScore: number
    color: string
  } | null
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [careerFacts, setCareerFacts] = useState<CareerFact[]>([])
  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is admin (simple check for demo)
  const isAdmin = session?.user?.email === 'admin@example.com'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && isAdmin) {
      loadData()
    }
  }, [status, isAdmin])

  const loadData = async () => {
    try {
      // Load career facts
      const factsResponse = await fetch('/api/admin/facts')
      if (factsResponse.ok) {
        const facts = await factsResponse.json()
        setCareerFacts(facts)
      }

      // Load question templates
      const templatesResponse = await fetch('/api/admin/templates')
      if (templatesResponse.ok) {
        const templates = await templatesResponse.json()
        setQuestionTemplates(templates)
      }

      // Load sessions
      const sessionsResponse = await fetch('/api/admin/sessions')
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Access Denied
          </h1>
          <p className="text-slate-600 mb-8">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Manage career facts, question templates, and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Career Facts</p>
                  <p className="text-2xl font-bold text-slate-900">{careerFacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Templates</p>
                  <p className="text-2xl font-bold text-slate-900">{questionTemplates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Sessions</p>
                  <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {sessions.filter(s => s.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="facts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="facts">Career Facts</TabsTrigger>
            <TabsTrigger value="templates">Question Templates</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Career Facts Tab */}
          <TabsContent value="facts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Career Facts</CardTitle>
                    <CardDescription>
                      Manage state-specific career information
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careerFacts.map((fact) => (
                    <div key={fact.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {fact.role} - {fact.state}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {fact.licensing && `Licensing: ${fact.licensing.substring(0, 100)}...`}
                          </p>
                          <p className="text-sm text-slate-600">
                            {fact.salaryUSD && `Salary: ${fact.salaryUSD}`}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Question Templates</CardTitle>
                    <CardDescription>
                      Manage question patterns for AI generation
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionTemplates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {template.bucket}
                            </span>
                            <span className="text-sm text-slate-500">
                              Weight: {template.weight}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              template.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-slate-900">{template.pattern}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Sessions</CardTitle>
                <CardDescription>
                  View completed and active reality checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {session.targetRole} - {session.state}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Age: {session.ageRange} • Status: {session.status}
                          </p>
                          <p className="text-sm text-slate-500">
                            Created: {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                          {session.verdict && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                session.verdict.color === 'green' 
                                  ? 'bg-green-100 text-green-700'
                                  : session.verdict.color === 'amber'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                Score: {session.verdict.fitScore}% ({session.verdict.color})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure scoring weights and system parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="personality-weight">Personality Weight</Label>
                      <Input id="personality-weight" defaultValue="35" />
                    </div>
                    <div>
                      <Label htmlFor="daily-weight">Daily Reality Weight</Label>
                      <Input id="daily-weight" defaultValue="25" />
                    </div>
                    <div>
                      <Label htmlFor="commitment-weight">Commitment Weight</Label>
                      <Input id="commitment-weight" defaultValue="20" />
                    </div>
                    <div>
                      <Label htmlFor="lifestyle-weight">Lifestyle Weight</Label>
                      <Input id="lifestyle-weight" defaultValue="20" />
                    </div>
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
