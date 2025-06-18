import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks and validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

let supabase: SupabaseClient

if (typeof window !== 'undefined') {
  // In the browser we leverage the auth-helpers client which automatically
  // syncs cookie-based sessions set by the server (e.g., in /auth/callback).
  supabase = createBrowserSupabaseClient()
} else {
  // On the server (e.g., during SSG/SSR utilities) we can fall back to a
  // simple client – note that server components/routes should use the
  // dedicated helpers (createRouteHandlerClient, createServerComponentClient, etc.).
  supabase = createClient(supabaseUrl!, supabaseAnonKey!)
}

export { supabase }

// For server-side operations that require elevated privileges
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

// Export a function to check if admin client is available
export const hasAdminClient = () => !!supabaseAdmin