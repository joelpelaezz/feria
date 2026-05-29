import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// GET /api/admin/ferias - Listar ferias
export async function GET() {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    const ferias = await prisma.feria.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { comerciantes: true } },
      },
    });

    return NextResponse.json({ ferias });
  } catch (error) {
    console.error("[ADMIN_FERIAS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/admin/ferias - Crear feria
export async function POST(request: NextRequest) {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;
    if (session.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, direccion, lat, lng, dias, horario } = body;

    if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }
    if (!dias || typeof dias !== "string" || dias.trim().length === 0) {
      return NextResponse.json(
        { error: "Los días son requeridos" },
        { status: 400 }
      );
    }

    const feria = await prisma.feria.create({
      data: {
        nombre: nombre.trim(),
        direccion: direccion?.trim() || null,
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        dias: dias.trim(),
        horario: horario?.trim() || null,
      },
    });

    return NextResponse.json({ feria }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_FERIAS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
