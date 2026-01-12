import prisma from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/auth-check";

export async function GET() {
  const isAuthorized = await checkAdminAuth();
  
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Acesso negado" }), { status: 401 });
  }

  const pending = await prisma.service.findMany({ 
    where: { approved: false } 
  });
  
  return new Response(JSON.stringify(pending), { status: 200 });
}