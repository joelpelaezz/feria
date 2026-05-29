"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/productos/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al eliminar");
        return;
      }

      router.refresh();
    } catch {
      alert("Error de red");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium transition-colors ${
        confirming
          ? "text-white"
          : "text-on-surface-variant"
      }`}
      style={confirming ? { backgroundColor: "var(--color-error)" } : { backgroundColor: "var(--color-surface-container-high)" }}
    >
      {deleting ? "..." : confirming ? "¿Seguro?" : "Eliminar"}
    </button>
  );
}
