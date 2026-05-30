import { describe, it, expect, beforeEach } from "vitest";
import { getBaseUrl, getMerchantProfileUrl } from "@/lib/site";

const ORIGINAL_ENV = process.env;

describe("getBaseUrl", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  it("devuelve el fallback si no hay env var", () => {
    expect(getBaseUrl()).toBe("http://localhost:3004");
  });

  it("devuelve NEXT_PUBLIC_BASE_URL si está configurada", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://feria-palpala.vercel.app";
    expect(getBaseUrl()).toBe("https://feria-palpala.vercel.app");
  });

  it("funciona con dominio personalizado", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://feria.palpala.com.ar";
    expect(getBaseUrl()).toBe("https://feria.palpala.com.ar");
  });
});

describe("getMerchantProfileUrl", () => {
  it("genera URL correcta con slug", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://feria-palpala.vercel.app";
    expect(getMerchantProfileUrl("elena-rodriguez")).toBe(
      "https://feria-palpala.vercel.app/comerciantes/elena-rodriguez"
    );
  });

  it("funciona con slug que tiene números", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3004";
    expect(getMerchantProfileUrl("don-jorge-123")).toBe(
      "http://localhost:3004/comerciantes/don-jorge-123"
    );
  });
});
