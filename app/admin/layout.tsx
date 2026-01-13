import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* No layout apenas lemos */ }
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Camada de segurança 2: Bloqueio no Servidor
  if (!user) redirect('/login')

  // Verificação de Role via Banco (Redundância de segurança)
  const roleRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/role?email=${user.email}`)
  const { role } = await roleRes.json()

  if (role !== 'ADMIN') {
    redirect('/profile')
  }

  return <>{children}</>
}