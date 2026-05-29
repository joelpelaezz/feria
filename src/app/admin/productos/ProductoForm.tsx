"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";
import { parseProductPhotos } from "@/lib/product-images";

type Categoria = { id: string; nombre: string };

type ProductoData = {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  categoriaId?: string;
  talle?: string;
  tipo?: string;
  stock?: number;
  aceptaTrueque?: boolean;
  buscaCambio?: string;
  disponibleEnFeria?: boolean;
  disponibleEnDomicilio?: boolean;
  estado?: string;
  fotos?: string;
};

export function ProductoForm({
  categorias,
  initialData,
  productoId,
}: {
  categorias: Categoria[];
  initialData?: ProductoData;
  productoId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>(() => parseProductPhotos(initialData?.fotos));

  const isEditing = !!productoId;
  const canAddMore = photoUrls.length < 4;

  const previewPhotos = useMemo(() => photoUrls.slice(0, 4), [photoUrls]);

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const availableSlots = Math.max(0, 4 - photoUrls.length);
      const selected = files.slice(0, availableSlots);

      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/uploads/productos", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "No se pudo subir la imagen");
          break;
        }

        setPhotoUrls((current) => [...current, data.url]);
      }
    } catch {
      setError("Error subiendo imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(index: number) {
    setPhotoUrls((current) => current.filter((_, i) => i !== index));
  }

  function promotePhoto(index: number) {
    setPhotoUrls((current) => {
      const next = [...current];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body: ProductoData = {
      titulo: form.get("titulo") as string,
      descripcion: form.get("descripcion") as string,
      precio: parseFloat(form.get("precio") as string),
      categoriaId: (form.get("categoriaId") as string) || undefined,
      talle: (form.get("talle") as string) || undefined,
      tipo: (form.get("tipo") as string) || "usado",
      stock: parseInt(form.get("stock") as string) || 1,
      aceptaTrueque: form.get("aceptaTrueque") === "on",
      buscaCambio: (form.get("buscaCambio") as string) || undefined,
      disponibleEnFeria: form.get("disponibleEnFeria") !== "off",
      disponibleEnDomicilio: form.get("disponibleEnDomicilio") === "on",
      estado: (form.get("estado") as string) || "publicado",
      fotos: JSON.stringify(photoUrls),
    };

    try {
      const url = isEditing
        ? `/api/admin/productos/${productoId}`
        : "/api/admin/productos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }

      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && (
        <div
          className="rounded-lg px-4 py-2 label-sm"
          style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
        >
          {error}
        </div>
      )}

      {/* Título */}
      <div>
        <label htmlFor="titulo" className="label-sm font-medium text-on-surface">
          Título *
        </label>
        <input
          id="titulo"
          name="titulo"
          required
          defaultValue={initialData?.titulo ?? ""}
          className="input mt-1"
          placeholder="Ej: Campera de Lana"
        />
      </div>

      {/* Descripción */}
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
          placeholder="Descripción del producto..."
        />
      </div>

      {/* Precio + Talle */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="precio" className="label-sm font-medium text-on-surface">
            Precio ($) *
          </label>
          <input
            id="precio"
            name="precio"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue={initialData?.precio ?? ""}
            className="input mt-1"
          />
        </div>
        <div>
          <label htmlFor="talle" className="label-sm font-medium text-on-surface">
            Talle
          </label>
          <input
            id="talle"
            name="talle"
            defaultValue={initialData?.talle ?? ""}
            className="input mt-1"
            placeholder="Ej: M, 42, Único"
          />
        </div>
      </div>

      {/* Tipo + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="tipo" className="label-sm font-medium text-on-surface">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={initialData?.tipo ?? "usado"}
            className="input mt-1"
          >
            <option value="usado">Usado</option>
            <option value="nuevo">Nuevo</option>
          </select>
        </div>
        <div>
          <label htmlFor="stock" className="label-sm font-medium text-on-surface">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={initialData?.stock ?? 1}
            className="input mt-1"
          />
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label htmlFor="categoriaId" className="label-sm font-medium text-on-surface">
          Categoría
        </label>
        <select
          id="categoriaId"
          name="categoriaId"
          defaultValue={initialData?.categoriaId ?? ""}
          className="input mt-1"
        >
          <option value="">Sin categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Fotos */}
      <div className="card p-4 space-y-4">
        <div>
          <p className="label-sm font-medium text-on-surface">Fotos del producto</p>
          <p className="mt-1 label-sm text-on-surface-variant">
            Podés subir hasta 4 imágenes. Formatos: JPG, PNG, WEBP.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previewPhotos.map((url, index) => (
            <div key={url} className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-xl border bg-surface-container-highest" style={{ borderColor: "rgba(63,102,83,0.1)" }}>
                <img src={url} alt={`Foto ${index + 1} del producto`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 badge-trueque">Portada</span>
                )}
              </div>
              <div className="flex gap-2">
                {index > 0 && (
                  <button type="button" className="btn-outline flex-1 !min-h-0 !px-3 !py-2 text-sm" onClick={() => promotePhoto(index)}>
                    Portada
                  </button>
                )}
                <button type="button" className="btn-outline flex-1 !min-h-0 !px-3 !py-2 text-sm" onClick={() => removePhoto(index)}>
                  Quitar
                </button>
              </div>
            </div>
          ))}

          {canAddMore && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed bg-surface-container-low text-center" style={{ borderColor: "rgba(63,102,83,0.2)" }}>
              <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handlePhotoUpload} />
              <span className="label-sm text-on-surface-variant">
                {uploading ? "Subiendo..." : "+ Agregar foto"}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Trueque */}
      <div className="card p-4 space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="aceptaTrueque"
            defaultChecked={initialData?.aceptaTrueque ?? false}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="label-sm text-on-surface">Acepta trueque</span>
        </label>
        <div>
          <label htmlFor="buscaCambio" className="label-sm text-on-surface-variant">
            ¿Qué busca a cambio?
          </label>
          <input
            id="buscaCambio"
            name="buscaCambio"
            defaultValue={initialData?.buscaCambio ?? ""}
            className="input mt-1"
            placeholder="Ej: Busco jean talle 42"
          />
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="card p-4 space-y-3">
        <p className="label-sm font-medium text-on-surface">Disponible en:</p>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="disponibleEnFeria"
            defaultChecked={initialData?.disponibleEnFeria ?? true}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="label-sm text-on-surface">En la feria</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="disponibleEnDomicilio"
            defaultChecked={initialData?.disponibleEnDomicilio ?? false}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="label-sm text-on-surface">A domicilio</span>
        </label>
      </div>

      {/* Estado */}
      <div>
        <label htmlFor="estado" className="label-sm font-medium text-on-surface">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          defaultValue={initialData?.estado ?? "publicado"}
          className="input mt-1"
        >
          <option value="publicado">Publicado</option>
          <option value="borrador">Borrador</option>
          <option value="vendido">Vendido</option>
          <option value="agotado">Agotado</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
