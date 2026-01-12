import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: Marcar notificação individual como lida
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notification.update({
      where: { id: parseInt(params.id) },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE: Excluir notificação individual
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notification.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}