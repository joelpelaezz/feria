"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Categoria {
  id: string;
  nombre: string;
  activa: boolean;
  _count: { productos: number };
}

export function CategoriaManager({
  categorias: initial,
}: {
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [categorias, setCategorias] = useState(initial);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  async function crear() {
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al crear");
        return;
      }
      setNuevoNombre("");
      router.refresh();
    } catch {
      alert("Error de red");
    } finally {
      setCreando(false);
    }
  }

  async function actualizar(id: string, data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  async function toggleActiva(cat: Categoria) {
    await actualizar(cat.id, { activa: !cat.activa });
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta categoría? Solo si no tiene productos asociados."))
      return;
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
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
      {/* Formulario de creación */}
      <div className="card p-4">
        <h3 className="font-semibold text-on-surface mb-3">
          Nueva categoría
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            className="block flex-1 rounded-lg border bg-transparent px-4 py-3 body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-12"
            style={{ borderColor: "rgba(63,102,83,0.2)" }}
            onKeyDown={(e) => e.key === "Enter" && crear()}
          />
          <button
            onClick={crear}
            disabled={creando || !nuevoNombre.trim()}
            className="btn-primary min-h-12"
          >
            {creando ? "..." : "Crear"}
          </button>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-2">
        {categorias.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-8 text-center"
            style={{
              borderColor: "rgba(63,102,83,0.2)",
              backgroundColor: "var(--color-surface-container-low)",
            }}
          >
            <p className="body-md text-on-surface-variant">
              No hay categorías todavía
            </p>
          </div>
        ) : (
          categorias.map((cat) => (
            <div
              key={cat.id}
              className={`card flex items-center justify-between gap-3 p-4 ${
                !cat.activa ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                {editandoId === cat.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValor}
                      onChange={(e) => setEditValor(e.target.value)}
                      className="block flex-1 rounded-lg border bg-transparent px-3 py-2 body-md text-on-surface min-h-12"
                      style={{ borderColor: "rgba(63,102,83,0.2)" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          actualizar(cat.id, { nombre: editValor.trim() });
                        if (e.key === "Escape") setEditandoId(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() =>
                        actualizar(cat.id, { nombre: editValor.trim() })
                      }
                      className="btn-primary min-h-12 px-3"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="min-h-12 rounded-lg px-3 py-2 label-sm"
                      style={{
                        backgroundColor: "var(--color-surface-container-high)",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-on-surface">
                      {cat.nombre}
                    </h3>
                    <p className="label-sm text-on-surface-variant">
                      {cat._count.productos} producto
                      {cat._count.productos !== 1 ? "s" : ""}
                      {!cat.activa && " · Inactiva"}
                    </p>
                  </>
                )}
              </div>

              {editandoId !== cat.id && (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => {
                      setEditandoId(cat.id);
                      setEditValor(cat.nombre);
                    }}
                    className="min-h-12 rounded-lg px-3 py-2 label-sm"
                    style={{
                      backgroundColor: "var(--color-surface-container-high)",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActiva(cat)}
                    className="min-h-12 rounded-lg px-3 py-2 label-sm"
                    style={{
                      backgroundColor: cat.activa
                        ? "var(--color-surface-container-high)"
                        : "rgba(63,102,83,0.1)",
                      color: cat.activa
                        ? "var(--color-on-surface-variant)"
                        : "var(--color-secondary)",
                    }}
                  >
                    {cat.activa ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => eliminar(cat.id)}
                    className="min-h-12 rounded-lg px-3 py-2 label-sm"
                    style={{
                      backgroundColor: "var(--color-surface-container-high)",
                      color: "var(--color-error)",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
