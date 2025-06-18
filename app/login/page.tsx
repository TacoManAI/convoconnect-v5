'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const searchParams = useSearchParams()

  // Check for error parameters from auth callback
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      let errorMessage = 'An error occurred during authentication.'
      
      switch (error) {
        case 'auth_error':
          errorMessage = 'Authentication failed. Please try again.'
          break
        case 'no_user':
          errorMessage = 'No user data received. Please try again.'
          break
        case 'unexpected_error':
          errorMessage = 'An unexpected error occurred. Please try again.'
          break
        case 'auth_callback_error':
          errorMessage = 'Authentication callback failed. Please try again.'
          break
        case 'session_exchange_failed':
          errorMessage = 'Failed to create session. Please try again.'
          break
        case 'no_user_session':
          errorMessage = 'Session creation incomplete. Please try again.'
          break
      }
      
      console.log('Login page error:', error, errorMessage)
      setMessage(errorMessage)
      setIsSuccess(false)
    }
  }, [searchParams])

  const isEmail = (input: string) => {
    return input.includes('@') && input.includes('.')
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailOrPhone.trim()) {
      setMessage('Please enter your email or phone number')
      setIsSuccess(false)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const isEmailInput = isEmail(emailOrPhone.trim())
      
      if (isEmailInput) {
        // Send magic link via email
        console.log('Sending magic link to email:', emailOrPhone.trim())
        console.log('Redirect URL will be:', `${window.location.origin}/auth/callback`)
        
        const { data, error } = await supabase.auth.signInWithOtp({
          email: emailOrPhone.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        console.log('Magic link response:', { data, error })

        if (error) {
          console.error('Email auth error:', error)
          throw error
        }

        setMessage('Check your email for the magic link!')
        setIsSuccess(true)
      } else {
        // Send magic link via SMS
        console.log('Sending magic link to phone:', emailOrPhone.trim())
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: emailOrPhone.trim(),
          options: {
            // Note: Phone auth requires additional Supabase configuration
          }
        })

        console.log('SMS magic link response:', { data, error })

        if (error) {
          console.error('Phone auth error:', error)
          throw error
        }

        setMessage('Check your phone for the magic link!')
        setIsSuccess(true)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage(error.message || 'An error occurred. Please try again.')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email or phone number to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter email or phone number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {isEmail(emailOrPhone) ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-md flex items-start space-x-2 ${
                isSuccess 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {!isSuccess && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}