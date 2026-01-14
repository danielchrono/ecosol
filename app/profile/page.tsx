import prisma from "@/lib/prisma";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr';
import NotificationActions from "@/components/notification-actions";
import { UserCircle, Settings, Bell, Eye, MessageSquare } from "lucide-react";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notifications: { orderBy: { createdAt: 'desc' }, take: 5 } }
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: "USER"
      },
      include: { notifications: true }
    });
  }

  const [service, unreadCount, totalCount] = await Promise.all([
    prisma.service.findFirst({ where: { email: user.email! } }),
    prisma.notification.count({ where: { userId: dbUser.id, read: false } }),
    prisma.notification.count({ where: { userId: dbUser.id } })
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      <Header />
      <main className="mx-auto max-w-5xl p-6 py-12">
        
        {/* HEADER DO PERFIL: bg-blue-600 -> bg-primary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-primary rounded-4xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
              <UserCircle className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Meu Perfil</h1>
              <p className="text-muted-foreground font-medium italic text-sm">{user.email}</p>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" className="rounded-2xl border-border bg-card px-6 h-12 font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm hover:bg-muted">
              <Settings className="w-4 h-4" /> Configurações
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* INFO CARD: bg-white -> bg-card */}
          <div className="lg:col-span-2 bg-card p-10 rounded-[2.5rem] shadow-md border border-border flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Nome cadastrado</label>
                <p className="text-xl font-black text-foreground tracking-tight uppercase">{dbUser.name || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Contato WhatsApp</label>
                <p className="text-xl font-black text-foreground tracking-tight">{dbUser.phone || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* VISUALIZAÇÕES CARD: Destaque Dinâmico */}
          <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <Eye className="w-24 h-24 text-primary-foreground" />
            </div>
            <h3 className="text-7xl font-black text-primary-foreground tracking-tighter leading-none">{service?.views || 0}</h3>
            <p className="text-primary-foreground/80 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Visitas no seu Card</p>
          </div>
        </div>

        {/* NOTIFICAÇÕES: bg-white -> bg-card */}
        <section className="bg-card rounded-[2.5rem] shadow-md border border-border overflow-hidden">
          <div className="px-10 py-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Notificações</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Fluxo de Atividade</p>
              </div>
            </div>
            <NotificationActions email={user.email!} unreadCount={unreadCount} totalCount={totalCount} />
          </div>
          
          <div className="p-4 sm:p-10 space-y-4 bg-card">
            {dbUser.notifications.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic text-sm">Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              dbUser.notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`group p-6 rounded-3xl border transition-all duration-300 ${
                    n.read 
                      ? 'bg-muted/10 border-border opacity-50' 
                      : 'bg-primary/5 border-primary/20 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-8">
                    <p className={`text-sm leading-relaxed ${n.read ? 'text-muted-foreground font-medium' : 'text-foreground font-black'}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase whitespace-nowrap pt-1 font-mono">
                      {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}