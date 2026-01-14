import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

    // Atualização em massa para performance
    await prisma.notification.updateMany({
      where: {
        user: { email: email },
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar banco" }, { status: 500 });
  }
}