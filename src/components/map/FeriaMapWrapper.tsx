"use client";

import dynamic from "next/dynamic";

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

// Dynamic import to avoid SSR issues with Leaflet
const FeriaMap = dynamic(
  () => import("./FeriaMap").then((mod) => mod.FeriaMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          minHeight: "400px",
          backgroundColor: "var(--color-surface-container)",
        }}
      >
        <p className="text-on-surface-variant">Cargando mapa...</p>
      </div>
    ),
  }
);

export function FeriaMapWrapper({
  ferias,
  onFeriaClick,
}: {
  ferias: Feria[];
  onFeriaClick?: (feria: Feria) => void;
}) {
  return <FeriaMap ferias={ferias} onFeriaClick={onFeriaClick} />;
}
