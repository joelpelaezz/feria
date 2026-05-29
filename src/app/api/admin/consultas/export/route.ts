import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// GET /api/admin/consultas/export — Exportar consultas como CSV
export async function GET() {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    let where: Record<string, unknown> | undefined = undefined;

    if (session.rol !== "admin") {
      const comerciante = await prisma.comerciante.findUnique({
        where: { usuarioId: session.userId },
        select: { id: true },
      });
      if (comerciante) {
        where = { producto: { comercianteId: comerciante.id } };
      }
    }

    const consultas = await prisma.consulta.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 2000,
      include: {
        producto: {
          select: {
            titulo: true,
            precio: true,
            comerciante: { select: { nombre: true, whatsapp: true } },
          },
        },
      },
    });

    // Cabeceras CSV
    const headers = [
      "ID",
      "Producto",
      "Comerciante",
      "WhatsApp Comerciante",
      "Precio",
      "Nombre Contacto",
      "Teléfono Contacto",
      "Origen",
      "Fecha",
    ];

    function esc(value: string | number | null | undefined): string {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Escapar comillas dobles y envolver en comillas si contiene separadores
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = consultas.map((c) =>
      [
        c.id,
        c.producto.titulo,
        c.producto.comerciante.nombre,
        c.producto.comerciante.whatsapp,
        c.producto.precio,
        c.nombreContacto,
        c.telefonoContacto,
        c.origen,
        c.createdAt.toISOString(),
      ]
        .map(esc)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="consultas-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[CONSULTAS_EXPORT_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
