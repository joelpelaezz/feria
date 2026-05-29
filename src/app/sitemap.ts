import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004";

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ferias`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/impacto`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/trueque`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Productos dinámicos
  const productos = await prisma.producto.findMany({
    where: { publicado: true, estado: "publicado" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const productPages: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${baseUrl}/productos/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // Comerciantes dinámicos
  const comerciantes = await prisma.comerciante.findMany({
    where: { activo: true },
    select: { slug: true, updatedAt: true },
  });

  const comerciantePages: MetadataRoute.Sitemap = comerciantes.map((c) => ({
    url: `${baseUrl}/comerciantes/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...comerciantePages];
}
