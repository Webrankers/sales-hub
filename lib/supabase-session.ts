import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

/** Get the currently authenticated user from the session cookie (API routes / Server Components). */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},           // read-only in API routes
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
