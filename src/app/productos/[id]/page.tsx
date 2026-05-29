import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseProductPhotos } from "@/lib/product-images";
import { ProductGallery } from "@/components/product/ProductGallery";
import { WhatsAppConsultaButton } from "@/components/product/WhatsAppConsultaButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: { titulo: true, descripcion: true, precio: true },
  });

  if (!producto) return { title: "Producto no encontrado" };

  return {
    title: producto.titulo,
    description:
      producto.descripcion ||
      `${producto.titulo} — $${producto.precio.toLocaleString("es-AR")} en FerIA.`,
    openGraph: {
      title: `${producto.titulo} | FerIA`,
      description:
        producto.descripcion ||
        `${producto.titulo} en las ferias de Palpalá.`,
    },
  };
}

export default async function ProductoDetailPage({ params }: PageProps) {
  const { id } = await params;

  const producto = await prisma.producto.findUnique({
    where: { id },
    include: {
      categoria: { select: { id: true, nombre: true } },
      comerciante: {
        select: {
          id: true,
          nombre: true,
          slug: true,
          descripcion: true,
          whatsapp: true,
          ubicacion: true,
          dias: true,
          horario: true,
          tipoUbicacion: true,
        },
      },
    },
  });

  if (!producto) notFound();

  const photos = parseProductPhotos(producto.fotos);
  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 body-md text-on-surface-variant">
        <Link href="/productos" className="hover:text-primary no-underline">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">{producto.titulo}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <ProductGallery photos={photos} title={producto.titulo} />

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge-categoria">
              {producto.categoria?.nombre}
            </span>
            <span className={`badge-${producto.tipo === "nuevo" ? "nuevo" : "usado"}`}>
              {producto.tipo === "usado" ? "Usado" : "Nuevo"}
            </span>
            {producto.aceptaTrueque && (
              <span className="badge-trueque">
                ⟳ Trueque
              </span>
            )}
          </div>

          <h1 className="mt-3 headline-md text-on-surface">
            {producto.titulo}
          </h1>

          <p className="mt-3 inline-flex price-panel">
            $ {producto.precio.toLocaleString("es-AR")}
          </p>

          {producto.talle && (
            <p className="mt-2 body-md text-on-surface-variant">
              <span className="font-medium">Talle:</span> {producto.talle}
            </p>
          )}

          <p className="mt-1 body-md text-on-surface-variant">
            <span className="font-medium">Stock:</span>{" "}
            {producto.stock > 0 ? (
              `${producto.stock} unidad${producto.stock !== 1 ? "es" : ""}`
            ) : (
              <span className="font-medium" style={{ color: "var(--color-error)" }}>
                Sin stock
              </span>
            )}
          </p>

          {producto.stock <= 0 && producto.demandaPerdida > 0 && (
            <p className="mt-1 body-md" style={{ color: "var(--color-secondary)" }}>
              🔥 {producto.demandaPerdida} persona{producto.demandaPerdida !== 1 ? "s" : ""} interesada{producto.demandaPerdida !== 1 ? "s" : ""}
            </p>
          )}

          {producto.disponibleEnDomicilio && (
            <p className="mt-1 body-md font-medium text-secondary">
              ✅ Disponible en domicilio
            </p>
          )}

          {producto.descripcion && (
            <p className="mt-4 body-md leading-relaxed text-on-surface-variant">
              {producto.descripcion}
            </p>
          )}

          {producto.aceptaTrueque && producto.buscaCambio && (
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: "rgba(224,192,96,0.2)", backgroundColor: "rgba(224,192,96,0.05)" }}>
              <p className="body-md font-medium text-trueque">🔄 Busca cambio por:</p>
              <p className="mt-1 body-md text-on-surface-variant">
                {producto.buscaCambio}
              </p>
            </div>
          )}

          {/* Comerciante card */}
          <div className="card mt-6 p-4">
            <p className="label-sm text-on-surface-variant">Vendido por</p>
            <Link
              href={`/comerciantes/${producto.comerciante.slug}`}
              className="mt-1 block headline-sm text-on-surface no-underline hover:text-primary"
            >
              {producto.comerciante.nombre}
              <span className="ml-1.5 verified-leaf"><span aria-hidden="true">🍃</span>Verificado</span>
            </Link>
            {producto.comerciante.ubicacion && (
              <p className="mt-1 body-md text-on-surface-variant">
                📍 {producto.comerciante.ubicacion}
              </p>
            )}
            {producto.comerciante.dias && (
              <p className="body-md text-on-surface-variant">
                🕐 {producto.comerciante.dias} · {producto.comerciante.horario}
              </p>
            )}
          </div>

          {/* WhatsApp button */}
          <WhatsAppConsultaButton productoId={producto.id} />

          <p className="mt-2 text-center label-sm text-on-surface-variant">
            Te redirige a WhatsApp sin compartir tu número
          </p>
        </div>
      </div>
    </div>
  );
}
