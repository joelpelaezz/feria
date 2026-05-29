import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ToggleActivoButton } from "@/components/admin/ToggleActivoButton";
import { ResetPinButton } from "@/components/admin/ResetPinButton";

export default async function AdminUsuariosPage() {
  const session = await requireAdmin();
  if (!session) redirect("/auth/login");

  // Obtener todos los comerciantes con sus stats
  const usuarios = await prisma.usuario.findMany({
    where: { rol: "comerciante" },
    include: {
      comerciante: {
        include: {
          _count: { select: { productos: true } },
          ferias: {
            include: { feria: { select: { id: true, nombre: true } } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Obtener consultas por comerciante
  const consultasPorComerciante = new Map<string, number>();

  // Traer todos los productos con su comercianteId para mapear consultas
  const productos = await prisma.producto.findMany({
    select: { id: true, comercianteId: true },
  });

  const productoComerciante = new Map(
    productos.map((p) => [p.id, p.comercianteId])
  );

  const consultasGrouped = await prisma.consulta.groupBy({
    by: ["productoId"],
    _count: { productoId: true },
  });

  for (const c of consultasGrouped) {
    const cId = productoComerciante.get(c.productoId);
    if (cId) {
      consultasPorComerciante.set(
        cId,
        (consultasPorComerciante.get(cId) ?? 0) + c._count.productoId
      );
    }
  }

  // Obtener últimos updatedAt de productos por comerciante
  const ultimosProductos = await prisma.producto.groupBy({
    by: ["comercianteId"],
    _max: { updatedAt: true },
  });
  const ultimaActividad = new Map(
    ultimosProductos.map((p) => [p.comercianteId, p._max.updatedAt])
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="headline-md text-on-surface">Usuarios</h1>
        <span
          className="rounded-full px-2.5 py-0.5 label-sm text-on-surface-variant"
          style={{ backgroundColor: "var(--color-surface-container-high)" }}
        >
          {usuarios.length}
        </span>
      </div>

      {usuarios.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-12 text-center"
          style={{
            borderColor: "rgba(63,102,83,0.2)",
            backgroundColor: "var(--color-surface-container-low)",
          }}
        >
          <p className="headline-md text-on-surface-variant">
            No hay comerciantes registrados
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map((usuario) => {
            const comerciante = usuario.comerciante;
            const consultas = comerciante
              ? consultasPorComerciante.get(comerciante.id) ?? 0
              : 0;
            const ultimaAct = comerciante
              ? ultimaActividad.get(comerciante.id) ?? usuario.updatedAt
              : usuario.updatedAt;

            return (
              <div
                key={usuario.id}
                className={`card p-4 ${
                  !usuario.activo ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Info principal */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-on-surface truncate">
                        {comerciante?.nombre ?? usuario.nombre ?? "Sin nombre"}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 label-sm font-medium ${
                          usuario.activo
                            ? "bg-secondary/20 text-secondary"
                            : "text-on-surface-variant"
                        }`}
                        style={
                          !usuario.activo
                            ? { backgroundColor: "var(--color-surface-container-high)" }
                            : {}
                        }
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="mt-1 label-sm text-on-surface-variant">
                      📱 {usuario.telefono}
                    </p>

                    {comerciante && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 label-sm text-on-surface-variant">
                        <span>
                          📦 {comerciante._count.productos} productos
                        </span>
                        <span>💬 {consultas} consultas</span>
                        {comerciante.ferias.length > 0 && (
                          <span>
                            🏪{" "}
                            {comerciante.ferias
                              .map((cf) => cf.feria.nombre)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="mt-1 label-sm text-on-surface-variant">
                      Última actividad:{" "}
                      {new Date(ultimaAct).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {comerciante && (
                      <Link
                        href={`/comerciantes/${comerciante.slug}`}
                        className="inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 label-sm font-medium transition-colors"
                        style={{
                          backgroundColor: "var(--color-surface-container-high)",
                          color: "var(--color-primary)",
                        }}
                      >
                        Perfil público
                      </Link>
                    )}
                    <ToggleActivoButton
                      usuarioId={usuario.id}
                      activo={usuario.activo}
                    />
                    <ResetPinButton usuarioId={usuario.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
