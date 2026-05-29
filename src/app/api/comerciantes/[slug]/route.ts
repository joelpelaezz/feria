import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const comerciante = await prisma.comerciante.findUnique({
      where: { slug },
      include: {
        usuario: { select: { nombre: true } },
        productos: {
          include: { categoria: { select: { id: true, nombre: true } } },
          orderBy: { createdAt: "desc" },
        },
        ferias: {
          include: { feria: true },
        },
      },
    });

    if (!comerciante) {
      return NextResponse.json(
        { error: "Comerciante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ comerciante });
  } catch (error) {
    console.error("[COMERCIANTE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
