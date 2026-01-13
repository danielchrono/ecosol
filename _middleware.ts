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

  // 3. REFRESH: Vital para segurança. getUser() valida o token no servidor
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Definimos todas as rotas que exigem login
  const isProtectedPage = 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/submit')

  const isLoginPage = pathname === '/login'

  // 4. LÓGICA DE REDIRECIONAMENTO
  
  // BLOQUEIO: Se não houver usuário e a página for protegida (ex: /profile)
  if (!user && isProtectedPage) {
    const url = new URL('/login', request.url)
    // Opcional: Adiciona o parâmetro de retorno para facilitar o UX após o login
    url.searchParams.set('next', pathname) 
    return NextResponse.redirect(url)
  }

  // PREVENÇÃO: Se já houver usuário e ele tentar acessar o /login
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto as estáticas e de API
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}