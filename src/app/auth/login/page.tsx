import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accedé a tu panel de comerciante en FerIA con tu teléfono y PIN.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
