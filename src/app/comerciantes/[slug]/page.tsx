import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPrimaryProductPhoto } from "@/lib/product-images";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comerciante = await prisma.comerciante.findUnique({
    where: { slug },
    select: { nombre: true, descripcion: true },
  });

  if (!comerciante) return { title: "Comerciante no encontrado" };

  return {
    title: comerciante.nombre,
    description:
      comerciante.descripcion ||
      `Mirá los productos de ${comerciante.nombre} en FerIA. Contacto directo por WhatsApp.`,
    openGraph: {
      title: `${comerciante.nombre} | FerIA`,
      description:
        comerciante.descripcion ||
        `Productos de ${comerciante.nombre} en las ferias de Palpalá.`,
    },
  };
}

export default async function ComerciantePage({ params }: PageProps) {
  const { slug } = await params;

  const comerciante = await prisma.comerciante.findUnique({
    where: { slug },
    include: {
      usuario: { select: { nombre: true } },
      productos: {
        include: { categoria: { select: { id: true, nombre: true } } },
        orderBy: { createdAt: "desc" },
      },
      ferias: { include: { feria: true } },
    },
  });

  if (!comerciante) notFound();

  const waMessage = encodeURIComponent(
    `Hola ${comerciante.nombre}, vi tu perfil en FerIA y quiero consultarte.`
  );
  const waUrl = `https://wa.me/${comerciante.whatsapp}?text=${waMessage}`;

  return (
    <div className="animate-fade-in">
      {/* Perfil header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="merchant-avatar">
            {comerciante.nombre.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="headline-lg text-on-surface">
              {comerciante.nombre}
              <span className="ml-2 verified-leaf"><span aria-hidden="true">🍃</span>Verificado</span>
            </h1>
            {comerciante.descripcion && (
              <p className="mt-2 body-md leading-relaxed text-on-surface-variant">
                {comerciante.descripcion.replace(/['"]+/g, "")}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 body-md text-on-surface-variant">
              {comerciante.ubicacion && (
                <span>📍 {comerciante.ubicacion}</span>
              )}
              {comerciante.dias && (
                <span>🕐 {comerciante.dias} · {comerciante.horario}</span>
              )}
            </div>
          </div>
        </div>

          <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>
          <Link
            href={`/comerciantes/${slug}/qr`}
            className="btn-outline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="5" />
              <rect x="16" y="3" width="5" height="5" />
              <rect x="3" y="16" width="5" height="5" />
              <path d="M21 16h-5v5" />
              <path d="M16 21v-2" />
              <path d="M21 19v1a1 1 0 01-1 1h-1" />
            </svg>
            QR Compartir
          </Link>
        </div>
      </div>

      {/* Ferias donde asiste */}
      {comerciante.ferias.length > 0 && (
        <div className="mt-6">
          <h2 className="headline-sm text-on-surface">Ferias donde asiste</h2>
          <div className="mt-2 space-y-2">
            {comerciante.ferias.map((cf) => (
              <div
                key={`${cf.comercianteId}-${cf.feriaId}`}
                className="card-sm p-3"
              >
                <p className="font-medium text-on-surface">{cf.feria.nombre}</p>
                <p className="body-md text-on-surface-variant">
                  {cf.feria.dias} · {cf.feria.horario}
                  {cf.puesto && ` · Puesto: ${cf.puesto}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="mt-6">
          <h2 className="headline-sm text-on-surface">
            Productos ({comerciante.productos.length})
          </h2>
        {comerciante.productos.length === 0 ? (
          <p className="mt-4 body-md text-on-surface-variant">
            Este comerciante todavía no tiene productos publicados.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comerciante.productos.map((p) => {
              const photoUrl = getPrimaryProductPhoto(p.fotos);

              return (
                <Link key={p.id} href={`/productos/${p.id}`} className="product-card">
                  <div className="aspect-square bg-surface-container-highest flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt={p.titulo} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl text-on-surface-variant/30">📷</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="label-sm text-on-surface-variant">
                      {p.categoria?.nombre}
                    </p>
                    <h3 className="mt-1 font-medium text-on-surface line-clamp-1">
                      {p.titulo}
                    </h3>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <span className="verified-leaf">
                        <span aria-hidden="true">🍃</span>
                        {comerciante.nombre}
                      </span>
                      <span className="price-chip">$ {p.precio.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
