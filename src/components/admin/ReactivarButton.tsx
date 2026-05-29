"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReactivarButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReactivar() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/productos/${productId}/reactivar`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al reactivar");
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
      onClick={handleReactivar}
      disabled={loading}
      className="inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium transition-colors"
      style={{
        backgroundColor: "rgba(63,102,83,0.1)",
        color: "var(--color-secondary)",
      }}
    >
      {loading ? "..." : "Reactivar"}
    </button>
  );
}
