import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export interface Feria {
  id: string;
  nombre: string;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  dias: string;
  horario: string | null;
  activa: boolean;
  _count?: { comerciantes: number };
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ferias",
  description: "Conocé todas las ferias de Palpalá, Jujuy. Encontrá productos locales, artesanías, ropa y más.",
  openGraph: {
    title: "Ferias | FerIA",
    description: "Conocé todas las ferias de Palpalá, Jujuy.",
  },
};

export default async function FeriasPage() {
  const ferias = await prisma.feria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { comerciantes: true } } },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="headline-lg text-on-surface">Ferias</h1>
      <p className="mt-1 body-md text-on-surface-variant">
        Conocé las ferias de Palpalá y descubrí qué ofrecen.
      </p>

      {ferias.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="body-md text-on-surface-variant">
            Todavía no hay ferias registradas.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ferias.map((feria) => {
            const mapsUrl = feria.lat && feria.lng
              ? `https://www.google.com/maps/@${feria.lat},${feria.lng},15z`
              : null;

            return (
              <div key={feria.id} className="card-pressable block p-5">
                <Link
                  href={`/productos?feriaId=${feria.id}`}
                  className="no-underline group"
                >
                  <h2 className="font-semibold text-on-surface text-lg group-hover:text-primary transition-colors">
                    {feria.nombre}
                  </h2>
                </Link>

                {feria.direccion && (
                  <p className="mt-1 body-md text-on-surface-variant">
                    📍{" "}
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {feria.direccion}
                      </a>
                    ) : (
                      feria.direccion
                    )}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge-outline">{feria.dias}</span>
                  <span
                    className="rounded-full px-3 py-1 label-sm text-on-surface-variant"
                    style={{ backgroundColor: "var(--color-surface-container-highest)" }}
                  >
                    {feria.horario}
                  </span>
                </div>
                <p className="mt-3 label-sm font-medium text-primary">
                  {feria._count.comerciantes} comerciante
                  {feria._count.comerciantes !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
