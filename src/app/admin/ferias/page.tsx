import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { FeriaManager } from "./FeriaManager";

export default async function AdminFeriasPage() {
  const session = await requireAdmin();
  if (!session) redirect("/auth/login");

  const ferias = await prisma.feria.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      direccion: true,
      lat: true,
      lng: true,
      dias: true,
      horario: true,
      activa: true,
      _count: { select: { comerciantes: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="headline-md text-on-surface">Ferias</h1>
        <span
          className="rounded-full px-2.5 py-0.5 label-sm text-on-surface-variant"
          style={{ backgroundColor: "var(--color-surface-container-high)" }}
        >
          {ferias.length}
        </span>
      </div>

      <FeriaManager ferias={ferias} />
    </div>
  );
}
