import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// PUT /api/admin/categorias/[id] - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await apiAuth();
    if ("error" in session) return session.error;
    if (session.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, activa } = body;

    const data: Record<string, unknown> = {};
    if (nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }
      data.nombre = nombre.trim();
    }
    if (activa !== undefined) {
      data.activa = Boolean(activa);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data,
    });

    return NextResponse.json({ categoria });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe otra categoría con ese nombre" },
        { status: 409 }
      );
    }
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }
    console.error("[ADMIN_CATEGORIA_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categorias/[id] - Eliminar categoría
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await apiAuth();
    if ("error" in session) return session.error;
    if (session.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar que no tenga productos asociados
    const count = await prisma.producto.count({ where: { categoriaId: id } });
    if (count > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar: ${count} producto(s) usan esta categoría. Desactivá la categoría en lugar de eliminarla.`,
        },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({ where: { id } });

    return NextResponse.json({ message: "Categoría eliminada" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }
    console.error("[ADMIN_CATEGORIA_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
