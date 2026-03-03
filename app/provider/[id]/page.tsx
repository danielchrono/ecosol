import prisma from "@/lib/prisma";
import Header from "@/components/header";
import ContactIcons from "@/components/contact-icons";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';
import WhatsAppButton from "@/components/whatsapp-button";
import { ArrowLeft, Settings, Eye } from "lucide-react";

export default async function ProviderPage({
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
  const canEdit = isAdmin || isOwner;

  if (!service.approved && !canEdit) return notFound();

  if (service.approved && !canEdit) {
    await prisma.service.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });
  }

  return (
    /* Logística Visual: bg-slate-50 -> bg-background | text-slate-900 -> text-foreground */
    <div className="min-h-screen bg-background text-foreground pb-12 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        
        {/* 1. Navegação de Topo */}
        <div className="flex justify-between items-center mb-4 px-2">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3 w-3" /> Voltar para a busca
          </Link>
          
          {canEdit && (
            <Link href={isAdmin ? `/admin/provider/${id}/edit` : `/provider/edit/${id}`}>
              <Button variant="outline" className="h-8 border-primary/20 text-primary font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-primary/10 transition-all flex gap-2">
                <Settings className="h-3.5 w-3.5" />
                {isAdmin ? "Admin Edit" : "Editar Negócio"}
              </Button>
            </Link>
          )}
        </div>

        {/* 2. Card Principal: bg-white -> bg-card | border-slate-100 -> border-border */}
        <div className="bg-card rounded-[2.5rem] shadow-sm border border-border p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
          
          {/* Imagem: bg-slate-50 -> bg-muted */}
          <div className="w-full md:w-2/5 aspect-square rounded-4xl bg-muted overflow-hidden border border-border shadow-inner relative">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-6xl grayscale opacity-20">🏢</span>
              </div>
            )}
          </div>

          {/* Conteúdo: Hierarquia Visual Adaptativa */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              {/* Badge Categoria: bg-blue-50 -> bg-primary/10 */}
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.25em] px-3 py-1 bg-primary/10 rounded-full">
                {service.category}
              </span>
              {canEdit && (
                /* Badge Visitas: text-slate-400 -> text-muted-foreground | bg-slate-50 -> bg-muted */
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
                  <Eye className="h-3 w-3" /> {service.views} visitas
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase leading-none mb-4">
              {service.name}
            </h1>

            {/* Descrição: text-slate-500 -> text-muted-foreground */}
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap mb-8">
              {service.description}
            </p>

            <div className="mt-auto space-y-6">
              {/* Canais de Atendimento: text-slate-300 -> text-muted-foreground/50 */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                  Canais de Atendimento
                </h3>
                <ContactIcons 
                  contacts={{
                    whatsapp: service.whatsapp ?? undefined,
                    instagram: service.instagram ?? undefined,
                    tiktok: service.tiktok ?? undefined,
                    email: service.email ?? undefined,
                    site: service.site ?? undefined,
                  }} 
                />
              </div>

              <div className="pt-2">
                {service.whatsapp && (
                  <WhatsAppButton phone={service.whatsapp} providerEmail={service.email || ""} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}