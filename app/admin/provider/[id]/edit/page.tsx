// app/admin/provider/[id]/edit/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Header from "@/components/header";
import EditServiceForm from "@/app/provider/edit/edit-form"; // Sua nova importação

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Busca o prestador no banco de dados
  const service = await prisma.service.findUnique({
    where: { id: parseInt(id) },
  });

  // Proteção de engenharia: Se o ID não existir, retorna 404
  if (!service) return notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6">Editar Prestador: {service.name}</h2>
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          {/* Passamos os dados do banco para o seu formulário editável */}
          <EditServiceForm service={service} />
        </div>
      </main>
    </div>
  );
}