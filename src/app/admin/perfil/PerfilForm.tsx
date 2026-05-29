"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FeriaOption = { id: string; nombre: string };

type PerfilData = {
  nombre: string;
  descripcion: string;
  whatsapp: string;
  tipoUbicacion: string;
  ubicacion: string;
  dias: string;
  horario: string;
  fotoPerfil: string;
};

export function PerfilForm({
  initialData,
  feriasDisponibles,
  feriasActuales,
  telefono,
}: {
  initialData?: PerfilData;
  feriasDisponibles: FeriaOption[];
  feriasActuales: string[];
  telefono: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(e.currentTarget);

    const body: PerfilData = {
      nombre: form.get("nombre") as string,
      descripcion: (form.get("descripcion") as string) || "",
      whatsapp: (form.get("whatsapp") as string) || telefono,
      tipoUbicacion: (form.get("tipoUbicacion") as string) || "puesto_fijo",
      ubicacion: (form.get("ubicacion") as string) || "",
      dias: (form.get("dias") as string) || "",
      horario: (form.get("horario") as string) || "",
      fotoPerfil: (form.get("fotoPerfil") as string) || "",
    };

    try {
      const res = await fetch("/api/admin/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Error al guardar");
        return;
      }

      setMessage("Perfil actualizado ✅");
      router.refresh();
    } catch {
      setMessage("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {message && (
        <div
          className={`rounded-lg px-4 py-2 label-sm ${
            message.includes("✅")
              ? "bg-secondary/20 text-secondary"
              : ""
          }`}
          style={!message.includes("✅") ? { backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" } : {}}
        >
          {message}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="label-sm font-medium text-on-surface">
          Nombre / Nombre del comercio *
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          defaultValue={initialData?.nombre ?? ""}
          className="input mt-1"
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="label-sm font-medium text-on-surface">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={initialData?.descripcion ?? ""}
          className="input mt-1"
          placeholder="Contale a los compradores sobre tu emprendimiento..."
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="label-sm font-medium text-on-surface">
          WhatsApp (código de área + número, sin espacios ni +)
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          defaultValue={initialData?.whatsapp ?? telefono}
          className="input mt-1"
          placeholder="Ej: 3885123456"
        />
      </div>

      <div>
        <label htmlFor="tipoUbicacion" className="label-sm font-medium text-on-surface">
          Tipo de ubicación
        </label>
        <select
          id="tipoUbicacion"
          name="tipoUbicacion"
          defaultValue={initialData?.tipoUbicacion ?? "puesto_fijo"}
          className="input mt-1"
        >
          <option value="puesto_fijo">Puesto fijo</option>
          <option value="ambulante">Ambulante</option>
          <option value="domicilio">Solo a domicilio</option>
        </select>
      </div>

      <div>
        <label htmlFor="ubicacion" className="label-sm font-medium text-on-surface">
          Ubicación / Dirección
        </label>
        <input
          id="ubicacion"
          name="ubicacion"
          defaultValue={initialData?.ubicacion ?? ""}
          className="input mt-1"
          placeholder="Ej: Barrio San Martín, Pasaje 3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dias" className="label-sm font-medium text-on-surface">
            Días
          </label>
          <input
            id="dias"
            name="dias"
            defaultValue={initialData?.dias ?? ""}
            className="input mt-1"
            placeholder="Ej: Sábados y Domingos"
          />
        </div>
        <div>
          <label htmlFor="horario" className="label-sm font-medium text-on-surface">
            Horario
          </label>
          <input
            id="horario"
            name="horario"
            defaultValue={initialData?.horario ?? ""}
            className="input mt-1"
            placeholder="Ej: 09:00 - 13:00"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Guardando..." : "Guardar perfil"}
        </button>
        {initialData && (
          <a
            href={`/comerciantes/${encodeURIComponent(initialData.nombre.toLowerCase().replace(/\s+/g, "-"))}/qr`}
            target="_blank"
            className="btn-outline"
          >
            Ver perfil público
          </a>
        )}
      </div>
    </form>
  );
}
