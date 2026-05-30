import { describe, it, expect } from "vitest";
import { parseProductPhotos, getPrimaryProductPhoto } from "@/lib/product-images";

describe("parseProductPhotos", () => {
  it("devuelve array vacío si fotos es null", () => {
    expect(parseProductPhotos(null)).toEqual([]);
  });

  it("devuelve array vacío si fotos es undefined", () => {
    expect(parseProductPhotos(undefined)).toEqual([]);
  });

  it("devuelve array vacío si fotos es string vacío", () => {
    expect(parseProductPhotos("")).toEqual([]);
  });

  it("devuelve array vacío si fotos es JSON inválido", () => {
    expect(parseProductPhotos("{mal formado")).toEqual([]);
  });

  it("devuelve array vacío si el JSON no es un array", () => {
    expect(parseProductPhotos('{"objeto":"no array"}')).toEqual([]);
  });

  it("parsea un array de URLs correctamente", () => {
    const fotos = '["/uploads/a.jpg", "/uploads/b.jpg"]';
    expect(parseProductPhotos(fotos)).toEqual(["/uploads/a.jpg", "/uploads/b.jpg"]);
  });

  it("filtra strings vacíos del array", () => {
    const fotos = '["/uploads/a.jpg", "", "/uploads/b.jpg"]';
    expect(parseProductPhotos(fotos)).toEqual(["/uploads/a.jpg", "/uploads/b.jpg"]);
  });

  it("filtra valores que no son strings", () => {
    const fotos = '["/uploads/a.jpg", 123, null, "/uploads/b.jpg"]';
    expect(parseProductPhotos(fotos)).toEqual(["/uploads/a.jpg", "/uploads/b.jpg"]);
  });

  it("maneja URLs de Blob correctamente", () => {
    const fotos = JSON.stringify([
      "https://mtryb5xcwwqvz1lx.public.blob.vercel-storage.com/productos/abc.png",
      "/uploads/local.jpg",
    ]);
    const result = parseProductPhotos(fotos);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain("blob.vercel-storage.com");
  });

  it("devuelve array vacío para array vacío en JSON", () => {
    expect(parseProductPhotos("[]")).toEqual([]);
  });
});

describe("getPrimaryProductPhoto", () => {
  it("devuelve null si no hay fotos (null)", () => {
    expect(getPrimaryProductPhoto(null)).toBeNull();
  });

  it("devuelve null si no hay fotos (undefined)", () => {
    expect(getPrimaryProductPhoto(undefined)).toBeNull();
  });

  it("devuelve null si el array está vacío", () => {
    expect(getPrimaryProductPhoto("[]")).toBeNull();
  });

  it("devuelve la primera foto", () => {
    const fotos = '["/uploads/primera.jpg", "/uploads/segunda.jpg"]';
    expect(getPrimaryProductPhoto(fotos)).toBe("/uploads/primera.jpg");
  });

  it("devuelve null si todos los elementos son strings vacíos", () => {
    expect(getPrimaryProductPhoto('[""]')).toBeNull();
  });
});
