import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth, canManageProducto } from "@/lib/admin";

// GET /api/admin/productos/[id] - Obtener detalle
export async function GET(
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
      include: {
        categoria: { select: { id: true, nombre: true } },
        comerciante: {
          select: { id: true, nombre: true, slug: true, whatsapp: true },
        },
      },
    });

    return NextResponse.json({ producto });
  } catch (error) {
    console.error("[ADMIN_PRODUCTO_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/productos/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
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

    const body = await request.json();

    // Validar precio si viene
    if (body.precio !== undefined && (typeof body.precio !== "number" || body.precio <= 0)) {
      return NextResponse.json(
        { error: "Precio debe ser un número positivo" },
        { status: 400 }
      );
    }

    // Construir update data (solo campos permitidos)
    const allowedFields = [
      "titulo", "descripcion", "precio", "categoriaId", "talle",
      "tipo", "stock", "fotos", "aceptaTrueque", "buscaCambio",
      "disponibleEnFeria", "disponibleEnDomicilio", "estado", "publicado",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // Si cambia estado a vendido, asegurar stock lógico
    if (data.estado === "vendido" || data.estado === "agotado") {
      data.stock = 0;
      data.publicado = false;
    }

    const producto = await prisma.producto.update({
      where: { id },
      data,
      include: {
        categoria: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ producto });
  } catch (error) {
    console.error("[ADMIN_PRODUCTO_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/productos/[id] - Eliminar producto
export async function DELETE(
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

    await prisma.producto.delete({ where: { id } });

    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("[ADMIN_PRODUCTO_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
