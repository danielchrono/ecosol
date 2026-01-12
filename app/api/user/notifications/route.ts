import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "E-mail não fornecido" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

// MARCAR COMO LIDO (Individual ou em Lote)
export async function PATCH(request: Request) {
  try {
    const { ids, email, all } = await request.json();

    const whereClause: any = all ? { user: { email }, read: false } : { id: { in: ids } };

    await prisma.notification.updateMany({
      where: whereClause,
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// EXCLUIR (Individual ou em Lote)
export async function DELETE(request: Request) {
  try {
    const { ids, email, all } = await request.json();

    const whereClause: any = all ? { user: { email } } : { id: { in: ids } };

    await prisma.notification.deleteMany({
      where: whereClause
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}