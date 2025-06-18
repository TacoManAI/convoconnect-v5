'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function CreatePlanPage() {
  const [instructions, setInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!instructions.trim()) {
      setErrorMessage('Please paste your discharge instructions.')
      return
    }

    setIsSubmitting(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Insert new care plan record and fetch the inserted row
      const { data: plan, error } = await supabase
        .from('care_plans')
        .insert({
          user_id: user.id,
          original_instructions: instructions.trim(),
          simplified_plan_json: null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      // Fire the Edge Function in the background to simplify text
      supabase.functions.invoke('simplify-plan', {
        body: {
          care_plan_id: plan.id,
          original_instructions: instructions.trim(),
        },
      })

      // Redirect to dashboard or plan view page
      router.push('/dashboard')
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong, please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Care Plan</CardTitle>
          <CardDescription>
            Paste the discharge instructions you received from your healthcare provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="instructions" className="sr-only">
                Discharge Instructions
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={10}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-vertical"
                placeholder="Paste discharge instructions here..."
                disabled={isSubmitting}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-md">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Plan...' : 'Create Plan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 