"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

/**
 * CONFIGURAÇÃO GMAIL (Nodemailer)
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * HELPER: Validação de Autenticação e Permissão (Engenharia de Sessão)
 * Sincronização robusta entre Session Storage e Prisma
 */
async function getAuthContext(id?: number) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Em Server Actions, o Next.js às vezes restringe a escrita de cookies
            // se a resposta já começou a ser enviada. O try/catch blinda a execução.
          }
        },
      },
    }
  );

  // Recupera o usuário da sessão (AQUI É ONDE O ERRO NASCIA)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("❌ [AUTH ERROR] Sessão inválida ou expirada.");
    return { user: null, isAdmin: false, isOwner: false };
  }

  // Busca a Role no Prisma (Normalização de email para evitar conflitos de Case)
  const dbUser = await prisma.user.findUnique({ 
    where: { email: user.email!.toLowerCase() }, 
    select: { role: true, name: true } 
  });

  // LOG de auditoria para o seu terminal
  console.log(`👤 [SESSION] Email: ${user.email} | Role no Banco: ${dbUser?.role}`);

  let service = null;
  if (id) {
    service = await prisma.service.findUnique({ where: { id: Number(id) } });
  }

  return {
    user,
    userName: dbUser?.name || "Usuário",
    isAdmin: dbUser?.role === "ADMIN",
    isOwner: service?.email?.toLowerCase() === user.email?.toLowerCase(),
    service
  };
}

/**
 * ATUALIZAÇÃO: Edição de cadastro (Preservando todos os campos e normalizando categoria)
 */
export async function updateServiceAction(id: number, formData: any) {
  const auth = await getAuthContext(id);
  if (!auth.isAdmin && !auth.isOwner) throw new Error("Ação restrita");

  try {
    const updated = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        name: formData.name,
        // NORMALIZAÇÃO AQUI: Remove espaços e coloca em minúsculo para evitar duplicidade visual
        category: formData.category ? formData.category.trim().toLowerCase() : formData.category,
        description: formData.description,
        image: formData.image,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        email: formData.email,
        site: formData.site,
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false };
  }
}

/**
 * SOFT DELETE: Lixeira (Individual)
 */
export async function deleteServiceAction(id: number) {
  const auth = await getAuthContext(id);
  if (!auth.isAdmin && !auth.isOwner) throw new Error("Ação restrita");

  try {
    await prisma.service.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date(), approved: false }
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/trash");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * BATCH APPROVE: Aprova e envia e-mails via GMAIL (Template Original)
 */
export async function approveServicesBatchAction(ids: number[]) {
  const auth = await getAuthContext();
  if (!auth.isAdmin) throw new Error("Ação restrita");

  try {
    const cleanIds = ids.map(id => Number(id));

    const items = await prisma.service.findMany({
      where: { id: { in: cleanIds } },
      select: { name: true, email: true }
    });

    await prisma.service.updateMany({
      where: { id: { in: cleanIds } },
      data: { approved: true, deletedAt: null }
    });

    // Notificação via Gmail (Mantendo o HTML Original)
    await Promise.allSettled(
      items.map(async (item) => {
        if (!item.email) return;
        try {
          await transporter.sendMail({
            from: `"Ecosol" <${process.env.GMAIL_USER}>`,
            to: item.email,
            subject: '🎉 Seu negócio foi aprovado na Ecosol!',
            html: `
              <div style="font-family: sans-serif; background-color: #f8fafc; padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 30px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                  <div style="background: #2563eb; padding: 30px; text-align: center; color: #fff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900;">ECOSOL</h1>
                    <p style="margin: 5px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Entre Autistas</p>
                  </div>
                  <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #0f172a; font-size: 20px;">Boas notícias!</h2>
                    <p style="color: #64748b; line-height: 1.6;">O cadastro de <strong>${item.name}</strong> foi aprovado e já está visível para a comunidade.</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
                       style="display: inline-block; margin-top: 25px; background: #2563eb; color: #fff; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                      Ver no Site
                    </a>
                  </div>
                  <div style="padding: 20px; background: #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
                    Atenciosamente, <strong>Equipe Ecosol</strong>
                  </div>
                </div>
              </div>
            `
          });
        } catch (mailErr) {
          console.error(`Erro e-mail para ${item.email}:`, mailErr);
        }
      })
    );

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Batch Approve Error:", error);
    return { success: false };
  }
}

/**
 * RESTORE: Recupera da lixeira (Individual)
 */
export async function restoreServiceAction(id: number) {
  const auth = await getAuthContext(id);
  if (!auth.isAdmin) throw new Error("Ação restrita");

  try {
    await prisma.service.update({
      where: { id: Number(id) },
      data: { deletedAt: null }
    });
    revalidatePath("/");
    revalidatePath("/admin/trash");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * HARD DELETE: Permanente (Individual)
 */
export async function permanentDeleteAction(id: number) {
  const auth = await getAuthContext(id);
  if (!auth.isAdmin) throw new Error("Ação restrita");

  try {
    await prisma.service.delete({ where: { id: Number(id) } });
    revalidatePath("/admin/trash");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * BATCH REMOVE: Lixeira em massa
 */
export async function removeServicesBatchAction(ids: number[]) {
  const auth = await getAuthContext();
  if (!auth.isAdmin) throw new Error("Ação restrita");

  try {
    const cleanIds = ids.map(id => Number(id));
    await prisma.service.updateMany({
      where: { id: { in: cleanIds } },
      data: { deletedAt: new Date(), approved: false }
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/trash");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Batch Remove Error:", error);
    return { success: false };
  }
}

/**
 * BATCH RESTORE: Recuperação em massa
 */
export async function restoreServicesBatchAction(ids: number[]) {
  const auth = await getAuthContext();
  if (!auth.isAdmin) throw new Error("Ação restrita");

  try {
    const cleanIds = ids.map(id => Number(id));
    await prisma.service.updateMany({
      where: { id: { in: cleanIds } },
      data: { deletedAt: null }
    });
    revalidatePath("/admin/trash");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Batch Restore Error:", error);
    return { success: false };
  }
}

/**
 * BATCH PERMANENT DELETE: Exclusão em massa
 */
export async function deleteServicesBatchAction(ids: number[]) {
  const auth = await getAuthContext();
  if (!auth.isAdmin) throw new Error("Ação restrita");

  try {
    const cleanIds = ids.map(id => Number(id));
    await prisma.service.deleteMany({
      where: { id: { in: cleanIds } }
    });
    revalidatePath("/admin/trash");
    return { success: true };
  } catch (error) {
    console.error("Batch Delete Error:", error);
    return { success: false };
  }
}