import { createBrowserClient, CookieOptions } from '@supabase/ssr';

export const createClient = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Return a dummy client for server-side that will be replaced on client-side
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => '',
          set: () => {},
          remove: () => {},
        },
      }
    );
  }

  // Client-side code
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : ''
        },
        set(name: string, value: string, options: CookieOptions) {
          document.cookie = `${name}=${value}; path=${options.path || '/'}`
        },
        remove(name: string, options: CookieOptions) {
          document.cookie = `${name}=; path=${options.path || '/'};  max-age=0`
        },
      },
    }
  )
}