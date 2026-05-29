import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const comerciantes = await prisma.comerciante.findMany({
      where: { activo: { not: false } },
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { productos: true },
        },
        ferias: {
          include: {
            feria: { select: { id: true, nombre: true } },
          },
        },
      },
    });
    return NextResponse.json({ comerciantes });
  } catch (error) {
    console.error("[COMERCIANTES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
