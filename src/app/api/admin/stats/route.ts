import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

export async function GET() {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    if (session.rol === "admin") {
      // Stats globales para admin
      const [
        totalProductos,
        productosPublicados,
        productosVendidos,
        totalComerciantes,
        totalFerias,
        totalConsultas,
        productosConTrueque,
      ] = await Promise.all([
        prisma.producto.count(),
        prisma.producto.count({ where: { estado: "publicado" } }),
        prisma.producto.count({ where: { estado: "vendido" } }),
        prisma.comerciante.count({ where: { activo: true } }),
        prisma.feria.count({ where: { activa: true } }),
        prisma.consulta.count(),
        prisma.producto.count({ where: { aceptaTrueque: true } }),
      ]);

      return NextResponse.json({
        totalProductos,
        productosPublicados,
        productosVendidos,
        totalComerciantes,
        totalFerias,
        totalConsultas,
        productosConTrueque,
      });
    }

    // Stats por comerciante
    const comerciante = await prisma.comerciante.findUnique({
      where: { usuarioId: session.userId },
      select: { id: true },
    });

    if (!comerciante) {
      return NextResponse.json(
        { error: "Comerciante no encontrado" },
        { status: 404 }
      );
    }

    const [
      totalProductos,
      productosPublicados,
      productosVendidos,
      totalConsultas,
      productosConTrueque,
    ] = await Promise.all([
      prisma.producto.count({ where: { comercianteId: comerciante.id } }),
      prisma.producto.count({
        where: { comercianteId: comerciante.id, estado: "publicado" },
      }),
      prisma.producto.count({
        where: { comercianteId: comerciante.id, estado: "vendido" },
      }),
      prisma.consulta.count({
        where: { producto: { comercianteId: comerciante.id } },
      }),
      prisma.producto.count({
        where: { comercianteId: comerciante.id, aceptaTrueque: true },
      }),
    ]);

    return NextResponse.json({
      totalProductos,
      productosPublicados,
      productosVendidos,
      totalConsultas,
      productosConTrueque,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
