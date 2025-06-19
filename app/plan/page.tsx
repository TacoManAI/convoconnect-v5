'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { CarePlan } from '@/lib/types'
import type { SimplifiedPlan } from '@/lib/types'
import { PlanView } from '@/app/components/PlanView'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PlanPage() {
  const [plan, setPlan] = useState<CarePlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPlan = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching plan', error)
      } else {
        setPlan(data as CarePlan)
      }
      setIsLoading(false)
    }

    fetchPlan()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <CardTitle>No Active Care Plan</CardTitle>
            <CardDescription>
              It looks like you don\'t have an active care plan. Start by creating one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              className="px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => router.push('/plan/create')}
            >
              Create Care Plan
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!plan.simplified_plan_json) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <CardTitle>Your plan is processing</CardTitle>
            <CardDescription>
              We\'re simplifying your instructions. This usually takes less than a minute.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto mb-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">My Care Plan</h1>
        <PlanView plan={plan.simplified_plan_json as SimplifiedPlan} />
      </div>
    </div>
  )
} 