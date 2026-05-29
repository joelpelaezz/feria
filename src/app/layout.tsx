import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "FerIA — Catálogo Social de Ferias de Palpalá",
    template: "%s | FerIA",
  },
  description:
    "Encontrá productos locales en las ferias de Palpalá, Jujuy. Conectate con comerciantes y descubrí lo mejor de tu comunidad.",
  applicationName: "FerIA",
  authors: [{ name: "FerIA" }],
  generator: "Next.js",
  keywords: [
    "ferias",
    "Palpalá",
    "Jujuy",
    "productos locales",
    "comerciantes",
    "trueque",
    "catálogo social",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "FerIA",
    title: "FerIA — Catálogo Social de Ferias de Palpalá",
    description:
      "Encontrá productos locales en las ferias de Palpalá, Jujuy. Conectate con comerciantes y descubrí lo mejor de tu comunidad.",
    url: baseUrl,
    images: [
      {
        url: `${baseUrl}/icons/icon-512.svg`,
        width: 512,
        height: 512,
        alt: "FerIA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FerIA — Catálogo Social de Ferias de Palpalá",
    description:
      "Encontrá productos locales en las ferias de Palpalá, Jujuy. Conectate con comerciantes y descubrí lo mejor de tu comunidad.",
    images: [`${baseUrl}/icons/icon-512.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${lexend.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-on-surface antialiased">
        <PwaRegister />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 md:pb-8">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
