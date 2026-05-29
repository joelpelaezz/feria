import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 bg-surface border-b backdrop-blur-sm" style={{ borderColor: "rgba(63,102,83,0.1)" }}>
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="headline-sm tracking-tight text-primary">
            Fer<span className="text-secondary">IA</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/ferias"
            className="label-sm text-on-surface-variant transition-colors hover:text-primary no-underline"
          >
            Ferias
          </Link>
          <Link
            href="/productos"
            className="label-sm text-on-surface-variant transition-colors hover:text-primary no-underline"
          >
            Productos
          </Link>
          <Link
            href="/impacto"
            className="label-sm text-on-surface-variant transition-colors hover:text-primary no-underline"
          >
            Impacto
          </Link>
          {session ? (
            <>
              <Link
                href="/admin/dashboard"
                className="label-sm text-secondary transition-colors hover:text-primary no-underline"
              >
                Panel
              </Link>
              <Link
                href="/auth/logout"
                className="btn-secondary"
              >
                Salir
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="btn-primary"
            >
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
