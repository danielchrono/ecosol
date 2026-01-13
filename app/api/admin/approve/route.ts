import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    const updated = await prisma.service.updateMany({
      where: { id: { in: ids.map(Number) } },
      data: { approved: true },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    return NextResponse.json({ error: "Falha na aprovação em lote" }, { status: 500 });
  }
}