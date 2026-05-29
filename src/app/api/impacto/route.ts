import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [comerciantesActivos, productosPublicados, feriasRegistradas, consultasWhatsApp] =
      await Promise.all([
        prisma.comerciante.count(),
        prisma.producto.count(),
        prisma.feria.count(),
        prisma.consulta.count(),
      ]);

    return NextResponse.json({
      comerciantesActivos,
      productosPublicados,
      feriasRegistradas,
      consultasWhatsApp,
    });
  } catch (error) {
    console.error("[IMPACTO_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
