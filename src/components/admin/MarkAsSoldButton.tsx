"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAsSoldButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [selling, setSelling] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSell() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setSelling(true);
    try {
      const res = await fetch(`/api/admin/productos/${productId}/vender`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al marcar como vendido");
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      alert("Error de red");
    } finally {
      setSelling(false);
      setConfirming(false);
    }
  }

  if (done) {
    return (
      <span
        className="inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium"
        style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
      >
        ✓ Vendido
      </span>
    );
  }

  if (stock <= 0) {
    return (
      <span
        className="inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium"
        style={{
          backgroundColor: "rgba(191,64,68,0.1)",
          color: "var(--color-error)",
        }}
      >
        Sin stock
      </span>
    );
  }

  return (
    <button
      onClick={handleSell}
      disabled={selling}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium transition-colors ${
        confirming ? "text-white" : "text-on-surface-variant"
      }`}
      style={
        confirming
          ? { backgroundColor: "var(--color-secondary)" }
          : { backgroundColor: "var(--color-surface-container-high)" }
      }
    >
      {selling ? "..." : confirming ? "¿Seguro?" : `Vender 1`}
    </button>
  );
}
