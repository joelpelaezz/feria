import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { CategoriaManager } from "./CategoriaManager";

export default async function AdminCategoriasPage() {
  const session = await requireAdmin();
  if (!session) redirect("/auth/login");

  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="headline-md text-on-surface">Categorías</h1>
        <span
          className="rounded-full px-2.5 py-0.5 label-sm text-on-surface-variant"
          style={{ backgroundColor: "var(--color-surface-container-high)" }}
        >
          {categorias.length}
        </span>
      </div>

      <CategoriaManager categorias={categorias} />
    </div>
  );
}
