import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

const DEFAULT_PIN = "123456";

// POST /api/admin/usuarios/[id]/reset-pin — Resetear PIN a 123456
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
      select: { id: true, rol: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (usuario.rol === "admin") {
      return NextResponse.json(
        { error: "No podés resetear el PIN de otro admin" },
        { status: 400 }
      );
    }

    const pinHash = await bcrypt.hash(DEFAULT_PIN, 10);

    await prisma.usuario.update({
      where: { id },
      data: { pinHash },
    });

    return NextResponse.json({
      message: `PIN reseteado a ${DEFAULT_PIN}`,
      nuevoPin: DEFAULT_PIN,
    });
  } catch (error) {
    console.error("[USUARIO_RESET_PIN_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
