import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductoForm } from "../ProductoForm";

export default async function NuevoProductoPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  const categorias = await prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="headline-md mb-6 text-on-surface">Nuevo Producto</h1>
      <ProductoForm categorias={categorias} />
    </div>
  );
}
