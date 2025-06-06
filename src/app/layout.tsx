import './globals.css'
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Kard - Flashcard App',
  description: 'Simple Flashcard App',
}

async function getSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string) {
          cookieStore.delete(name)
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getSession() // We call this to initialize the session cookie

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
