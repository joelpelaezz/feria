import type { Metadata } from "next";
import RegistroPageClient from "./RegistroPageClient";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Registrá tu negocio en FerIA gratis y empezá a vender en las ferias de Palpalá.",
  robots: { index: false, follow: false },
};

export default function RegistroPage() {
  return <RegistroPageClient />;
}
