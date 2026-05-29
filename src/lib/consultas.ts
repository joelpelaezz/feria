import { prisma } from "@/lib/prisma";

export async function getTopConsultedProducts(options?: {
  comercianteId?: string;
  take?: number;
}) {
  const take = options?.take ?? 5;

  const grouped = await prisma.consulta.groupBy({
    by: ["productoId"],
    where: options?.comercianteId
      ? { producto: { comercianteId: options.comercianteId } }
      : undefined,
    _count: { productoId: true },
    orderBy: { _count: { productoId: "desc" } },
    take,
  });

  if (grouped.length === 0) return [];

  const productIds = grouped.map((item) => item.productoId);
  const products = await prisma.producto.findMany({
    where: { id: { in: productIds } },
    include: {
      comerciante: { select: { nombre: true, slug: true } },
      categoria: { select: { nombre: true } },
    },
  });

  const byId = new Map(products.map((product) => [product.id, product]));

  return grouped
    .map((item) => {
      const product = byId.get(item.productoId);
      if (!product) return null;

      return {
        id: product.id,
        titulo: product.titulo,
        slug: product.comerciante.slug,
        comercianteNombre: product.comerciante.nombre,
        categoriaNombre: product.categoria?.nombre ?? null,
        precio: product.precio,
        consultas: item._count.productoId,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
