import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTopConsultedProducts } from "@/lib/consultas";

// ─── Tipos ───────────────────────────────────────────────────────
interface ProductRank {
  id: string;
  titulo: string;
  slug: string;
  comercianteNombre: string;
  categoriaNombre: string | null;
  precio: number;
  consultas: number;
  demandaPerdida?: number;
}

interface ComercianteRank {
  id: string;
  nombre: string;
  slug: string;
  consultas: number;
  productos: number;
}

interface FeriaRank {
  id: string;
  nombre: string;
  consultas: number;
  comerciantes: number;
}

// ─── Helpers ─────────────────────────────────────────────────────
async function getComerciantesTop(
  take = 5
): Promise<ComercianteRank[]> {
  // Agrupar consultas por producto
  const grouped = await prisma.consulta.groupBy({
    by: ["productoId"],
    _count: { productoId: true },
    orderBy: { _count: { productoId: "desc" } },
    take: 100,
  });

  if (grouped.length === 0) return [];

  const productIds = grouped.map((g) => g.productoId);
  const productos = await prisma.producto.findMany({
    where: { id: { in: productIds } },
    select: { id: true, comercianteId: true },
  });

  const prodComerciante = new Map(
    productos.map((p) => [p.id, p.comercianteId])
  );

  // Acumular consultas por comerciante
  const acc = new Map<string, number>();
  for (const g of grouped) {
    const cId = prodComerciante.get(g.productoId);
    if (cId) acc.set(cId, (acc.get(cId) ?? 0) + g._count.productoId);
  }

  const comercianteIds = [...acc.keys()];
  const comerciantes = await prisma.comerciante.findMany({
    where: { id: { in: comercianteIds } },
    select: {
      id: true,
      nombre: true,
      slug: true,
      _count: { select: { productos: true } },
    },
  });

  return comerciantes
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      consultas: acc.get(c.id) ?? 0,
      productos: c._count.productos,
    }))
    .sort((a, b) => b.consultas - a.consultas)
    .slice(0, take);
}

async function getFeriasTop(take = 5): Promise<FeriaRank[]> {
  // Consultas → producto → comerciante → ferias
  const grouped = await prisma.consulta.groupBy({
    by: ["productoId"],
    _count: { productoId: true },
    orderBy: { _count: { productoId: "desc" } },
    take: 100,
  });

  if (grouped.length === 0) return [];

  const productIds = grouped.map((g) => g.productoId);
  const productos = await prisma.producto.findMany({
    where: { id: { in: productIds } },
    select: { id: true, comercianteId: true },
  });

  const prodComerciante = new Map(
    productos.map((p) => [p.id, p.comercianteId])
  );

  // Acumular consultas por comerciante
  const consultasPorComerciante = new Map<string, number>();
  for (const g of grouped) {
    const cId = prodComerciante.get(g.productoId);
    if (cId)
      consultasPorComerciante.set(
        cId,
        (consultasPorComerciante.get(cId) ?? 0) + g._count.productoId
      );
  }

  // Obtener ferias de esos comerciantes
  const comercianteIds = [...consultasPorComerciante.keys()];
  const cf = await prisma.comercianteFeria.findMany({
    where: { comercianteId: { in: comercianteIds } },
    select: { comercianteId: true, feriaId: true },
  });

  // Acumular por feria
  const feriaAcc = new Map<
    string,
    { consultas: number; comerciantes: Set<string> }
  >();
  for (const row of cf) {
    const consultas = consultasPorComerciante.get(row.comercianteId) ?? 0;
    if (!feriaAcc.has(row.feriaId)) {
      feriaAcc.set(row.feriaId, {
        consultas: 0,
        comerciantes: new Set(),
      });
    }
    const entry = feriaAcc.get(row.feriaId)!;
    entry.consultas += consultas;
    entry.comerciantes.add(row.comercianteId);
  }

  const feriaIds = [...feriaAcc.keys()];
  const ferias = await prisma.feria.findMany({
    where: { id: { in: feriaIds } },
    select: { id: true, nombre: true },
  });

  return ferias
    .map((f) => {
      const data = feriaAcc.get(f.id)!;
      return {
        id: f.id,
        nombre: f.nombre,
        consultas: data.consultas,
        comerciantes: data.comerciantes.size,
      };
    })
    .sort((a, b) => b.consultas - a.consultas)
    .slice(0, take);
}

async function getProductosCalientes(
  comercianteId?: string,
  take = 6
): Promise<ProductRank[]> {
  const where: Record<string, unknown> = { producto: { estado: "publicado" } };
  if (comercianteId) {
    where.producto = { ...(where.producto as object), comercianteId };
  }

  const grouped = await prisma.consulta.groupBy({
    by: ["productoId"],
    where: where as any,
    _count: { productoId: true },
    orderBy: { _count: { productoId: "desc" } },
    take,
  });

  if (grouped.length === 0) return [];

  const productIds = grouped.map((g) => g.productoId);
  const products = await prisma.producto.findMany({
    where: { id: { in: productIds } },
    include: {
      comerciante: { select: { nombre: true, slug: true } },
      categoria: { select: { nombre: true } },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  return grouped
    .map((g) => {
      const p = byId.get(g.productoId);
      if (!p) return null;
      return {
        id: p.id,
        titulo: p.titulo,
        slug: p.comerciante.slug,
        comercianteNombre: p.comerciante.nombre,
        categoriaNombre: p.categoria?.nombre ?? null,
        precio: p.precio,
        consultas: g._count.productoId,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

async function getProductosDemandaInsatisfecha(
  comercianteId?: string,
  take = 5
): Promise<ProductRank[]> {
  const where: Record<string, unknown> = {
    stock: 0,
    demandaPerdida: { gt: 0 },
  };
  if (comercianteId) {
    where.comercianteId = comercianteId;
  }

  const productos = await prisma.producto.findMany({
    where,
    include: {
      comerciante: { select: { nombre: true, slug: true } },
      categoria: { select: { nombre: true } },
    },
    orderBy: { demandaPerdida: "desc" },
    take,
  });

  return productos.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    slug: p.comerciante.slug,
    comercianteNombre: p.comerciante.nombre,
    categoriaNombre: p.categoria?.nombre ?? null,
    precio: p.precio,
    consultas: 0,
    demandaPerdida: p.demandaPerdida,
  }));
}

// ─── Page ────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  const isAdmin = session.rol === "admin";

  if (isAdmin) {
    const [
      totalProductos,
      productosPublicados,
      productosVendidos,
      totalComerciantes,
      totalFerias,
      totalConsultas,
      productosConTrueque,
      totalDemandaPerdida,
      ranking,
      topComerciantes,
      topFerias,
      calientes,
      demandaInsatisfecha,
    ] = await Promise.all([
      prisma.producto.count(),
      prisma.producto.count({ where: { estado: "publicado" } }),
      prisma.producto.count({ where: { estado: "vendido" } }),
      prisma.comerciante.count({ where: { activo: true } }),
      prisma.feria.count({ where: { activa: true } }),
      prisma.consulta.count(),
      prisma.producto.count({ where: { aceptaTrueque: true } }),
      prisma.producto.aggregate({
        _sum: { demandaPerdida: true },
        where: { demandaPerdida: { gt: 0 } },
      }),
      getTopConsultedProducts({ take: 5 }),
      getComerciantesTop(5),
      getFeriasTop(5),
      getProductosCalientes(undefined, 6),
      getProductosDemandaInsatisfecha(undefined, 5),
    ]);

    const tasaConversion =
      productosPublicados + productosVendidos > 0
        ? ((productosVendidos / (productosPublicados + productosVendidos)) * 100).toFixed(1)
        : "0.0";

    const cards = [
      { label: "Productos Totales", value: totalProductos, color: "text-primary" },
      { label: "Publicados", value: productosPublicados, color: "text-secondary" },
      { label: "Vendidos", value: productosVendidos, color: "text-on-surface" },
      { label: "Conversión", value: `${tasaConversion}%`, color: "text-primary" },
      { label: "Comerciantes", value: totalComerciantes, color: "text-secondary" },
      { label: "Ferias", value: totalFerias, color: "text-on-surface" },
      { label: "Consultas WhatsApp", value: totalConsultas, color: "text-primary" },
      { label: "Demanda Perdida", value: totalDemandaPerdida._sum.demandaPerdida ?? 0, color: "text-on-surface" },
      { label: "Aceptan Trueque", value: productosConTrueque, color: "text-secondary" },
    ];

    return (
      <DashboardContent
        cards={cards}
        isAdmin={true}
        ranking={ranking}
        topComerciantes={topComerciantes}
        topFerias={topFerias}
        calientes={calientes}
        demandaInsatisfecha={demandaInsatisfecha}
      />
    );
  }

  // ── Comerciante ────────────────────────────────────────────────
  if (!session.comercianteId) {
    return (
      <div className="card p-8 text-center">
        <p className="body-md text-on-surface-variant">
          Primero completá tu perfil de comerciante para ver estadísticas.
        </p>
        <a href="/admin/perfil" className="btn-primary mt-4 inline-flex">
          Completar perfil
        </a>
      </div>
    );
  }

  const comercianteId = session.comercianteId;

  const [
    totalProductos,
    productosPublicados,
    productosVendidos,
    totalConsultas,
    productosConTrueque,
    totalDemandaPerdida,
    ranking,
    calientes,
    demandaInsatisfecha,
  ] = await Promise.all([
    prisma.producto.count({ where: { comercianteId } }),
    prisma.producto.count({ where: { comercianteId, estado: "publicado" } }),
    prisma.producto.count({ where: { comercianteId, estado: "vendido" } }),
    prisma.consulta.count({ where: { producto: { comercianteId } } }),
    prisma.producto.count({ where: { comercianteId, aceptaTrueque: true } }),
    prisma.producto.aggregate({
      _sum: { demandaPerdida: true },
      where: { comercianteId, demandaPerdida: { gt: 0 } },
    }),
    getTopConsultedProducts({ comercianteId, take: 5 }),
    getProductosCalientes(comercianteId, 4),
    getProductosDemandaInsatisfecha(comercianteId, 4),
  ]);

  const tasaConversion =
    productosPublicados + productosVendidos > 0
      ? ((productosVendidos / (productosPublicados + productosVendidos)) * 100).toFixed(1)
      : "0.0";

  const cards = [
    { label: "Mis Productos", value: totalProductos, color: "text-primary" },
    { label: "Publicados", value: productosPublicados, color: "text-secondary" },
    { label: "Vendidos", value: productosVendidos, color: "text-on-surface" },
    { label: "Conversión", value: `${tasaConversion}%`, color: "text-primary" },
    { label: "Consultas", value: totalConsultas, color: "text-on-surface" },
    { label: "Demanda Perdida", value: totalDemandaPerdida._sum.demandaPerdida ?? 0, color: "text-on-surface" },
    { label: "Aceptan Trueque", value: productosConTrueque, color: "text-secondary" },
  ];

  return (
    <DashboardContent
      cards={cards}
      isAdmin={false}
      ranking={ranking}
      calientes={calientes}
      demandaInsatisfecha={demandaInsatisfecha}
    />
  );
}

// ─── Componente ──────────────────────────────────────────────────
function DashboardContent({
  cards,
  isAdmin,
  ranking,
  topComerciantes,
  topFerias,
  calientes,
  demandaInsatisfecha,
}: {
  cards: { label: string; value: string | number; color: string }[];
  isAdmin: boolean;
  ranking: ProductRank[];
  topComerciantes?: ComercianteRank[];
  topFerias?: FeriaRank[];
  calientes?: ProductRank[];
  demandaInsatisfecha?: ProductRank[];
}) {
  return (
    <div className="animate-fade-in">
      <h1 className="headline-lg text-on-surface">Panel</h1>
      <p className="mt-1 body-md text-on-surface-variant">
        {isAdmin
          ? "Panel de administración general"
          : "Tu panel de comerciante"}
      </p>

      {/* ── Tarjetas ──────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="mt-1 body-md text-on-surface-variant">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Acciones rápidas ──────────────────────────────────── */}
      <div className="mt-8">
        <h3 className="headline-md text-on-surface">Acciones rápidas</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <a href="/admin/productos/nuevo" className="btn-primary">
            + Nuevo producto
          </a>
          <a href="/admin/productos" className="btn-secondary">
            Gestionar productos
          </a>
          {!isAdmin && (
            <a href="/admin/qr" className="btn-outline">
              Mi QR
            </a>
          )}
          <a href="/admin/consultas" className="btn-outline">
            Ver consultas
          </a>
        </div>
      </div>

      {/* ── Productos más consultados ─────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="headline-md text-on-surface">
            Productos más consultados
          </h3>
          <Link
            href="/admin/consultas"
            className="label-sm text-primary no-underline hover:underline"
          >
            Ver detalle
          </Link>
        </div>

        {ranking.length === 0 ? (
          <div className="card mt-3 p-4">
            <p className="body-md text-on-surface-variant">
              Todavía no hay consultas registradas.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {ranking.map((product, index) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="card-pressable flex items-center justify-between gap-3 p-4 no-underline"
              >
                <div>
                  <p className="label-sm text-secondary">#{index + 1}</p>
                  <h4 className="font-semibold text-on-surface">
                    {product.titulo}
                  </h4>
                  <p className="label-sm text-on-surface-variant">
                    {product.comercianteNombre}
                    {product.categoriaNombre
                      ? ` · ${product.categoriaNombre}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="price-chip inline-flex">
                    $ {product.precio.toLocaleString("es-AR")}
                  </p>
                  <p className="mt-2 label-sm text-on-surface-variant">
                    {product.consultas} consultas
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Productos calientes (consultados, sin vender) ─────── */}
      {calientes && calientes.length > 0 && (
        <div className="mt-8">
          <h3 className="headline-md text-on-surface">🔥 Productos calientes</h3>
          <p className="mt-1 body-md text-on-surface-variant">
            Los más consultados que todavía no se vendieron.
          </p>

          <div className="mt-3 space-y-3">
            {calientes.map((product, index) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="card-pressable flex items-center justify-between gap-3 p-4 no-underline"
              >
                <div>
                  <p className="label-sm text-primary">#{index + 1}</p>
                  <h4 className="font-semibold text-on-surface">
                    {product.titulo}
                  </h4>
                  <p className="label-sm text-on-surface-variant">
                    {product.comercianteNombre}
                    {product.categoriaNombre
                      ? ` · ${product.categoriaNombre}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="price-chip inline-flex">
                    $ {product.precio.toLocaleString("es-AR")}
                  </p>
                  <p className="mt-2 label-sm text-primary">
                    {product.consultas} consultas · Sin vender
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Demanda insatisfecha (sin stock, con consultas) ────── */}
      {demandaInsatisfecha && demandaInsatisfecha.length > 0 && (
        <div className="mt-8">
          <h3 className="headline-md text-on-surface">
            🚫 Demanda insatisfecha
          </h3>
          <p className="mt-1 body-md text-on-surface-variant">
            Productos sin stock que la gente sigue buscando.
          </p>

          <div className="mt-3 space-y-3">
            {demandaInsatisfecha.map((product, index) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="card-pressable flex items-center justify-between gap-3 p-4 no-underline"
              >
                <div>
                  <p className="label-sm text-primary">#{index + 1}</p>
                  <h4 className="font-semibold text-on-surface">
                    {product.titulo}
                  </h4>
                  <p className="label-sm text-on-surface-variant">
                    {product.comercianteNombre}
                    {product.categoriaNombre
                      ? ` · ${product.categoriaNombre}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="price-chip inline-flex">
                    $ {product.precio.toLocaleString("es-AR")}
                  </p>
                  <p className="mt-2 label-sm" style={{ color: "var(--color-error)" }}>
                    {product.demandaPerdida} persona{product.demandaPerdida !== 1 ? "s" : ""} buscando
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Top comerciantes (admin) ──────────────────────────── */}
      {isAdmin && topComerciantes && topComerciantes.length > 0 && (
        <div className="mt-8">
          <h3 className="headline-md text-on-surface">
            Comerciantes con más consultas
          </h3>

          <div className="mt-3 space-y-3">
            {topComerciantes.map((c, index) => (
              <Link
                key={c.id}
                href={`/comerciantes/${c.slug}`}
                className="card-pressable flex items-center justify-between gap-3 p-4 no-underline"
              >
                <div>
                  <p className="label-sm text-secondary">#{index + 1}</p>
                  <h4 className="font-semibold text-on-surface">{c.nombre}</h4>
                  <p className="label-sm text-on-surface-variant">
                    {c.productos} productos publicados
                  </p>
                </div>
                <div className="text-right">
                  <p className="label-sm font-bold text-primary text-lg">
                    {c.consultas}
                  </p>
                  <p className="label-sm text-on-surface-variant">consultas</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Top ferias (admin) ────────────────────────────────── */}
      {isAdmin && topFerias && topFerias.length > 0 && (
        <div className="mt-8">
          <h3 className="headline-md text-on-surface">
            Ferias con más consultas
          </h3>

          <div className="mt-3 space-y-3">
            {topFerias.map((f, index) => (
              <div
                key={f.id}
                className="card flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="label-sm text-secondary">#{index + 1}</p>
                  <h4 className="font-semibold text-on-surface">{f.nombre}</h4>
                  <p className="label-sm text-on-surface-variant">
                    {f.comerciantes} comerciantes
                  </p>
                </div>
                <div className="text-right">
                  <p className="label-sm font-bold text-secondary text-lg">
                    {f.consultas}
                  </p>
                  <p className="label-sm text-on-surface-variant">consultas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
