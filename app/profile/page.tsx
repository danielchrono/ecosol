import prisma from "@/lib/prisma";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr';
import NotificationActions from "@/components/notification-actions";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Busca paralela otimizada (Visão de Engenharia)
  const [dbUser, service, unreadCount, totalCount] = await Promise.all([
    prisma.user.findUnique({
      where: { email: user.email! },
      include: { notifications: { orderBy: { createdAt: 'desc' }, take: 5 } }
    }),
    prisma.service.findFirst({
      where: { email: user.email! },
    }),
    prisma.notification.count({
      where: { user: { email: user.email! }, read: false }
    }),
    prisma.notification.count({
      where: { user: { email: user.email! } }
    })
  ]);

  if (!dbUser) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      
      <main className="mx-auto max-w-4xl p-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
            <p className="text-slate-500 text-sm">Painel de controle Ecosol.</p>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" className="border-blue-200 text-blue-600">⚙️ Editar Dados</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Info Card */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl border shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome</label>
                <p className="font-medium">{dbUser.name || "---"}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp</label>
                <p className="font-medium">{dbUser.phone || "---"}</p>
              </div>
            </div>
          </div>

          {/* KPI Card */}
          <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg text-center">
            <span className="text-4xl mb-2 block">👁️</span>
            <h3 className="text-4xl font-black">{service?.views || 0}</h3>
            <p className="text-blue-100 text-[10px] font-bold uppercase mt-2">Visitas Totais</p>
          </div>
        </div>

        {/* Notificações */}
        <div className="mt-12 bg-white rounded-2xl border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">🔔 Notificações</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} novas
                </span>
              )}
            </div>
            {/* O componente controla a visibilidade dos botões internamente */}
            <NotificationActions 
              email={user.email!} 
              unreadCount={unreadCount} 
              totalCount={totalCount} 
            />
          </div>
          
          <div className="space-y-3">
            {dbUser.notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm italic">
                Sua caixa de entrada está vazia.
              </div>
            ) : (
              dbUser.notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    n.read ? 'bg-white opacity-50' : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-slate-800">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}