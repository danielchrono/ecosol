import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trashed = await prisma.service.findMany({
      where: {
        deletedAt: { not: null },
      },
      orderBy: { deletedAt: 'desc' },
      // Selecionamos TUDO que o ServiceCard e o Dashboard precisam
      select: {
        id: true,
        name: true,
        category: true,
        image: true,
        description: true,
        whatsapp: true,
        instagram: true,
        tiktok: true,
        email: true,
        site: true,
        deletedAt: true,
      }
    });

    return NextResponse.json(trashed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao carregar limbo" }, { status: 500 });
  }
}