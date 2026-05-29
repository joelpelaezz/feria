"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Feria {
  id: string;
  nombre: string;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  dias: string;
  horario: string | null;
  activa: boolean;
  _count: { comerciantes: number };
}

export function FeriaManager({ ferias: initial }: { ferias: Feria[] }) {
  const router = useRouter();
  const [ferias, setFerias] = useState(initial);
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Formulario nuevo
  const [nuevo, setNuevo] = useState({
    nombre: "",
    direccion: "",
    lat: "",
    lng: "",
    dias: "",
    horario: "",
  });

  // Formulario edición
  const [edit, setEdit] = useState({
    nombre: "",
    direccion: "",
    lat: "",
    lng: "",
    dias: "",
    horario: "",
  });

  function resetNuevo() {
    setNuevo({ nombre: "", direccion: "", lat: "", lng: "", dias: "", horario: "" });
  }

  async function crear() {
    if (!nuevo.nombre.trim() || !nuevo.dias.trim()) {
      alert("Nombre y días son requeridos");
      return;
    }
    setCreando(true);
    try {
      const res = await fetch("/api/admin/ferias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevo.nombre.trim(),
          direccion: nuevo.direccion.trim() || null,
          lat: nuevo.lat ? parseFloat(nuevo.lat) : null,
          lng: nuevo.lng ? parseFloat(nuevo.lng) : null,
          dias: nuevo.dias.trim(),
          horario: nuevo.horario.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al crear");
        return;
      }
      resetNuevo();
      router.refresh();
    } catch {
      alert("Error de red");
    } finally {
      setCreando(false);
    }
  }

  function abrirEdit(f: Feria) {
    setEditandoId(f.id);
    setEdit({
      nombre: f.nombre,
      direccion: f.direccion ?? "",
      lat: f.lat?.toString() ?? "",
      lng: f.lng?.toString() ?? "",
      dias: f.dias,
      horario: f.horario ?? "",
    });
  }

  async function actualizar(id: string) {
    if (!edit.nombre.trim() || !edit.dias.trim()) {
      alert("Nombre y días son requeridos");
      return;
    }
    try {
      const res = await fetch(`/api/admin/ferias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: edit.nombre.trim(),
          direccion: edit.direccion.trim() || null,
          lat: edit.lat ? parseFloat(edit.lat) : null,
          lng: edit.lng ? parseFloat(edit.lng) : null,
          dias: edit.dias.trim(),
          horario: edit.horario.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Error al actualizar");
        return;
      }
      setEditandoId(null);
      router.refresh();
    } catch {
      alert("Error de red");
    }
  }

  async function toggleActiva(f: Feria) {
    try {
      const res = await fetch(`/api/admin/ferias/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !f.activa }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Error");
        return;
      }
      router.refresh();
    } catch {
      alert("Error de red");
    }
  }

  async function eliminar(id: string) {
    if (
      !confirm(
        "¿Eliminar esta feria? Solo si no tiene comerciantes asociados."
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/ferias/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Error al eliminar");
        return;
      }
      router.refresh();
    } catch {
      alert("Error de red");
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario nueva feria */}
      <div className="card p-4">
        <h3 className="font-semibold text-on-surface mb-3">Nueva feria</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre *"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="block w-full rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
            style={{ borderColor: "rgba(63,102,83,0.2)" }}
          />
          <input
            type="text"
            placeholder="Dirección"
            value={nuevo.direccion}
            onChange={(e) =>
              setNuevo({ ...nuevo, direccion: e.target.value })
            }
            className="block w-full rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
            style={{ borderColor: "rgba(63,102,83,0.2)" }}
          />
          <div className="flex gap-3">
            <input
              type="number"
              step="any"
              placeholder="Latitud (opcional)"
              value={nuevo.lat}
              onChange={(e) => setNuevo({ ...nuevo, lat: e.target.value })}
              className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
              style={{ borderColor: "rgba(63,102,83,0.2)" }}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitud (opcional)"
              value={nuevo.lng}
              onChange={(e) => setNuevo({ ...nuevo, lng: e.target.value })}
              className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
              style={{ borderColor: "rgba(63,102,83,0.2)" }}
            />
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Días * (ej: Sábados y Domingos)"
              value={nuevo.dias}
              onChange={(e) => setNuevo({ ...nuevo, dias: e.target.value })}
              className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
              style={{ borderColor: "rgba(63,102,83,0.2)" }}
            />
            <input
              type="text"
              placeholder="Horario (ej: 9 a 13hs)"
              value={nuevo.horario}
              onChange={(e) =>
                setNuevo({ ...nuevo, horario: e.target.value })
              }
              className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
              style={{ borderColor: "rgba(63,102,83,0.2)" }}
            />
          </div>
          <button
            onClick={crear}
            disabled={
              creando || !nuevo.nombre.trim() || !nuevo.dias.trim()
            }
            className="btn-primary"
          >
            {creando ? "..." : "Crear feria"}
          </button>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {ferias.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-8 text-center"
            style={{
              borderColor: "rgba(63,102,83,0.2)",
              backgroundColor: "var(--color-surface-container-low)",
            }}
          >
            <p className="body-md text-on-surface-variant">
              No hay ferias todavía
            </p>
          </div>
        ) : (
          ferias.map((f) => (
            <div
              key={f.id}
              className={`card p-4 ${!f.activa ? "opacity-60" : ""}`}
            >
              {editandoId === f.id ? (
                /* Modo edición */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={edit.nombre}
                    onChange={(e) =>
                      setEdit({ ...edit, nombre: e.target.value })
                    }
                    className="block w-full rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface min-h-12"
                    style={{ borderColor: "rgba(63,102,83,0.2)" }}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={edit.direccion}
                    onChange={(e) =>
                      setEdit({ ...edit, direccion: e.target.value })
                    }
                    placeholder="Dirección"
                    className="block w-full rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface min-h-12"
                    style={{ borderColor: "rgba(63,102,83,0.2)" }}
                  />
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="any"
                      value={edit.lat}
                      onChange={(e) =>
                        setEdit({ ...edit, lat: e.target.value })
                      }
                      placeholder="Latitud"
                      className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface min-h-12"
                      style={{ borderColor: "rgba(63,102,83,0.2)" }}
                    />
                    <input
                      type="number"
                      step="any"
                      value={edit.lng}
                      onChange={(e) =>
                        setEdit({ ...edit, lng: e.target.value })
                      }
                      placeholder="Longitud"
                      className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface min-h-12"
                      style={{ borderColor: "rgba(63,102,83,0.2)" }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={edit.dias}
                      onChange={(e) =>
                        setEdit({ ...edit, dias: e.target.value })
                      }
                      className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface min-h-12"
                      style={{ borderColor: "rgba(63,102,83,0.2)" }}
                    />
                    <input
                      type="text"
                      value={edit.horario}
                      onChange={(e) =>
                        setEdit({ ...edit, horario: e.target.value })
                      }
                      placeholder="Horario"
                      className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface min-h-12"
                      style={{ borderColor: "rgba(63,102,83,0.2)" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => actualizar(f.id)}
                      className="btn-primary"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="min-h-12 rounded-lg px-4 py-3 label-sm"
                      style={{
                        backgroundColor:
                          "var(--color-surface-container-high)",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo vista */
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-on-surface">
                      {f.nombre}
                    </h3>
                    <p className="label-sm text-on-surface-variant">
                      {f.direccion && `📍 ${f.direccion} · `}
                      🕐 {f.dias}
                      {f.horario && ` · ${f.horario}`}
                    </p>
                    <p className="label-sm text-on-surface-variant">
                      {f._count.comerciantes} comerciante
                      {f._count.comerciantes !== 1 ? "s" : ""}
                      {!f.activa && " · Inactiva"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => abrirEdit(f)}
                      className="min-h-12 rounded-lg px-3 py-2 label-sm"
                      style={{
                        backgroundColor:
                          "var(--color-surface-container-high)",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActiva(f)}
                      className="min-h-12 rounded-lg px-3 py-2 label-sm"
                      style={{
                        backgroundColor: f.activa
                          ? "var(--color-surface-container-high)"
                          : "rgba(63,102,83,0.1)",
                        color: f.activa
                          ? "var(--color-on-surface-variant)"
                          : "var(--color-secondary)",
                      }}
                    >
                      {f.activa ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminar(f.id)}
                      className="min-h-12 rounded-lg px-3 py-2 label-sm"
                      style={{
                        backgroundColor:
                          "var(--color-surface-container-high)",
                        color: "var(--color-error)",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
