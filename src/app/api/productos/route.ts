import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get("categoriaId");
    const feriaId = searchParams.get("feriaId");
    const comercianteId = searchParams.get("comercianteId");
    const busqueda = searchParams.get("busqueda");
    const trueque = searchParams.get("trueque");
    const tipo = searchParams.get("tipo");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    const where: Record<string, unknown> = {};

    if (categoriaId) where.categoriaId = categoriaId;
    if (comercianteId) where.comercianteId = comercianteId;
    if (tipo) where.tipo = tipo;
    if (trueque === "true") where.aceptaTrueque = true;

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda } },
        { descripcion: { contains: busqueda } },
      ];
    }

    // Si se filtra por feria, buscar comerciantes de esa feria
    if (feriaId) {
      const comerciantesDeFeria = await prisma.comercianteFeria.findMany({
        where: { feriaId },
        select: { comercianteId: true },
      });
      where.comercianteId = {
        in: comerciantesDeFeria.map((cf) => cf.comercianteId),
      };
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where: where as any,
        include: {
          categoria: { select: { id: true, nombre: true } },
          comerciante: {
            select: { id: true, nombre: true, slug: true, whatsapp: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.producto.count({ where: where as any }),
    ]);

    return NextResponse.json({
      productos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[PRODUCTOS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
