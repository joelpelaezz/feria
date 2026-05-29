import Link from "next/link";
import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "./DeleteButton";
import { MarkAsSoldButton } from "@/components/admin/MarkAsSoldButton";
import { ReactivarButton } from "@/components/admin/ReactivarButton";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; estado?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 20;
  const estadoFilter = params.estado;

  const where: Record<string, unknown> = {};

  // Si no es admin, solo sus productos
  if (session.rol !== "admin" && session.comercianteId) {
    where.comercianteId = session.comercianteId;
  }

  if (estadoFilter && ["publicado", "vendido", "agotado", "borrador"].includes(estadoFilter)) {
    where.estado = estadoFilter;
  }

  const [productos, total, categorias] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        categoria: { select: { id: true, nombre: true } },
        comerciante: { select: { id: true, nombre: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.producto.count({ where }),
    prisma.categoria.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-fade-in">
      {/* Header + filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="headline-md text-on-surface">Productos</h1>
          <span className="rounded-full px-2.5 py-0.5 label-sm text-on-surface-variant" style={{ backgroundColor: "var(--color-surface-container-high)" }}>
            {total}
          </span>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="btn-primary"
        >
          + Nuevo
        </Link>
      </div>

      {/* Filtros rápidos */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "publicado", "vendido", "agotado", "borrador"].map((estado) => {
          const label =
            estado === ""
              ? "Todos"
              : estado.charAt(0).toUpperCase() + estado.slice(1);
          const href =
            estado === ""
              ? "/admin/productos"
              : `/admin/productos?estado=${estado}`;
          const active =
            (estado === "" && !estadoFilter) || estado === estadoFilter;
          return (
            <Link
              key={estado}
              href={href}
              className={`filter-pill ${active ? "filter-pill-active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {productos.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "rgba(63,102,83,0.2)", backgroundColor: "var(--color-surface-container-low)" }}
        >
          <p className="headline-md text-on-surface-variant">No hay productos todavía</p>
          <Link
            href="/admin/productos/nuevo"
            className="mt-3 label-sm text-primary no-underline hover:underline inline-block"
          >
            Crear el primer producto →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="card flex items-center justify-between p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-on-surface">
                    {producto.titulo}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 label-sm font-medium ${
                      producto.estado === "publicado"
                        ? "bg-secondary/20 text-secondary"
                        : producto.estado === "vendido"
                          ? "bg-primary/20 text-primary"
                          : "text-on-surface-variant"
                    }`}
                    style={producto.estado !== "publicado" && producto.estado !== "vendido" ? { backgroundColor: "var(--color-surface-container-high)" } : {}}
                  >
                    {producto.estado}
                  </span>
                </div>
                <p className="mt-0.5 label-sm text-on-surface-variant">
                  ${producto.precio.toLocaleString("es-AR")}
                  {producto.categoria && ` · ${producto.categoria.nombre}`}
                  {session.rol === "admin" && ` · ${producto.comerciante.nombre}`}
                  {producto.talle && ` · Talle ${producto.talle}`}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Link
                  href={`/admin/productos/${producto.id}`}
                  className="btn-secondary"
                >
                  Editar
                </Link>
                {producto.estado !== "vendido" ? (
                  <MarkAsSoldButton productId={producto.id} stock={producto.stock} />
                ) : (
                  <ReactivarButton productId={producto.id} />
                )}
                <DeleteButton productId={producto.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const href =
              estadoFilter
                ? `/admin/productos?page=${p}&estado=${estadoFilter}`
                : `/admin/productos?page=${p}`;
            return (
              <Link
                key={p}
                href={href}
                className={`filter-pill ${
                  p === page
                    ? "filter-pill-active"
                    : ""
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
