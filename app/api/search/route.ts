import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  try {
    const services = await prisma.service.findMany({
      where: {
        approved: true,
        suspended: false,
        deletedAt: null,
        // Filtro de Categoria Condicional
        ...(category && category !== "Todas" ? { category } : {}),
        // Busca por Texto
        OR: q ? [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}