import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('=== AUTH CALLBACK START ===')
  console.log('Full URL:', requestUrl.toString())
  console.log('Auth callback received code:', !!code)
  console.log('Error param:', error)
  console.log('Error description:', errorDescription)
  
  // If there's an error in the URL params, handle it
  if (error) {
    console.error('Auth callback URL error:', error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
  }

  if (code) {
    console.log('Code value (first 10 chars):', code.substring(0, 10) + '...')
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      console.log('Attempting to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        return NextResponse.redirect(`${requestUrl.origin}/login?error=session_exchange_failed`)
      }

      console.log('Session exchange successful')
      console.log('Session data:', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
        userEmail: data.user?.email,
        userPhone: data.user?.phone
      })

      if (data.user && data.session) {
        // Check if user exists in our users table, if not create them
        console.log('Checking if user exists in users table...')
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist, create them
          console.log('Creating new user in users table...')
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email || null,
              phone: data.user.phone || null
            })

          if (insertError) {
            console.error('Error creating user:', insertError)
            // Don't fail the auth flow if user creation fails
            // The user is still authenticated in Supabase Auth
          } else {
            console.log('User created successfully')
          }
        } else if (userError) {
          console.error('Error checking user existence:', userError)
          // Don't fail the auth flow for this error
        } else {
          console.log('User already exists in users table')
        }

        // Always redirect to dashboard if we have a user and session
        const dashboardUrl = `${requestUrl.origin}/dashboard`
        console.log('Redirecting to dashboard:', dashboardUrl)
        
        const response = NextResponse.redirect(dashboardUrl)
        
        // Set additional cookies to ensure session persistence
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        
        console.log('Redirect response created with cookies')
        console.log('=== AUTH CALLBACK END (SUCCESS) ===')
        return response
      } else {
        console.error('No user or session data received after exchange')
        console.log('Data received:', { user: !!data.user, session: !!data.session })
        console.log('=== AUTH CALLBACK END (NO USER/SESSION) ===')
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user_session`)
      }
    } catch (error) {
      console.error('Unexpected auth error:', error)
      console.log('=== AUTH CALLBACK END (ERROR) ===')
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  console.log('No code provided, redirecting to login')
  console.log('=== AUTH CALLBACK END (NO CODE) ===')
  // If no code or other error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}