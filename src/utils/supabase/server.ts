import { createServerClient } from '@supabase/ssr'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // In server components, we'll handle cookies differently
          // This is a simplified approach that doesn't rely on Next.js cookies API
          return undefined // Return undefined since we can't access cookies directly in server components
        },
        set(name: string, value: string, options: any) {
          // We'll handle setting cookies through headers in server components
          // This is a no-op here since server components can't set cookies directly
        },
        remove(name: string, options: any) {
          // This is a no-op here since server components can't set cookies directly
        },
      },
    }
  )
}