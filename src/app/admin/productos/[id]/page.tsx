import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canManageProducto } from "@/lib/admin";
import { ProductoForm } from "../ProductoForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  // Verificar ownership
  const puede = await canManageProducto(id, {
    userId: session.userId,
    rol: session.rol,
  });
  if (puede === null) notFound();
  if (!puede) redirect("/admin/productos");

  const [producto, categorias] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      select: {
        titulo: true,
        descripcion: true,
        precio: true,
        categoriaId: true,
        talle: true,
        tipo: true,
        stock: true,
        fotos: true,
        aceptaTrueque: true,
        buscaCambio: true,
        disponibleEnFeria: true,
        disponibleEnDomicilio: true,
        estado: true,
      },
    }),
    prisma.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  if (!producto) notFound();

  // Convertir nulls a undefined para el form
  const initialData = {
    ...producto,
    descripcion: producto.descripcion ?? undefined,
    categoriaId: producto.categoriaId ?? undefined,
    talle: producto.talle ?? undefined,
    buscaCambio: producto.buscaCambio ?? undefined,
  };

  return (
    <div className="animate-fade-in">
      <h1 className="headline-md mb-6 text-on-surface">Editar Producto</h1>
      <ProductoForm
        categorias={categorias}
        initialData={initialData}
        productoId={id}
      />
    </div>
  );
}
