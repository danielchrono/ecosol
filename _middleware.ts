import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Criamos a resposta inicial
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Inicializamos o cliente com logística de persistência de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Sincroniza os cookies tanto na requisição quanto na resposta
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. REFRESH: Isso é vital.getUser() renova o token se necessário
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtectedPage = pathname.startsWith('/profile') || pathname.startsWith('/admin')
  const isLoginPage = pathname === '/login'

  // 4. REDIRECIONAMENTO COM PRESERVAÇÃO DE COOKIES
  if (!user && isProtectedPage) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = new URL('/profile', request.url)
    return NextResponse.redirect(url)
  }

  // 5. Retornamos a resposta que contém os cookies atualizados
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}