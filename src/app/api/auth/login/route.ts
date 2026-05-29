import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono, pin } = body;

    if (!telefono || !pin) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: telefono, pin" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { telefono },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Teléfono no registrado" },
        { status: 401 }
      );
    }

    // Verificar PIN
    const valido = await verifyPin(pin, usuario.pinHash);
    if (!valido) {
      return NextResponse.json(
        { error: "PIN incorrecto" },
        { status: 401 }
      );
    }

    // Crear sesión
    const token = await createSession(usuario.id, usuario.rol);

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id,
        telefono: usuario.telefono,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
