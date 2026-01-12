import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ role: "USER" });

  // Usamos findUnique que é indexado e muito veloz
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true } // Buscamos APENAS a role para economizar banda
  });

  return NextResponse.json({ role: user?.role || "USER" });
}