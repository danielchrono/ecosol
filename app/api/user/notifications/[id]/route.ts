import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; //

// PATCH: Marcar notificação individual como lida
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Tipagem como Promise
) {
  try {
    const { id } = await params; // Resolução assíncrona do id
    
    await prisma.notification.update({
      where: { id: parseInt(id) }, // Uso do id resolvido no Prisma
      data: { read: true },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE: Excluir notificação individual
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Tipagem como Promise
) {
  try {
    const { id } = await params; // Resolução assíncrona do id
    
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}