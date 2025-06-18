import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('=== MIDDLEWARE START ===')
  console.log('Request URL:', req.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Session exists:', !!session)
  console.log('User ID:', session?.user?.id)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/plan', '/check-in', '/summary']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Public routes that should redirect to dashboard if authenticated
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Auth callback should always be allowed through
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    console.log('Auth callback route - allowing through')
    console.log('=== MIDDLEWARE END (AUTH CALLBACK) ===')
    return res
  }

  console.log('Route analysis:', {
    isProtectedRoute,
    isPublicRoute,
    hasSession: !!session
  })

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    console.log('Redirecting to login - no session for protected route')
    console.log('=== MIDDLEWARE END (REDIRECT TO LOGIN) ===')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is authenticated and trying to access public route, redirect to dashboard
  if (isPublicRoute && session) {
    console.log('Redirecting to dashboard - has session for public route')
    console.log('=== MIDDLEWARE END (REDIRECT TO DASHBOARD) ===')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  console.log('Allowing request through')
  console.log('=== MIDDLEWARE END (PASS THROUGH) ===')
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - test-connection (allow access to test page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|test-connection).*)',
  ],
}