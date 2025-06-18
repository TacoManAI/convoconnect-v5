'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const testConnection = async () => {
    setConnectionStatus('testing')
    setErrorMessage('')

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      setConnectionStatus('success')
    } catch (error: any) {
      setConnectionStatus('error')
      setErrorMessage(error.message || 'Unknown error occurred')
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            Testing connection to your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus === 'testing' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Testing connection...</p>
            </div>
          )}

          {connectionStatus === 'success' && (
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-2 text-sm font-medium text-green-600">Connection successful!</p>
              <p className="text-xs text-muted-foreground">Supabase is properly configured</p>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="text-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-2 text-sm font-medium text-red-600">Connection failed</p>
              <p className="text-xs text-muted-foreground mb-2">{errorMessage}</p>
            </div>
          )}

          <Button 
            onClick={testConnection} 
            className="w-full"
            disabled={connectionStatus === 'testing'}
          >
            Test Again
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Success: Database tables exist and are accessible</li>
              <li>Error: Check your .env.local file and Supabase project settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}