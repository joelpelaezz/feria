import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPrimaryProductPhoto } from "@/lib/product-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FerIA — Catálogo Social de Ferias de Palpalá",
  description:
    "Encontrá productos locales en las ferias de Palpalá, Jujuy. Conectate con comerciantes y descubrí lo mejor de tu comunidad.",
  openGraph: {
    title: "FerIA — Catálogo Social de Ferias de Palpalá",
    description:
      "Encontrá productos locales en las ferias de Palpalá, Jujuy. Conectate con comerciantes y descubrí lo mejor de tu comunidad.",
  },
};

export default async function Home() {
  const [categorias, ferias, productosRecientes] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.feria.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { comerciantes: true } } },
    }),
    prisma.producto.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        categoria: { select: { nombre: true } },
        comerciante: { select: { nombre: true, slug: true } },
      },
    }),
  ]);

  return (
    <div className="animate-fade-in space-y-12">
      {/* Hero — display-lg */}
      <section className="py-8 text-center md:py-16">
        <h1 className="display-lg text-primary">
          Fer<span className="text-secondary">IA</span>
        </h1>
        <p className="mt-4 body-lg text-on-surface-variant">
          Catálogo Social de las Ferias de Palpalá
        </p>
        <p className="mx-auto mt-2 max-w-md body-md text-on-surface-variant">
          Descubrí productos locales, conectate directo con los comerciantes
          y encontrá lo que buscás sin dar vueltas por toda la feria.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/productos" className="btn-primary">
            Explorar productos
          </Link>
          <Link href="/ferias" className="btn-secondary">
            Ver ferias
          </Link>
        </div>
      </section>

      {/* Categorías — pills horizontal scroll */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="headline-md text-on-surface">Categorías</h2>
          <Link
            href="/productos"
            className="label-sm text-primary no-underline hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?categoriaId=${cat.id}`}
              className="filter-pill"
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* Ferias */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="headline-md text-on-surface">Ferias</h2>
          <Link
            href="/ferias"
            className="label-sm text-primary no-underline hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ferias.map((feria) => (
            <Link
              key={feria.id}
              href={`/productos?feriaId=${feria.id}`}
              className="card-pressable block p-4 no-underline"
            >
              <h3 className="font-semibold text-on-surface">{feria.nombre}</h3>
              <p className="mt-1 body-md text-on-surface-variant">
                {feria.dias} · {feria.horario}
              </p>
              {feria.direccion && (
                <p className="mt-0.5 label-sm text-on-surface-variant">
                  {feria.direccion}
                </p>
              )}
              <p className="mt-2 label-sm text-secondary">
                {feria._count.comerciantes} comerciante
                {feria._count.comerciantes !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos recientes — product cards */}
      {productosRecientes.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="headline-md text-on-surface">
              Productos recientes
            </h2>
            <Link
              href="/productos"
              className="label-sm text-primary no-underline hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productosRecientes.map((p) => {
              const photoUrl = getPrimaryProductPhoto(p.fotos);

              return (
                <Link
                  key={p.id}
                  href={`/productos/${p.id}`}
                  className="product-card group"
                >
                  <div className="relative aspect-square bg-surface-container-highest">
                    {photoUrl ? (
                      <img src={photoUrl} alt={p.titulo} className="h-full w-full object-cover" />
                    ) : null}
                    {p.aceptaTrueque && (
                      <span className="badge-trueque absolute left-2 top-2 z-10">
                        ⟳ Trueque
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="label-sm text-on-surface-variant">
                      {p.categoria?.nombre}
                    </p>
                    <h3 className="mt-1 font-medium text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {p.titulo}
                    </h3>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <span className="verified-leaf">
                        <span aria-hidden="true">🍃</span>
                        {p.comerciante.nombre}
                      </span>
                      <span className="price-chip">
                        $ {p.precio.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA — comerciantes */}
      <section
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: "rgba(63,102,83,0.1)", backgroundColor: "var(--color-surface-container-low)" }}
      >
        <h2 className="headline-md text-on-surface">
          ¿Sos comerciante?
        </h2>
        <p className="mt-2 body-md text-on-surface-variant">
          Unite a FerIA y mostrá tus productos gratis. Llega a más clientes
          sin moverte de la feria.
        </p>
        <Link
          href="/auth/registro"
          className="btn-primary mt-4"
        >
          Registrá tu negocio
        </Link>
      </section>
    </div>
  );
}
