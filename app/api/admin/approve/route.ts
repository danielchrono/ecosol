import prisma from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/auth-check";

export async function POST(req: Request) {
  // Proteção de rota nível servidor
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const body = await req.json();
  const { id } = body;
  
  await prisma.service.update({ 
    where: { id }, 
    data: { approved: true } 
  });
  
  return new Response(JSON.stringify({ ok: true }));
}