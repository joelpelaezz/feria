import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impacto Social",
  description:
    "Conocé el impacto de FerIA en la comunidad de Palpalá: comerciantes activos, productos publicados, ferias registradas y consultas generadas.",
  openGraph: {
    title: "Impacto Social | FerIA",
    description: "El impacto de FerIA en la comunidad de Palpalá.",
  },
};

export default async function ImpactoPage() {
  const [comerciantesActivos, productosPublicados, feriasRegistradas, consultasWhatsApp] =
    await Promise.all([
      prisma.comerciante.count({ where: { activo: { not: false } } }),
      prisma.producto.count(),
      prisma.feria.count(),
      prisma.consulta.count(),
    ]);

  const stats = [
    {
      label: "Comerciantes activos",
      value: comerciantesActivos,
      color: "text-primary",
      icon: "👥",
    },
    {
      label: "Productos publicados",
      value: productosPublicados,
      color: "text-secondary",
      icon: "📦",
    },
    {
      label: "Ferias registradas",
      value: feriasRegistradas,
      color: "text-primary",
      icon: "🏪",
    },
    {
      label: "Consultas por WhatsApp",
      value: consultasWhatsApp,
      color: "text-secondary",
      icon: "💬",
    },
  ];

  const steps = [
    {
      icon: "📸",
      title: "Los comerciantes registran sus productos",
      description:
        "Suben fotos, precios y descripción. En minutos su catálogo está online.",
    },
    {
      icon: "🔍",
      title: "Los compradores buscan y contactan",
      description:
        "Encontrás productos cerca, ves los detalles y contactás directo por WhatsApp.",
    },
    {
      icon: "🤝",
      title: "Todos ganan",
      description:
        "Más visibilidad para los feriantes, menos vueltas para los compradores, más comunidad.",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="headline-lg text-on-surface">Impacto Social</h1>
        <p className="mt-2 body-md text-on-surface-variant">
          FerIA conecta compradores con los comerciantes de las ferias de
          Palpalá. Esto es lo que estamos construyendo juntos.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card p-6 text-center"
          >
            <span className="text-3xl">{stat.icon}</span>
            <p className={`mt-2 text-4xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className={`mt-1 body-md ${stat.color}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-12">
        <h2 className="headline-md text-on-surface">
          ¿Cómo funciona FerIA?
        </h2>
        <div className="mt-6 space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: "var(--color-surface-container-low)" }}
              >
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">{step.title}</h3>
                <p className="mt-1 body-md text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
