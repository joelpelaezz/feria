"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ToggleActivoButton({
  usuarioId,
  activo,
}: {
  usuarioId: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/usuarios/${usuarioId}/toggle`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al cambiar estado");
        return;
      }

      router.refresh();
    } catch {
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium transition-colors ${
        activo
          ? "text-on-surface-variant"
          : "text-secondary"
      }`}
      style={{
        backgroundColor: activo
          ? "var(--color-surface-container-high)"
          : "rgba(63,102,83,0.1)",
      }}
    >
      {loading ? "..." : activo ? "Desactivar" : "Activar"}
    </button>
  );
}
