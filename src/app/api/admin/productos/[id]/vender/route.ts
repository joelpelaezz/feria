import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth, canManageProducto } from "@/lib/admin";

// POST /api/admin/productos/[id]/vender - Registrar venta de 1 unidad
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
      select: { estado: true, stock: true, precio: true, tipo: true },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (producto.estado === "vendido" || producto.estado === "agotado") {
      return NextResponse.json(
        { error: "El producto ya está vendido o agotado" },
        { status: 400 }
      );
    }

    if (producto.stock <= 0) {
      return NextResponse.json(
        { error: "El producto no tiene stock disponible" },
        { status: 400 }
      );
    }

    const nuevoStock = producto.stock - 1;
    const agotado = nuevoStock <= 0;

    await prisma.producto.update({
      where: { id },
      data: {
        stock: nuevoStock,
        estado: agotado ? "vendido" : "publicado",
        publicado: !agotado,
      },
    });

    // Registrar la venta
    await prisma.venta.create({
      data: {
        productoId: id,
        cantidad: 1,
        monto: producto.precio,
      },
    });

    return NextResponse.json({
      message: agotado
        ? "Producto marcado como vendido"
        : `Stock actualizado: ${nuevoStock} unidad(es) restante(s)`,
      stock: nuevoStock,
      vendido: agotado,
    });
  } catch (error) {
    console.error("[VENDER_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
