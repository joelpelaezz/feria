import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";
import { getMerchantProfileUrl } from "@/lib/site";
import { getQrImageUrl } from "@/lib/qr";

// GET /api/admin/qr - Obtener datos para QR del comerciante
export async function GET() {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    if (session.rol === "admin") {
      return NextResponse.json({ error: "Solo para comerciantes" }, { status: 403 });
    }

    const comerciante = await prisma.comerciante.findUnique({
      where: { usuarioId: session.userId },
      select: { id: true, nombre: true, slug: true, whatsapp: true },
    });

    if (!comerciante) {
      return NextResponse.json(
        { error: "Completá tu perfil primero" },
        { status: 400 }
      );
    }

    const perfilUrl = getMerchantProfileUrl(comerciante.slug);

    return NextResponse.json({
      comerciante: {
        nombre: comerciante.nombre,
        slug: comerciante.slug,
        whatsapp: comerciante.whatsapp,
      },
      qrUrl: perfilUrl,
      qrImageUrl: getQrImageUrl(perfilUrl),
      whatsappUrl: `https://wa.me/${comerciante.whatsapp}`,
    });
  } catch (error) {
    console.error("[ADMIN_QR_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
