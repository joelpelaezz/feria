import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// PUT /api/admin/ferias/[id] - Actualizar feria
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
    const { nombre, direccion, lat, lng, dias, horario, activa } = body;

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
    if (direccion !== undefined) data.direccion = direccion?.trim() || null;
    if (lat !== undefined) data.lat = typeof lat === "number" ? lat : null;
    if (lng !== undefined) data.lng = typeof lng === "number" ? lng : null;
    if (dias !== undefined) {
      if (typeof dias !== "string" || dias.trim().length === 0) {
        return NextResponse.json(
          { error: "Los días no pueden estar vacíos" },
          { status: 400 }
        );
      }
      data.dias = dias.trim();
    }
    if (horario !== undefined) data.horario = horario?.trim() || null;
    if (activa !== undefined) data.activa = Boolean(activa);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    const feria = await prisma.feria.update({
      where: { id },
      data,
    });

    return NextResponse.json({ feria });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Feria no encontrada" },
        { status: 404 }
      );
    }
    console.error("[ADMIN_FERIA_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ferias/[id] - Eliminar feria
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

    // Verificar que no tenga comerciantes asociados
    const count = await prisma.comercianteFeria.count({
      where: { feriaId: id },
    });
    if (count > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar: ${count} comerciante(s) están asociados a esta feria. Desactivá la feria en lugar de eliminarla.`,
        },
        { status: 400 }
      );
    }

    await prisma.feria.delete({ where: { id } });

    return NextResponse.json({ message: "Feria eliminada" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Feria no encontrada" },
        { status: 404 }
      );
    }
    console.error("[ADMIN_FERIA_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
