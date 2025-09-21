import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Loader2, ArrowRight, User, Database, Upload, TestTube } from 'lucide-react'

interface TestResult {
  step: string
  status: 'pending' | 'success' | 'error'
  message: string
}

export default function IntegrationTest() {
  const [user, setUser] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [overallProgress, setOverallProgress] = useState(0)

  const testSteps = [
    { id: 'auth', name: 'Authentication Check', icon: User },
    { id: 'profile', name: 'Profile Data', icon: User },
    { id: 'datasets', name: 'Dataset Access', icon: Database },
    { id: 'upload', name: 'Upload System', icon: Upload }
  ]

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const runIntegrationTest = async () => {
    if (!user) {
      setTestResults([{
        step: 'Authentication',
        status: 'error',
        message: 'User not logged in. Please login first.'
      }])
      return
    }

    setTesting(true)
    setTestResults([])
    setOverallProgress(0)

    const results: TestResult[] = []

    // Test 1: Authentication
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        results.push({
          step: 'Authentication',
          status: 'success',
          message: `User authenticated: ${authUser.email}`
        })
        setOverallProgress(25)
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error: any) {
      results.push({
        step: 'Authentication',
        status: 'error',
        message: error.message
      })
    }

    setTestResults([...results])
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 2: Profile Data
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (profile) {
        results.push({
          step: 'Profile Data',
          status: 'success',
          message: `Profile found with preferences: ${profile.age_group || 'Not set'}, ${profile.language_preference || 'Not set'}`
        })
      } else {
        results.push({
          step: 'Profile Data',
          status: 'success',
          message: 'No profile data (ready for setup)'
        })
      }
      setOverallProgress(50)
    } catch (error: any) {
      results.push({
        step: 'Profile Data',
        status: 'error',
        message: error.message
      })
    }

    setTestResults([...results])
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 3: Dataset Access
    try {
      const { data: datasets, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const count = datasets?.length || 0
      results.push({
        step: 'Dataset Access',
        status: 'success',
        message: `Database accessible. User has ${count} datasets.`
      })
      setOverallProgress(75)
    } catch (error: any) {
      results.push({
        step: 'Dataset Access',
        status: 'error',
        message: error.message
      })
    }

    setTestResults([...results])
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 4: Upload System
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error) throw error

      const hasDatasetBucket = buckets.some(bucket => bucket.name === 'datasets')
      if (hasDatasetBucket) {
        results.push({
          step: 'Upload System',
          status: 'success',
          message: 'File storage system ready for uploads'
        })
      } else {
        results.push({
          step: 'Upload System',
          status: 'error',
          message: 'Dataset storage bucket not found'
        })
      }
      setOverallProgress(100)
    } catch (error: any) {
      results.push({
        step: 'Upload System',
        status: 'error',
        message: error.message
      })
      setOverallProgress(100)
    }

    setTestResults(results)
    setTesting(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-secondary py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Integration Testing</h1>
          <p className="text-muted-foreground">
            Complete system flow verification from authentication to dataset management
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Flow */}
          <div className="space-y-6">
            <Card className="card-professional animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="mr-2 h-5 w-5 text-primary" />
                  Integration Test Suite
                </CardTitle>
                <CardDescription>
                  Tests the complete application workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!user ? (
                    <div className="text-center py-8">
                      <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Please login to run integration tests</p>
                      <Link to="/login">
                        <Button className="btn-professional bg-gradient-professional">
                          Go to Login
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {testSteps.map((step, index) => {
                          const Icon = step.icon
                          const result = testResults.find(r => r.step.includes(step.name.split(' ')[0]))
                          
                          return (
                            <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{step.name}</p>
                                {result && (
                                  <p className="text-xs text-muted-foreground">{result.message}</p>
                                )}
                              </div>
                              {result && getStatusIcon(result.status)}
                            </div>
                          )
                        })}
                      </div>

                      {testing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Test Progress</span>
                            <span>{overallProgress}%</span>
                          </div>
                          <Progress value={overallProgress} className="h-2" />
                        </div>
                      )}

                      <Button
                        onClick={runIntegrationTest}
                        disabled={testing}
                        className="w-full btn-professional bg-gradient-professional"
                      >
                        {testing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Tests...
                          </>
                        ) : (
                          <>
                            <TestTube className="mr-2 h-4 w-4" />
                            Run Integration Test
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flow Demonstration */}
          <div className="space-y-6">
            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle>Application Flow</CardTitle>
                <CardDescription>
                  Complete user journey demonstration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Authentication</p>
                        <p className="text-xs text-muted-foreground">Register → Login</p>
                      </div>
                    </div>
                    <Link to="/register">
                      <Button size="sm" variant="outline" className="btn-professional">
                        Try <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Profile Setup</p>
                        <p className="text-xs text-muted-foreground">Age group → Language</p>
                      </div>
                    </div>
                    <Link to="/profile">
                      <Button size="sm" variant="outline" className="btn-professional">
                        Setup <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Dataset Upload</p>
                        <p className="text-xs text-muted-foreground">Upload → Select</p>
                      </div>
                    </div>
                    <Link to="/datasets">
                      <Button size="sm" variant="outline" className="btn-professional">
                        Upload <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Integration Test</p>
                        <p className="text-xs text-muted-foreground">Verify flow works</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="btn-professional" disabled>
                      Current
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Test Results Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No tests run yet. Click "Run Integration Test" to begin.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate:</span>
                      <span className="text-sm">
                        {testResults.filter(r => r.status === 'success').length} / {testResults.length}
                      </span>
                    </div>
                    <Progress 
                      value={(testResults.filter(r => r.status === 'success').length / testResults.length) * 100}
                      className="h-2"
                    />
                    <div className="mt-4 space-y-1">
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-start space-x-2 text-xs">
                          {getStatusIcon(result.status)}
                          <span className={result.status === 'success' ? 'text-success' : 'text-destructive'}>
                            {result.step}: {result.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}