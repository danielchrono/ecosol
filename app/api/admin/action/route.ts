import prisma from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/auth-check";

export async function POST(req: Request) {
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const body = await req.json();
  const { id, type } = body;

  if (type === 'suspend') {
    await prisma.service.update({ 
      where: { id }, 
      data: { suspended: true } 
    });
    return new Response(JSON.stringify({ ok: true }));
  }

  if (type === 'remove') {
    await prisma.service.delete({ where: { id } });
    return new Response(JSON.stringify({ ok: true }));
  }

  return new Response(JSON.stringify({ ok: false }), { status: 400 });
}