import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { ids, type } = await request.json(); // Agora recebe 'ids' (array)

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs devem ser um array" }, { status: 400 });
    }

    if (type === "suspend") {
      await prisma.service.updateMany({
        where: { id: { in: ids.map(Number) } },
        data: { suspended: true },
      });
    } else if (type === "remove") {
      // Soft delete: apenas marca como excluído
      await prisma.service.updateMany({
        where: { id: { in: ids.map(Number) } },
        data: { deletedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao executar carga de ação" }, { status: 500 });
  }
}