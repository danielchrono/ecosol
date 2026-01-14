import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Header from "@/components/header";
import EditServiceForm from "@/app/provider/edit/edit-form";
import { Settings2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const service = await prisma.service.findUnique({
    where: { id: parseInt(id) },
  });

  if (!service) return notFound();

  return (
    /* Logística Visual: Transição suave e fundo dinâmico */
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      <Header />
      
      <main className="mx-auto max-w-2xl p-6 py-12">
        {/* Navegação de Retorno: Alinhada com o Dashboard Admin */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Voltar ao Painel Admin
          </Link>
        </div>

        {/* Cabeçalho de Engenharia: Identificação clara do modo Admin */}
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm shadow-primary/5">
            <Settings2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
                Editar Cadastro
              </h2>
              <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full border border-primary/20 uppercase">
                Admin
              </span>
            </div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              Auditando: <span className="text-foreground">{service.name}</span>
            </p>
          </div>
        </div>

        {/* Container do Formulário: bg-white -> bg-card | border -> border-border */}
        <div className="bg-card p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 pb-4 border-b border-border flex items-center gap-2 text-primary">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Controle de Segurança Ativo</span>
          </div>
          
          <EditServiceForm service={service} />
        </div>
      </main>
    </div>
  );
}