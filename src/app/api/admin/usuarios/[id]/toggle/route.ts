import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// POST /api/admin/usuarios/[id]/toggle — Activar/desactivar usuario
export async function POST(
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

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, activo: true, rol: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (usuario.rol === "admin") {
      return NextResponse.json(
        { error: "No podés desactivar a otro admin" },
        { status: 400 }
      );
    }

    const nuevoEstado = !usuario.activo;

    await prisma.usuario.update({
      where: { id },
      data: { activo: nuevoEstado },
    });

    // Si tiene comerciante, sincronizar estado
    if (usuario.rol === "comerciante") {
      await prisma.comerciante.updateMany({
        where: { usuarioId: id },
        data: { activo: nuevoEstado },
      });
    }

    return NextResponse.json({
      message: nuevoEstado ? "Usuario activado" : "Usuario desactivado",
      activo: nuevoEstado,
    });
  } catch (error) {
    console.error("[USUARIO_TOGGLE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
