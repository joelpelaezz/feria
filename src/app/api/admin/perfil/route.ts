import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// GET /api/admin/perfil - Obtener perfil del comerciante
export async function GET() {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    if (session.rol === "admin") {
      // Admin ve su usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id: session.userId },
        select: { id: true, nombre: true, telefono: true, rol: true, createdAt: true },
      });
      if (!usuario) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ perfil: { ...usuario, tipo: "usuario" } });
    }

    // Comerciante ve su perfil completo
    const comerciante = await prisma.comerciante.findUnique({
      where: { usuarioId: session.userId },
      include: {
        ferias: {
          include: { feria: { select: { id: true, nombre: true, direccion: true, dias: true } } },
        },
        usuario: { select: { telefono: true, createdAt: true } },
      },
    });

    if (!comerciante) {
      return NextResponse.json({ error: "Comerciante no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ perfil: { ...comerciante, tipo: "comerciante" } });
  } catch (error) {
    console.error("[ADMIN_PERFIL_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/perfil - Actualizar perfil
export async function PUT(request: NextRequest) {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    const body = await request.json();

    if (session.rol === "admin") {
      // Admin solo puede cambiar nombre
      const data: Record<string, unknown> = {};
      if (body.nombre) data.nombre = body.nombre;

      await prisma.usuario.update({
        where: { id: session.userId },
        data,
      });

      return NextResponse.json({ message: "Perfil actualizado" });
    }

    // Comerciante update
    const comerciante = await prisma.comerciante.findUnique({
      where: { usuarioId: session.userId },
      select: { id: true },
    });

    if (!comerciante) {
      // Si no existe perfil de comerciante, crear uno
      const usuario = await prisma.usuario.findUnique({
        where: { id: session.userId },
        select: { nombre: true, telefono: true },
      });

      await prisma.comerciante.create({
        data: {
          usuarioId: session.userId,
          nombre: body.nombre ?? usuario?.nombre ?? "Comerciante",
          whatsapp: body.whatsapp ?? usuario?.telefono ?? "",
          slug: body.slug ?? `comerciante-${session.userId.slice(-6)}`,
          descripcion: body.descripcion ?? null,
          fotoPerfil: body.fotoPerfil ?? null,
          tipoUbicacion: body.tipoUbicacion ?? "puesto_fijo",
          ubicacion: body.ubicacion ?? null,
          dias: body.dias ?? null,
          horario: body.horario ?? null,
        },
      });

      return NextResponse.json({ message: "Perfil creado" }, { status: 201 });
    }

    // Actualizar perfil existente
    const allowedFields = [
      "nombre", "descripcion", "fotoPerfil", "whatsapp",
      "tipoUbicacion", "ubicacion", "dias", "horario",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // Si cambia nombre, actualizar también en usuario
    if (body.nombre) {
      await prisma.usuario.update({
        where: { id: session.userId },
        data: { nombre: body.nombre },
      });
    }

    await prisma.comerciante.update({
      where: { id: comerciante.id },
      data,
    });

    return NextResponse.json({ message: "Perfil actualizado" });
  } catch (error) {
    console.error("[ADMIN_PERFIL_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
