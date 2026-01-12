import prisma from "@/lib/prisma";
import Header from "@/components/header";
import ContactIcons from "@/components/contact-icons";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers"; // Importamos para checar o admin

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 1. Verificação de Admin para mostrar o botão de edição
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_token")?.value === process.env.ADMIN_SECRET;

  const service = await prisma.service.findUnique({
    where: { id: parseInt(id) },
  }); 

  if (!service || (!service.approved && !service.suspended && !isAdmin)) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      
      <main className="mx-auto max-w-4xl p-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline inline-block">
            &larr; Voltar para a busca
          </Link>

          {/* 2. Botão que só aparece para você */}
          {isAdmin && (
            <Link href={`/admin/provider/${id}/edit`}>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                ⚙️ Editar como Admin
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row gap-8">
          {/* Lado Esquerdo: Imagem */}
          <div className="w-full md:w-1/3 aspect-square rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl text-slate-300">🏢</span>
            )}
          </div>

          {/* Lado Direito: Informações */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  {service.category}
                </span>
                {isAdmin && !service.approved && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">
                    PENDENTE
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-slate-900">{service.name}</h1>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Contatos e Redes</h3>
              <div className="scale-125 origin-left pl-2">
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
            </div>

            <div className="pt-6">
              <p className="text-slate-600 text-sm leading-relaxed italic">
                Este negócio faz parte da rede Ecosol - Economia Solidária Entre Autistas. 
                Ao contratar este serviço, você apoia diretamente um empreendedor da nossa comunidade.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              {service.whatsapp && (
                <a 
                  href={
                    service.whatsapp.startsWith('http') 
                      ? service.whatsapp 
                      : `https://wa.me/${service.whatsapp.replace(/\D/g, '')}`
                  } 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Chamar no WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}