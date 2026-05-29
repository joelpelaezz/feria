import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "./PrintButton";
import { getQrImageUrl } from "@/lib/qr";
import { getMerchantProfileUrl } from "@/lib/site";

export default async function AdminQRPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  if (session.rol === "admin") {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <p className="body-md text-on-surface-variant">
          El QR es solo para comerciantes.
        </p>
      </div>
    );
  }

  const comerciante = await prisma.comerciante.findUnique({
    where: { usuarioId: session.userId },
    select: { id: true, nombre: true, slug: true, whatsapp: true },
  });

  if (!comerciante) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <p className="body-md text-on-surface-variant">
          Primero completá tu perfil para generar el QR.
        </p>
        <a
          href="/admin/perfil"
          className="btn-primary mt-4 inline-flex"
        >
          Completar perfil
        </a>
      </div>
    );
  }

  const perfilUrl = getMerchantProfileUrl(comerciante.slug);
  const qrImageUrl = getQrImageUrl(perfilUrl, 320);
  const whatsappUrl = `https://wa.me/${comerciante.whatsapp}`;

  return (
    <div className="max-w-md animate-fade-in">
      <h1 className="headline-lg text-on-surface">Tu Código QR</h1>
      <p className="mt-1 body-md text-on-surface-variant">
        Imprimí este código y mostralo en tu puesto. Los compradores lo escanean y ven tu catálogo.
      </p>

      {/* QR visual */}
      <div className="card mt-6 flex flex-col items-center p-8">
        <div className="mb-4 flex h-56 w-56 items-center justify-center rounded-lg bg-white p-3" style={{ border: "1px solid rgba(63,102,83,0.1)" }}>
          <img
            src={qrImageUrl}
            alt={`Código QR del catálogo de ${comerciante.nombre}`}
            className="h-full w-full"
          />
        </div>

        <p className="font-medium text-on-surface">{comerciante.nombre}</p>
        <p className="label-sm break-all text-on-surface-variant">{perfilUrl}</p>
      </div>

      {/* Instrucciones + acciones */}
      <div className="mt-6 space-y-4">
        <div className="card p-4">
          <h3 className="label-sm font-semibold text-on-surface">Cómo usar tu QR</h3>
          <ol className="mt-2 list-inside list-decimal space-y-1 body-md text-on-surface-variant">
            <li>Imprimí esta página o guardala en tu celular</li>
            <li>Colocá el código en un lugar visible de tu puesto</li>
            <li>Los compradores lo escanean con la cámara del celular</li>
            <li>Ven tu catálogo completo y te contactan por WhatsApp</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-3">
          <PrintButton />
          <a
            href={perfilUrl}
            target="_blank"
            className="btn-outline"
          >
            Ver mi perfil público
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            className="btn-outline"
          >
            Mi WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
