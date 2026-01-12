// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Tenta recuperar o usuário
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Lógica de Redirecionamento (Zelo de Engenharia)
  const isProfilePage = request.nextUrl.pathname.startsWith('/profile')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Se não houver usuário e tentar acessar perfil -> Login
  if (!user && isProfilePage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se houver usuário e tentar acessar login -> Perfil
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}