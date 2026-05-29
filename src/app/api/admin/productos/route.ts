import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/admin";

// GET /api/admin/productos - Listar productos con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const categoria = searchParams.get("categoria");
    const tipo = searchParams.get("tipo");
    const estado = searchParams.get("estado");
    const busqueda = searchParams.get("busqueda");
    const trueque = searchParams.get("trueque");

    const where: Record<string, unknown> = {};

    // Si es comerciante, solo sus productos
    if (session.rol !== "admin") {
      const comerciante = await prisma.comerciante.findUnique({
        where: { usuarioId: session.userId },
        select: { id: true },
      });
      if (!comerciante) {
        return NextResponse.json({ error: "Comerciante no encontrado" }, { status: 404 });
      }
      where.comercianteId = comerciante.id;
    }

    if (categoria) where.categoriaId = categoria;
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (trueque === "true") where.aceptaTrueque = true;

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda } },
        { descripcion: { contains: busqueda } },
      ];
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: { select: { id: true, nombre: true } },
          comerciante: {
            select: { id: true, nombre: true, slug: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.producto.count({ where }),
    ]);

    return NextResponse.json({
      productos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ADMIN_PRODUCTOS_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/admin/productos - Crear producto
export async function POST(request: NextRequest) {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    if (session.rol === "cargador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();

    const {
      titulo,
      descripcion,
      precio,
      categoriaId,
      talle,
      tipo,
      stock,
      fotos,
      aceptaTrueque,
      buscaCambio,
      disponibleEnFeria,
      disponibleEnDomicilio,
      estado,
    } = body;

    // Validaciones básicas
    if (!titulo || typeof precio !== "number" || precio <= 0) {
      return NextResponse.json(
        { error: "Título y precio válido son requeridos" },
        { status: 400 }
      );
    }

    // Obtener comercianteId
    let comercianteId = body.comercianteId;

    if (session.rol === "admin" && comercianteId) {
      // Admin puede crear para cualquier comerciante
      const existe = await prisma.comerciante.findUnique({
        where: { id: comercianteId },
        select: { id: true },
      });
      if (!existe) {
        return NextResponse.json(
          { error: "Comerciante no encontrado" },
          { status: 404 }
        );
      }
    } else {
      // Comerciante crea para sí mismo
      const comerciante = await prisma.comerciante.findUnique({
        where: { usuarioId: session.userId },
        select: { id: true },
      });
      if (!comerciante) {
        return NextResponse.json(
          { error: "Comerciante no encontrado. Completá tu perfil primero." },
          { status: 400 }
        );
      }
      comercianteId = comerciante.id;
    }

    const producto = await prisma.producto.create({
      data: {
        comercianteId,
        titulo,
        descripcion: descripcion ?? null,
        precio,
        categoriaId: categoriaId ?? null,
        talle: talle ?? null,
        tipo: tipo ?? "usado",
        stock: stock ?? 1,
        fotos: fotos ?? "[]",
        aceptaTrueque: aceptaTrueque ?? false,
        buscaCambio: buscaCambio ?? null,
        disponibleEnFeria: disponibleEnFeria ?? true,
        disponibleEnDomicilio: disponibleEnDomicilio ?? false,
        estado: estado ?? "publicado",
        publicado: estado !== "borrador",
        creadoPorId: session.userId,
      },
      include: {
        categoria: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ producto }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_PRODUCTOS_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
