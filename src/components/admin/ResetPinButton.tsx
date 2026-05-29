"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetPinButton({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleReset() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    setConfirming(false);

    try {
      const res = await fetch(
        `/api/admin/usuarios/${usuarioId}/reset-pin`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al resetear PIN");
        return;
      }

      const data = await res.json();
      alert(`PIN reseteado a: ${data.nuevoPin}`);
      router.refresh();
    } catch {
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium transition-colors ${
        confirming ? "text-white" : "text-on-surface-variant"
      }`}
      style={{
        backgroundColor: confirming
          ? "var(--color-error)"
          : "var(--color-surface-container-high)",
      }}
    >
      {loading ? "..." : confirming ? "¿Resetear?" : "Reset PIN"}
    </button>
  );
}
