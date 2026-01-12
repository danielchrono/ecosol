"use server";

import prisma from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/auth-check";
import { revalidatePath } from "next/cache";

export async function updateServiceAction(id: number, data: any) {
  // 1. Verificação de segurança nível servidor
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) throw new Error("Não autorizado");

  // 2. Atualização no banco via Prisma 7
  await prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      description: data.description || null,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      tiktok: data.tiktok || null,
      email: data.email || null,
      site: data.site || null,
      image: data.image || null,
    },
  });

  // 3. Limpa o cache das páginas afetadas
  revalidatePath("/admin/dashboard");
  revalidatePath(`/provider/${id}`);

  return { success: true };
}