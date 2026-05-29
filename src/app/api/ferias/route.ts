import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ferias = await prisma.feria.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { comerciantes: true },
        },
      },
    });
    return NextResponse.json({ ferias });
  } catch (error) {
    console.error("[FERIAS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
