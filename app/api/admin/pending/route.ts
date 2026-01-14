import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Garante dados sempre frescos

export async function GET() {
  try {
    const pendingServices = await prisma.service.findMany({
      where: {
        approved: false,
        suspended: false,
        deletedAt: null, // Garante que não pega o que já foi para a lixeira
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pendingServices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro na carga de pendentes" }, { status: 500 });
  }
}