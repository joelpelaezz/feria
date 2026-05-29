import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth, canManageProducto } from "@/lib/admin";

// POST /api/admin/productos/[id]/reactivar - Volver a publicar
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await apiAuth();
    if ("error" in session) return session.error;

    const puede = await canManageProducto(id, session);
    if (puede === null) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    if (!puede) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
      select: { estado: true, tipo: true, stock: true },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (producto.estado !== "vendido" && producto.estado !== "agotado") {
      return NextResponse.json(
        { error: "Solo se pueden reactivar productos vendidos o agotados" },
        { status: 400 }
      );
    }

    // Reactivar: estado a publicado, stock a 1 (usado) o al que tenía, publicado true
    const stockBase = producto.tipo === "nuevo" ? Math.max(producto.stock, 1) : 1;

    await prisma.producto.update({
      where: { id },
      data: {
        estado: "publicado",
        stock: stockBase,
        publicado: true,
      },
    });

    return NextResponse.json({ message: "Producto reactivado" });
  } catch (error) {
    console.error("[REACTIVAR_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
