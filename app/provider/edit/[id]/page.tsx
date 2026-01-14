import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/header";
import EditServiceForm from "../edit-form";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';
import { Settings2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const [{ data: { user } }, service] = await Promise.all([
    supabase.auth.getUser(),
    prisma.service.findUnique({ where: { id: parseInt(id) } })
  ]);

  if (!service) return notFound();

  const dbUser = user ? await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  }) : null;

  const isAdmin = dbUser?.role === "ADMIN";
  const isOwner = user?.email === service.email;

  // Segurança de Acesso: Bloqueio de carga não autorizada
  if (!isAdmin && !isOwner) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      <Header />
      
      <main className="mx-auto max-w-2xl p-6 py-12">
        {/* Navegação de Retorno */}
        <div className="mb-8">
          <Link 
            href={isAdmin ? "/admin/dashboard" : `/provider/${id}`}
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            {isAdmin ? "Voltar ao Painel" : "Ver meu perfil"}
          </Link>
        </div>

        {/* Cabeçalho de Engenharia */}
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Settings2 size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
              Editar Cadastro
            </h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">
              {isAdmin ? "🔧 Modo Administrador / Auditoria" : "👤 Atualizando Dados do Empreendedor"}
            </p>
          </div>
        </div>

        {/* Card do Formulário: bg-white -> bg-card | border-slate-200 -> border-border */}
        <div className="bg-card p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
          <EditServiceForm service={service} />
        </div>
      </main>
    </div>
  );
}