import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, {
            ...options,
            sameSite: options.sameSite as "lax" | "strict" | "none" | undefined
          })
        },
        remove(name: string) {
          response.cookies.delete(name)
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // List of paths that don't require authentication
  const publicPaths = ['/', '/auth']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  // Only redirect to /auth for protected routes when user is not signed in
  if (!session && !isPublicPath && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If user is signed in and the current path is /auth,
  // redirect the user to /
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all routes that require authentication:
     * - /dashboard routes (all dashboard pages)
     * - /api routes (except public endpoints)
     */
    '/dashboard/:path*',
    '/api/:path*',
  ],
} 