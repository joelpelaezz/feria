import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getQrImageUrl } from "@/lib/qr";
import { getMerchantProfileUrl } from "@/lib/site";
import { ShareProfileButton } from "./ShareProfileButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComercianteQRPage({ params }: PageProps) {
  const { slug } = await params;

  const comerciante = await prisma.comerciante.findUnique({
    where: { slug },
    select: { id: true, nombre: true, activo: true },
  });

  if (!comerciante) notFound();

  const qrUrl = getMerchantProfileUrl(slug);
  const qrImageUrl = getQrImageUrl(qrUrl, 320);

  return (
    <div className="animate-fade-in">
      <Link
        href={`/comerciantes/${slug}`}
        className="mb-4 inline-flex items-center gap-1 label-sm text-on-surface-variant no-underline hover:text-primary"
      >
        ← Volver al perfil
      </Link>

      <div className="mx-auto max-w-sm text-center">
        <h1 className="headline-md text-on-surface">
          Código QR de {comerciante.nombre}
        </h1>
        <p className="mt-2 body-md text-on-surface-variant">
          Escaneá este código con tu celular para ver el perfil del comerciante
          y sus productos.
        </p>

        <div className="mx-auto mt-8 flex h-64 w-64 items-center justify-center rounded-xl border bg-white p-3" style={{ borderColor: "rgba(63,102,83,0.2)" }}>
          <img
            src={qrImageUrl}
            alt={`Código QR del perfil de ${comerciante.nombre}`}
            className="h-full w-full"
          />
        </div>

        <p className="mt-4 break-all label-sm text-on-surface-variant">
          {qrUrl}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <ShareProfileButton
            title={`${comerciante.nombre} en FerIA`}
            url={qrUrl}
          />
        </div>

        <p className="mt-4 label-sm text-on-surface-variant">
          Mostrá este código en tu puesto para que los clientes escaneen y vean
          tus productos al instante.
        </p>
      </div>
    </div>
  );
}
