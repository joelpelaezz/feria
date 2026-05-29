export function Footer() {
  return (
    <footer className="mt-auto border-t bg-surface-container-low" style={{ borderColor: "rgba(63,102,83,0.1)" }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Marca */}
          <div>
            <span className="headline-sm tracking-tight text-primary">
              Fer<span className="text-secondary">IA</span>
            </span>
            <p className="mt-3 body-md text-on-surface-variant">
              Catálogo social de ferias y comerciantes de Palpalá, Jujuy.
              Conectamos compradores con productos locales.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 label-lg text-on-surface">
              Navegación
            </h4>
            <ul className="space-y-3 body-md text-on-surface-variant">
              <li>
                <a href="/ferias" className="no-underline transition-colors hover:text-primary">
                  Ferias
                </a>
              </li>
              <li>
                <a href="/productos" className="no-underline transition-colors hover:text-primary">
                  Productos
                </a>
              </li>
              <li>
                <a href="/impacto" className="no-underline transition-colors hover:text-primary">
                  Impacto Social
                </a>
              </li>
              <li>
                <a href="/trueque" className="no-underline transition-colors hover:text-primary">
                  Trueque
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-3 label-lg text-on-surface">
              Para comerciantes
            </h4>
            <ul className="space-y-3 body-md text-on-surface-variant">
              <li>
                <a href="/auth/login" className="no-underline transition-colors hover:text-primary">
                  Iniciar sesión
                </a>
              </li>
              <li>
                <a href="/auth/registro" className="no-underline transition-colors hover:text-primary">
                  Registrarse
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center label-sm text-on-surface-variant" style={{ borderColor: "rgba(63,102,83,0.1)" }}>
          © {new Date().getFullYear()} FerIA — Hecho con ❤️ para Palpalá
        </div>
      </div>
    </footer>
  );
}
