import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { select: { id: true, nombre: true } },
        comerciante: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            descripcion: true,
            whatsapp: true,
            ubicacion: true,
            dias: true,
            horario: true,
            tipoUbicacion: true,
          },
        },
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ producto });
  } catch (error) {
    console.error("[PRODUCTO_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
