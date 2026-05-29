import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// GET /api/admin/categorias - Listar categorías
export async function GET() {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { productos: true } } },
    });

    return NextResponse.json({ categorias });
  } catch (error) {
    console.error("[ADMIN_CATEGORIAS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categorias - Crear categoría
export async function POST(request: NextRequest) {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;
    if (session.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: { nombre: nombre.trim() },
    });

    return NextResponse.json({ categoria }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }
    console.error("[ADMIN_CATEGORIAS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
