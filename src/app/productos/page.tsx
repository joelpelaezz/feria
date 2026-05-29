import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPrimaryProductPhoto } from "@/lib/product-images";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explorá productos de las ferias de Palpalá: ropa, accesorios, calzado y más. Conectate directo con el comerciante por WhatsApp.",
  openGraph: {
    title: "Productos | FerIA",
    description: "Explorá productos de las ferias de Palpalá.",
  },
};

interface PageProps {
  searchParams: Promise<{
    categoriaId?: string;
    feriaId?: string;
    comercianteId?: string;
    busqueda?: string;
    trueque?: string;
    tipo?: string;
    precioMin?: string;
    precioMax?: string;
    orden?: string;
    stock?: string;
    page?: string;
  }>;
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoriaId = params.categoriaId;
  const feriaId = params.feriaId;
  const comercianteId = params.comercianteId;
  const busqueda = params.busqueda;
  const trueque = params.trueque;
  const tipo = params.tipo;
  const precioMin = params.precioMin ? parseFloat(params.precioMin) : undefined;
  const precioMax = params.precioMax ? parseFloat(params.precioMax) : undefined;
  const orden = params.orden || "recientes";
  const stock = params.stock;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (categoriaId) where.categoriaId = categoriaId;
  if (comercianteId) where.comercianteId = comercianteId;
  if (tipo) where.tipo = tipo;
  if (trueque === "true") where.aceptaTrueque = true;
  if (busqueda) {
    where.OR = [
      { titulo: { contains: busqueda } },
      { descripcion: { contains: busqueda } },
    ];
  }

  // Filtros de precio
  if (precioMin !== undefined || precioMax !== undefined) {
    where.precio = {};
    if (precioMin !== undefined) (where.precio as Record<string, number>).gte = precioMin;
    if (precioMax !== undefined) (where.precio as Record<string, number>).lte = precioMax;
  }

  // Filtro de stock
  if (stock === "disponible") where.stock = { gt: 0 };
  if (stock === "agotado") where.stock = 0;

  // Filtro por feria: buscar comerciantes de esa feria
  if (feriaId) {
    const ids = await prisma.comercianteFeria.findMany({
      where: { feriaId },
      select: { comercianteId: true },
    });
    where.comercianteId = { in: ids.map((cf) => cf.comercianteId) };
  }

  // Ordenamiento
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (orden === "precio-asc") orderBy = { precio: "asc" };
  if (orden === "precio-desc") orderBy = { precio: "desc" };
  if (orden === "recientes") orderBy = { createdAt: "desc" };

  const [categorias, productos, total] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({
      where: where as any,
      include: {
        categoria: { select: { id: true, nombre: true } },
        comerciante: { select: { id: true, nombre: true, slug: true, whatsapp: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.producto.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Obtener feria name si se filtra por feria
  let feriaName = "";
  if (feriaId) {
    const feria = await prisma.feria.findUnique({ where: { id: feriaId }, select: { nombre: true } });
    feriaName = feria?.nombre || "";
  }

  // Build query string helper
  const qs = (extra: Record<string, string | null | undefined>) => {
    const p = new URLSearchParams();

    if (categoriaId) p.set("categoriaId", categoriaId);
    if (feriaId) p.set("feriaId", feriaId);
    if (comercianteId) p.set("comercianteId", comercianteId);
    if (busqueda) p.set("busqueda", busqueda);
    if (trueque === "true") p.set("trueque", "true");
    if (tipo) p.set("tipo", tipo);
    if (precioMin) p.set("precioMin", String(precioMin));
    if (precioMax) p.set("precioMax", String(precioMax));
    if (orden && orden !== "recientes") p.set("orden", orden);
    if (stock) p.set("stock", stock);

    Object.entries(extra).forEach(([k, v]) => {
      if (v === null || v === "") {
        p.delete(k);
        return;
      }
      if (v !== undefined) p.set(k, v);
    });

    p.delete("page");
    if (extra.page) p.set("page", extra.page);

    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const activeFilter = (key: string) => {
    if (key === "todos") return !categoriaId && !tipo && trueque !== "true";
    if (key === "trueque") return trueque === "true";
    if (key === "nuevo" || key === "usado") return tipo === key;
    return categoriaId === key;
  };

  const hasExtraFilters = Boolean(
    busqueda || categoriaId || tipo || trueque === "true" ||
    precioMin || precioMax || stock
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="headline-lg text-on-surface">
          {feriaName ? feriaName : busqueda ? `Resultados: "${busqueda}"` : "Productos"}
        </h1>
        <p className="mt-1 body-md text-on-surface-variant">
          {total} producto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Búsqueda */}
      <form action="/productos" method="GET" className="mt-4 space-y-3">
        {feriaId && <input type="hidden" name="feriaId" value={feriaId} />}
        {comercianteId && <input type="hidden" name="comercianteId" value={comercianteId} />}
        {categoriaId && <input type="hidden" name="categoriaId" value={categoriaId} />}
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        {trueque === "true" && <input type="hidden" name="trueque" value="true" />}
        {orden && orden !== "recientes" && <input type="hidden" name="orden" value={orden} />}
        {stock && <input type="hidden" name="stock" value={stock} />}

        <div className="search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            name="busqueda"
            defaultValue={busqueda ?? ""}
            className="input"
            placeholder="Buscar producto, descripción o talle..."
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            Buscar
          </button>
          {busqueda && (
            <Link href={qs({ busqueda: null })} className="btn-outline">
              Limpiar búsqueda
            </Link>
          )}
        </div>
      </form>

      {/* Filtros tipo pills */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        <Link
          href={qs({ categoriaId: null, tipo: null, trueque: null })}
          className={`filter-pill ${activeFilter("todos") ? "filter-pill-active" : ""}`}
        >
          Todos
        </Link>
        <Link
          href={qs({ categoriaId: null, tipo: null, trueque: "true" })}
          className={`filter-pill ${activeFilter("trueque") ? "filter-pill-active" : ""}`}
        >
          ⟳ Trueque
        </Link>
        <Link
          href={qs({ categoriaId: null, tipo: "nuevo", trueque: null })}
          className={`filter-pill ${activeFilter("nuevo") ? "filter-pill-active" : ""}`}
        >
          Nuevo
        </Link>
        <Link
          href={qs({ categoriaId: null, tipo: "usado", trueque: null })}
          className={`filter-pill ${activeFilter("usado") ? "filter-pill-active" : ""}`}
        >
          Usado
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={qs({ categoriaId: cat.id, tipo: null, trueque: null })}
            className={`filter-pill ${activeFilter(cat.id) ? "filter-pill-active" : ""}`}
          >
            {cat.nombre}
          </Link>
        ))}
      </div>

      {hasExtraFilters && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="label-sm text-on-surface-variant">
            Filtros activos
          </p>
          <Link href={qs({ categoriaId: null, busqueda: null, tipo: null, trueque: null, precioMin: null, precioMax: null, stock: null, orden: null })} className="label-sm text-primary no-underline hover:underline">
            Limpiar todo
          </Link>
        </div>
      )}

      {/* Filtros avanzados */}
      <div className="mt-4 card p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Precio */}
          <div>
            <label className="label-sm text-on-surface-variant block mb-1">
              Precio
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="precioMin"
                defaultValue={precioMin ?? ""}
                placeholder="Mín"
                className="w-24 rounded-lg border bg-transparent px-3 py-2 body-sm text-on-surface min-h-10"
                style={{ borderColor: "rgba(63,102,83,0.2)" }}
              />
              <span className="text-on-surface-variant">—</span>
              <input
                type="number"
                name="precioMax"
                defaultValue={precioMax ?? ""}
                placeholder="Máx"
                className="w-24 rounded-lg border bg-transparent px-3 py-2 body-sm text-on-surface min-h-10"
                style={{ borderColor: "rgba(63,102,83,0.2)" }}
              />
            </div>
          </div>

          {/* Orden */}
          <div>
            <label className="label-sm text-on-surface-variant block mb-1">
              Ordenar
            </label>
            <select
              name="orden"
              defaultValue={orden}
              className="rounded-lg border bg-transparent px-3 py-2 body-sm text-on-surface min-h-10"
              style={{ borderColor: "rgba(63,102,83,0.2)" }}
            >
              <option value="recientes">Más recientes</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="label-sm text-on-surface-variant block mb-1">
              Stock
            </label>
            <div className="flex gap-2">
              <Link
                href={qs({ stock: null })}
                className={`filter-pill ${!stock ? "filter-pill-active" : ""}`}
              >
                Todos
              </Link>
              <Link
                href={qs({ stock: "disponible" })}
                className={`filter-pill ${stock === "disponible" ? "filter-pill-active" : ""}`}
              >
                Disponible
              </Link>
              <Link
                href={qs({ stock: "agotado" })}
                className={`filter-pill ${stock === "agotado" ? "filter-pill-active" : ""}`}
              >
                Agotado
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-primary min-h-10">
            Aplicar
          </button>
        </div>
      </div>

      {/* Productos grid */}
      {productos.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="body-md text-on-surface-variant">
            No hay productos que coincidan con tu búsqueda.
          </p>
          <Link
            href="/productos"
            className="mt-2 label-sm text-primary no-underline hover:underline inline-block"
          >
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productos.map((p) => {
            const photoUrl = getPrimaryProductPhoto(p.fotos);

            return (
              <Link
                key={p.id}
                href={`/productos/${p.id}`}
                className="product-card group"
              >
                <div className="relative aspect-square bg-surface-container-highest">
                  {photoUrl ? (
                    <img src={photoUrl} alt={p.titulo} className="h-full w-full object-cover" />
                  ) : null}
                  {p.aceptaTrueque && (
                    <span className="badge-trueque absolute left-2 top-2 z-10">
                      ⟳ Trueque
                    </span>
                  )}
                  {p.tipo && (
                    <span className={`absolute right-2 top-2 z-10 badge-${p.tipo === "nuevo" ? "nuevo" : "usado"}`}>
                      {p.tipo === "nuevo" ? "Nuevo" : "Usado"}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="label-sm text-on-surface-variant">
                    {p.categoria?.nombre}
                  </p>
                  <h3 className="mt-1 font-medium text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {p.titulo}
                  </h3>
                  {p.talle && (
                    <p className="label-sm text-on-surface-variant">Talle: {p.talle}</p>
                  )}
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <span className="verified-leaf">
                      <span aria-hidden="true">🍃</span>
                      {p.comerciante.nombre}
                    </span>
                    <span className="price-chip">
                      $ {p.precio.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={qs({ page: String(page - 1) })}
              className="btn-outline"
            >
              Anterior
            </Link>
          )}
          <span className="px-3 body-md text-on-surface-variant">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={qs({ page: String(page + 1) })}
              className="btn-outline"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
