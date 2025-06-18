'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, LogOut, Plus, FileText, MessageSquare, BarChart3 } from 'lucide-react'
import type { CarePlan } from '@/lib/types'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [activePlan, setActivePlan] = useState<CarePlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Check for active care plan
        const { data: carePlan, error } = await supabase
          .from('care_plans')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching care plan:', error)
        } else if (carePlan) {
          setActivePlan(carePlan)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isProcessing = !!(activePlan && !activePlan.simplified_plan_json)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Aftercare Companion</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email || user?.phone}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">
            {activePlan ? (
              isProcessing
                ? 'Your care plan is being simplified. Hang tight – this only takes a moment.'
                : 'Your care plan is ready. Continue with your aftercare journey.'
            ) : (
              "Let's get started by creating your personalized care plan."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!activePlan ? (
            // No active plan - show create plan card
            <Card className="col-span-full">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Your Care Plan</span>
                </CardTitle>
                <CardDescription>
                  Upload your discharge instructions to get started with your personalized aftercare plan
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" onClick={() => router.push('/plan/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Care Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Active plan exists - show dashboard cards
            <>
              <Card className="hover:shadow-md transition-shadow cursor-pointer relative" onClick={() => router.push('/plan')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>My Care Plan</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span>View your simplified aftercare instructions</span>
                    {isProcessing && (
                      <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full animate-pulse">
                        Processing…
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(activePlan.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/check-in')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>AI Check-in</span>
                  </CardTitle>
                  <CardDescription>
                    Start your daily check-in with the AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Start Check-in
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/summary')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Progress Summary</span>
                  </CardTitle>
                  <CardDescription>
                    View your recovery progress and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track your healing journey
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}