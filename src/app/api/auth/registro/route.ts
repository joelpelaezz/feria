import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono, pin, nombre } = body;

    // Validaciones
    if (!telefono || !pin || !nombre) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: telefono, pin, nombre" },
        { status: 400 }
      );
    }

    if (!/^\d{7,15}$/.test(telefono)) {
      return NextResponse.json(
        { error: "Teléfono inválido. Debe tener entre 7 y 15 dígitos." },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN inválido. Debe tener entre 4 y 6 dígitos." },
        { status: 400 }
      );
    }

    if (nombre.length < 2 || nombre.length > 100) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 2 y 100 caracteres." },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existe = await prisma.usuario.findUnique({
      where: { telefono },
    });

    if (existe) {
      return NextResponse.json(
        { error: "Este teléfono ya está registrado. ¿Querés iniciar sesión?" },
        { status: 409 }
      );
    }

    // Crear usuario
    const pinHash = await hashPin(pin);
    const usuario = await prisma.usuario.create({
      data: {
        telefono,
        pinHash,
        nombre,
        rol: "comerciante",
      },
    });

    // Crear sesión
    const token = await createSession(usuario.id, usuario.rol);

    return NextResponse.json(
      {
        message: "Registro exitoso",
        usuario: {
          id: usuario.id,
          telefono: usuario.telefono,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTRO_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
