import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // Obtener datos para el menú
  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId },
    select: { nombre: true, rol: true },
  });

  if (!usuario) redirect("/auth/login");

  const isAdmin = usuario.rol === "admin";

  return (
    <div className="animate-fade-in">
      {/* Header del admin */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="headline-md text-on-surface">
            Panel de {usuario.nombre}
          </h2>
          <p className="body-md text-on-surface-variant">
            {isAdmin ? "Administración general del sistema" : "Gestión de tu catálogo"}
          </p>
        </div>
        <Link
          href="/"
          className="label-sm font-medium text-primary no-underline hover:underline"
        >
          ← Ver sitio público
        </Link>
      </div>

      {/* Navegación admin tipo pills */}
      <nav className="mb-6 flex flex-wrap gap-2">
        <AdminLink href="/admin/dashboard" label="Dashboard" />
        <AdminLink href="/admin/productos" label="Productos" />
        <AdminLink href="/admin/consultas" label="Consultas" />
        <AdminLink href="/admin/perfil" label="Mi Perfil" />
        <AdminLink href="/admin/qr" label="QR" />
        {isAdmin && (
          <>
            <AdminLink href="/admin/usuarios" label="Usuarios" />
            <AdminLink href="/admin/categorias" label="Categorías" />
            <AdminLink href="/admin/ferias" label="Ferias" />
          </>
        )}
      </nav>

      {/* Contenido */}
      {children}
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="filter-pill"
    >
      {label}
    </Link>
  );
}
