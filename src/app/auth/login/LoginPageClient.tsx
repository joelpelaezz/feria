"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [telefono, setTelefono] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!telefono || !pin) {
      setError("Completá todos los campos");
      return;
    }

    if (!/^\d{7,15}$/.test(telefono)) {
      setError("Teléfono inválido");
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError("El PIN debe tener entre 4 y 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-sm animate-fade-in">
      <div className="text-center">
        <h1 className="headline-lg text-on-surface">Iniciar sesión</h1>
        <p className="mt-1 body-md text-on-surface-variant">
          Ingresá tu teléfono y PIN para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="telefono"
            className="label-sm font-medium text-on-surface"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            placeholder="3881111111"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
            className="input mt-1"
            autoComplete="tel"
          />
        </div>

        <div>
          <label
            htmlFor="pin"
            className="label-sm font-medium text-on-surface"
          >
            PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="••••••"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="input mt-1"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div
            className="rounded-lg px-4 py-2 label-sm"
            style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center body-md text-on-surface-variant">
        ¿No tenés cuenta?{" "}
        <Link
          href="/auth/registro"
          className="font-medium text-primary no-underline hover:underline"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
