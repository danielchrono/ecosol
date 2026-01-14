import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  // Se não houver e-mail, não podemos assumir nada além do padrão básico
  if (!email) return NextResponse.json({ role: "USER" });

  try {
    // 1. Tenta buscar a role no banco
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    });

    /**
     * 2. LAZY SYNC (Visão de Engenharia):
     * Se o usuário logou no Auth mas não está no Prisma, criamos o registro agora.
     * Isso evita erros 404/500 em outras APIs que dependem do ID do usuário.
     */
    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Nome provisório baseado no e-mail
          role: "USER" // Role padrão definida no seu schema
        },
        select: { role: true }
      });
      return NextResponse.json({ role: newUser.role });
    }

    // 3. Retorna a role encontrada (ADMIN ou USER)
    return NextResponse.json({ role: user.role });
    
  } catch (error) {
    console.error("Erro crítico na API de Role:", error);
    // Fallback de segurança para não travar o login do usuário
    return NextResponse.json({ role: "USER" }, { status: 200 });
  }
}