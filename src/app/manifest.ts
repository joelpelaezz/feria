import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004";

  const icons: MetadataRoute.Manifest["icons"] = [
    {
      src: `${baseUrl}/icons/icon-192.svg`,
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any",
    },
    {
      src: `${baseUrl}/icons/icon-512.svg`,
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any",
    },
  ];

  return {
    name: "FerIA — Catálogo Social de Ferias de Palpalá",
    short_name: "FerIA",
    description:
      "Encontrá productos locales en las ferias de Palpalá, Jujuy. Conectate con comerciantes y descubrí lo mejor de tu comunidad.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#a63416",
    orientation: "portrait-primary",
    icons,
    categories: ["shopping", "local", "community"],
    lang: "es-AR",
    scope: "/",
  };
}
