import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export type AdminSession = {
  userId: string;
  rol: string;
  comercianteId?: string;
  nombre?: string;
};

/**
 * Verifica sesión y redirige a login si no está autenticado.
 * Para SERVER COMPONENTS (pages).
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return session;
}

/**
 * Verifica sesión y que el usuario tenga rol admin.
 * Para SERVER COMPONENTS.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.rol !== "admin") redirect("/admin/dashboard");
  return session;
}

/**
 * Obtiene sesión completa con datos del comerciante (si aplica).
 * Para SERVER COMPONENTS.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getSession();
  if (!session) return null;

  const base: AdminSession = { userId: session.userId, rol: session.rol };

  if (session.rol === "comerciante" || session.rol === "cargador") {
    const comerciante = await prisma.comerciante.findUnique({
      where: { usuarioId: session.userId },
      select: { id: true, nombre: true },
    });
    if (comerciante) {
      base.comercianteId = comerciante.id;
      base.nombre = comerciante.nombre;
    }
  } else if (session.rol === "admin") {
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.userId },
      select: { nombre: true },
    });
    base.nombre = usuario?.nombre ?? "Admin";
  }

  return base;
}

/**
 * Para API ROUTES: verifica sesión, devuelve 401 si no autenticado.
 */
export async function apiAuth() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  return session;
}

/**
 * Para API ROUTES: verifica que el usuario pueda operar sobre un producto.
 * El admin puede operar sobre cualquier producto.
 * El comerciante solo sobre sus propios productos.
 */
export async function canManageProducto(productoId: string, session: { userId: string; rol: string }) {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: {
      comerciante: {
        select: { usuarioId: true },
      },
    },
  });

  if (!producto) return null;
  if (session.rol === "admin") return true;

  // comerciante o cargador: solo si es dueño
  if (producto.comerciante.usuarioId === session.userId) return true;

  return false;
}
