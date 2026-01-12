import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Busca os dados atuais do perfil
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, phone: true, bio: true } // Selecionamos apenas o necessário
    });

    return NextResponse.json(user || { name: "", phone: "", bio: "" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, bio } = body;

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { name, phone, bio },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Erro na API de Perfil:", err);
    return NextResponse.json({ error: "Erro ao salvar dados no banco" }, { status: 500 });
  }
}