export function parseProductPhotos(fotos?: string | null): string[] {
  if (!fotos) return [];

  try {
    const parsed = JSON.parse(fotos);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

export function getPrimaryProductPhoto(fotos?: string | null) {
  return parseProductPhotos(fotos)[0] ?? null;
}
