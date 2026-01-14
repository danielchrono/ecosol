import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ error: "E-mail requerido" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Visão de Engenharia: Retorna vazio em vez de erro para novos usuários
    if (!user) return NextResponse.json([]);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erro API Notifications:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { ids, email, all } = await request.json();
    const whereClause: Prisma.NotificationWhereInput = all ? { user: { email }, read: false } : { id: { in: ids } };

    await prisma.notification.updateMany({
      where: whereClause,
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids, email, all } = await request.json();
    const whereClause: Prisma.NotificationWhereInput = all ? { user: { email } } : { id: { in: ids } };

    await prisma.notification.deleteMany({ where: whereClause });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}