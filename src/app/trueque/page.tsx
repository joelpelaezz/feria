import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPrimaryProductPhoto } from "@/lib/product-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trueque",
  description:
    "Productos que aceptan trueque en las ferias de Palpalá. Cambiá sin plata: ropa, accesorios y más.",
  openGraph: {
    title: "Trueque | FerIA",
    description: "Productos que aceptan trueque en las ferias de Palpalá.",
  },
};

export default async function TruequePage() {
  const productosTrueque = await prisma.producto.findMany({
    where: { aceptaTrueque: true },
    include: {
      categoria: { select: { id: true, nombre: true } },
      comerciante: {
        select: { id: true, nombre: true, slug: true, whatsapp: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="headline-lg text-on-surface">Trueque</h1>
        <p className="mt-2 body-md text-on-surface-variant">
          Intercambiá productos sin usar dinero. Algunos comerciantes aceptan
          trueque por otros artículos.
        </p>
      </div>

      {productosTrueque.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="text-4xl">🔄</span>
          <p className="mt-3 body-md text-on-surface-variant">
            Todavía no hay productos disponibles para trueque.
          </p>
          <Link
            href="/productos"
            className="mt-2 label-sm text-primary no-underline hover:underline inline-block"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productosTrueque.map((p) => {
            const photoUrl = getPrimaryProductPhoto(p.fotos);

            return (
              <Link
                key={p.id}
                href={`/productos/${p.id}`}
                className="product-card group"
              >
                <div className="relative aspect-square bg-surface-container-highest flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={p.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl text-on-surface-variant/30">🔄</span>
                  )}
                  <span className="badge-trueque absolute left-2 top-2 z-10">
                    ⟳ Trueque
                  </span>
                </div>
                <div className="p-3">
                  <p className="label-sm text-on-surface-variant">
                    {p.categoria?.nombre}
                  </p>
                  <h3 className="mt-1 font-medium text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {p.titulo}
                  </h3>
                  {p.buscaCambio && (
                    <div className="mt-2 rounded-lg p-2 border" style={{ borderColor: "rgba(224,192,96,0.2)", backgroundColor: "rgba(224,192,96,0.05)" }}>
                      <p className="label-sm font-medium text-trueque">Busca:</p>
                      <p className="label-sm text-on-surface-variant line-clamp-2">
                        {p.buscaCambio}
                      </p>
                    </div>
                  )}
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
      )}
    </div>
  );
}
