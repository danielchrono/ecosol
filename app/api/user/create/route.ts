import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

    // UPSERT: Se o usuário já existir, ele não duplica. Se não existir, cria como USER.
    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // Não altera nada se já existir
      create: {
        email,
        role: "USER", // Garante o privilégio padrão
        name: email.split('@')[0], // Gera um nome provisório baseado no e-mail
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}