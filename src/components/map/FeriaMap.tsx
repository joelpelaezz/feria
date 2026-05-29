"use client";

import { useEffect, useState } from "react";
import type { Feria } from "./FeriaMapWrapper";

interface Props {
  ferias: Feria[];
  onFeriaClick?: (feria: Feria) => void;
}

export function FeriaMap({ ferias, onFeriaClick }: Props) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet components (client-side only)
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
    ]).then(([L, RL]) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const { MapContainer, TileLayer, Marker, Popup, useMap } = RL;

      // Center on Palpalá by default
      const DEFAULT_CENTER: [number, number] = [-23.55, -65.71];
      const DEFAULT_ZOOM = 13;

      function MapContent({ ferias }: { ferias: Feria[] }) {
        const map = useMap();
        const [selectedFeria, setSelectedFeria] = useState<Feria | null>(null);

        // Fit bounds when ferias change
        useEffect(() => {
          const withCoords = ferias.filter((f) => f.lat && f.lng);
          if (withCoords.length === 0) return;

          const bounds = L.latLngBounds(
            withCoords.map((f) => [f.lat!, f.lng!] as [number, number])
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }, [ferias, map]);

        return (
          <>
            {ferias.map((feria) => {
              if (!feria.lat || !feria.lng) return null;
              return (
                <Marker
                  key={feria.id}
                  position={[feria.lat, feria.lng]}
                  eventHandlers={{
                    click: () => {
                      setSelectedFeria(feria);
                      onFeriaClick?.(feria);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-semibold text-on-surface">
                        {feria.nombre}
                      </h3>
                      {feria.direccion && (
                        <p className="text-sm text-on-surface-variant">
                          📍 {feria.direccion}
                        </p>
                      )}
                      <p className="text-sm text-on-surface-variant">
                        🕐 {feria.dias}
                        {feria.horario && ` · ${feria.horario}`}
                      </p>
                      {feria._count && (
                        <p className="text-sm text-on-surface-variant">
                          🏪 {feria._count.comerciantes} comerciante{feria._count.comerciantes !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        );
      }

      setMapComponent(() => function FeriaMapInner() {
        return (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full rounded-xl"
            style={{ minHeight: "400px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapContent ferias={ferias} />
          </MapContainer>
        );
      });
    });
  }, [ferias, onFeriaClick]);

  if (!MapComponent) {
    return (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          minHeight: "400px",
          backgroundColor: "var(--color-surface-container)",
        }}
      >
        <p className="text-on-surface-variant">Cargando mapa...</p>
      </div>
    );
  }

  return <MapComponent />;
}
