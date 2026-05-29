import Link from "next/link";
import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTopConsultedProducts } from "@/lib/consultas";
import { MarkAsSoldButton } from "@/components/admin/MarkAsSoldButton";

export default async function AdminConsultasPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  const where =
    session.rol === "admin"
      ? undefined
      : { producto: { comercianteId: session.comercianteId } };

  const [consultas, topProducts] = await Promise.all([
    prisma.consulta.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        producto: {
          select: {
            id: true,
            titulo: true,
            precio: true,
            estado: true,
            stock: true,
            comerciante: { select: { nombre: true, slug: true } },
          },
        },
      },
    }),
    getTopConsultedProducts({
      comercianteId: session.rol === "admin" ? undefined : session.comercianteId,
      take: 8,
    }),
  ]);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="headline-lg text-on-surface">Consultas</h1>
        <p className="mt-1 body-md text-on-surface-variant">
          {session.rol === "admin"
            ? "Seguimiento general de consultas y productos con más interés."
            : "Revisá qué productos te están consultando más y cuándo llegaron los contactos."}
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="headline-md text-on-surface">Ranking de interés</h2>
          <span className="label-sm text-on-surface-variant">
            Top {topProducts.length || 0}
          </span>
        </div>

        {topProducts.length === 0 ? (
          <div className="card p-6">
            <p className="body-md text-on-surface-variant">
              Todavía no hay consultas registradas para armar un ranking.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="card-pressable p-4 no-underline"
              >
                <p className="label-sm text-secondary">#{index + 1}</p>
                <h3 className="mt-1 font-semibold text-on-surface line-clamp-2">
                  {product.titulo}
                </h3>
                <p className="mt-1 label-sm text-on-surface-variant">
                  {product.comercianteNombre}
                </p>
                {product.categoriaNombre && (
                  <p className="label-sm text-on-surface-variant">
                    {product.categoriaNombre}
                  </p>
                )}
                <div className="mt-3 flex items-end justify-between gap-2">
                  <span className="price-chip">
                    $ {product.precio.toLocaleString("es-AR")}
                  </span>
                  <span className="badge-trueque">
                    {product.consultas} consultas
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="headline-md text-on-surface">Últimas consultas</h2>
          <div className="flex items-center gap-2">
            <span className="label-sm text-on-surface-variant">
              {consultas.length} registros
            </span>
            <a
              href="/api/admin/consultas/export"
              download
              className="btn-outline label-sm no-underline"
            >
              Exportar CSV
            </a>
          </div>
        </div>

        {consultas.length === 0 ? (
          <div className="card p-6">
            <p className="body-md text-on-surface-variant">
              No hay consultas todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultas.map((consulta) => (
              <div key={consulta.id} className="card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      href={`/productos/${consulta.producto.id}`}
                      className="font-semibold text-on-surface no-underline hover:text-primary"
                    >
                      {consulta.producto.titulo}
                    </Link>
                    <p className="mt-1 body-md text-on-surface-variant">
                      {consulta.producto.comerciante.nombre}
                    </p>
                    <p className="label-sm text-on-surface-variant">
                      Origen: {consulta.origen}
                    </p>
                    {(consulta.nombreContacto || consulta.telefonoContacto) && (
                      <p className="label-sm text-on-surface-variant">
                        Contacto: {consulta.nombreContacto ?? "Sin nombre"}
                        {consulta.telefonoContacto ? ` · ${consulta.telefonoContacto}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <p className="price-chip inline-flex">
                      $ {consulta.producto.precio.toLocaleString("es-AR")}
                    </p>
                    <p className="mt-2 label-sm text-on-surface-variant">
                      {new Date(consulta.createdAt).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {consulta.producto.estado !== "vendido" && (
                      <div className="mt-2">
                        <MarkAsSoldButton
                          productId={consulta.producto.id}
                          stock={consulta.producto.stock}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
