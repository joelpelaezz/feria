import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productoId, nombreContacto, telefonoContacto, origen } = body;

    if (!productoId) {
      return NextResponse.json(
        { error: "Falta el ID del producto" },
        { status: 400 }
      );
    }

    // Obtener producto con comerciante
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
      include: {
        comerciante: {
          select: { whatsapp: true, nombre: true },
        },
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Registrar consulta
    await prisma.consulta.create({
      data: {
        productoId,
        nombreContacto: nombreContacto || null,
        telefonoContacto: telefonoContacto || null,
        origen: origen || "whatsapp",
      },
    });

    // Si stock = 0, incrementar demanda perdida
    if (producto.stock <= 0) {
      await prisma.producto.update({
        where: { id: productoId },
        data: { demandaPerdida: { increment: 1 } },
      });
    }

    // Generar URL de WhatsApp
    const mensaje = encodeURIComponent(
      `Hola ${producto.comerciante.nombre}, vi tu producto "${producto.titulo}" en FerIA y me interesa.`
    );
    const waUrl = `https://wa.me/${producto.comerciante.whatsapp}?text=${mensaje}`;

    return NextResponse.json({ waUrl });
  } catch (error) {
    console.error("[CONSULTAS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
