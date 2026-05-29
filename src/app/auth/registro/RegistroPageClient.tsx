"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre || !telefono || !pin || !confirmPin) {
      setError("Completá todos los campos");
      return;
    }

    if (nombre.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (!/^\d{7,15}$/.test(telefono)) {
      setError("Teléfono inválido. Ingresá solo números.");
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError("El PIN debe tener entre 4 y 6 dígitos");
      return;
    }

    if (pin !== confirmPin) {
      setError("Los PIN no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, pin, nombre }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrarse");
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
    <div className="mx-auto mt-8 max-w-sm animate-fade-in">
      <div className="text-center">
        <h1 className="headline-lg text-on-surface">Crear cuenta</h1>
        <p className="mt-1 body-md text-on-surface-variant">
          Registrá tu negocio en FerIA gratis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="nombre"
            className="label-sm font-medium text-on-surface"
          >
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Tu nombre o negocio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input mt-1"
            autoComplete="name"
          />
        </div>

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
            PIN (4 a 6 dígitos)
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
            autoComplete="new-password"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPin"
            className="label-sm font-medium text-on-surface"
          >
            Repetir PIN
          </label>
          <input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            placeholder="••••••"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="input mt-1"
            autoComplete="new-password"
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
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <p className="mt-6 text-center body-md text-on-surface-variant">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary no-underline hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
