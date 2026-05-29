import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PerfilForm } from "./PerfilForm";

export default async function AdminPerfilPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");

  const isAdmin = session.rol === "admin";

  if (isAdmin) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.userId },
      select: { nombre: true, telefono: true, rol: true },
    });
    if (!usuario) redirect("/auth/login");

    return (
      <div className="max-w-xl animate-fade-in">
        <h1 className="headline-md mb-6 text-on-surface">Mi Perfil</h1>
        <div className="card p-6 space-y-4">
          <div>
            <p className="label-sm text-on-surface-variant">Nombre</p>
            <p className="font-medium text-on-surface">{usuario.nombre}</p>
          </div>
          <div>
            <p className="label-sm text-on-surface-variant">Teléfono</p>
            <p className="font-medium text-on-surface">{usuario.telefono}</p>
          </div>
          <div>
            <p className="label-sm text-on-surface-variant">Rol</p>
            <p className="font-medium text-on-surface capitalize">{usuario.rol}</p>
          </div>
        </div>
      </div>
    );
  }

  // Comerciante: obtener perfil completo
  const comerciante = await prisma.comerciante.findUnique({
    where: { usuarioId: session.userId },
    include: {
      ferias: {
        include: { feria: { select: { id: true, nombre: true } } },
      },
      usuario: { select: { telefono: true } },
    },
  });

  const feriasDisponibles = await prisma.feria.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="max-w-xl animate-fade-in">
      <h1 className="headline-md mb-6 text-on-surface">Mi Perfil</h1>
      <PerfilForm
        initialData={
          comerciante
            ? {
                nombre: comerciante.nombre,
                descripcion: comerciante.descripcion ?? "",
                whatsapp: comerciante.whatsapp,
                tipoUbicacion: comerciante.tipoUbicacion,
                ubicacion: comerciante.ubicacion ?? "",
                dias: comerciante.dias ?? "",
                horario: comerciante.horario ?? "",
                fotoPerfil: comerciante.fotoPerfil ?? "",
              }
            : undefined
        }
        feriasDisponibles={feriasDisponibles}
        feriasActuales={comerciante?.ferias.map((cf) => cf.feriaId) ?? []}
        telefono={comerciante?.usuario.telefono ?? ""}
      />
    </div>
  );
}
