import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (vi.hoisted porque vi.mock se hoistean al tope) ──

const { mockToken, MockSignJWT } = vi.hoisted(() => {
  const mockToken = "mocked.jwt.token";

  class MockSignJWT {
    constructor(_payload: Record<string, unknown>) {}
    setProtectedHeader = vi.fn().mockReturnThis();
    setIssuedAt = vi.fn().mockReturnThis();
    setExpirationTime = vi.fn().mockReturnThis();
    sign = vi.fn().mockResolvedValue(mockToken);
  }

  return { mockToken, MockSignJWT };
});

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn((pin: string) => Promise.resolve(`hashed_${pin}`)),
    compare: vi.fn((pin: string, hash: string) =>
      Promise.resolve(hash === `hashed_${pin}`)
    ),
  },
  hash: vi.fn((pin: string) => Promise.resolve(`hashed_${pin}`)),
  compare: vi.fn((pin: string, hash: string) =>
    Promise.resolve(hash === `hashed_${pin}`)
  ),
}));

vi.mock("jose", () => ({
  SignJWT: MockSignJWT,
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { userId: "user-123", rol: "admin" },
  }),
}));

import { hashPin, verifyPin, createSession, getSession, destroySession } from "@/lib/auth";

// ── Tests ──────────────────────────────────────────────

describe("hashPin / verifyPin", () => {
  it("hashea un PIN y lo verifica correctamente", async () => {
    const hash = await hashPin("123456");
    expect(hash).toBe("hashed_123456");

    const ok = await verifyPin("123456", hash);
    expect(ok).toBe(true);
  });

  it("rechaza un PIN incorrecto", async () => {
    const hash = await hashPin("123456");
    const ok = await verifyPin("000000", hash);
    expect(ok).toBe(false);
  });
});

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("setea la cookie con httpOnly y secure en production", async () => {
    process.env.NODE_ENV = "production";
    await createSession("user-123", "admin");

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "feria_session",
      mockToken,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      })
    );
  });

  it("setea secure=false en desarrollo", async () => {
    process.env.NODE_ENV = "development";
    await createSession("user-456", "comerciante");

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "feria_session",
      mockToken,
      expect.objectContaining({ secure: false })
    );
  });

  it("setea maxAge a 7 días", async () => {
    process.env.NODE_ENV = "development";
    await createSession("user-789", "admin");

    const callArgs = mockCookieStore.set.mock.calls[0][2];
    expect(callArgs.maxAge).toBe(60 * 60 * 24 * 7);
  });
});

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve null si no hay cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const session = await getSession();
    expect(session).toBeNull();
  });

  it("devuelve null si el token es inválido", async () => {
    mockCookieStore.get.mockReturnValue({ value: "invalid-token" });

    const { jwtVerify } = await import("jose");
    (jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("bad token"));

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("devuelve los datos de sesión si el token es válido", async () => {
    mockCookieStore.get.mockReturnValue({ value: "valid-token" });

    const session = await getSession();
    expect(session).toEqual({ userId: "user-123", rol: "admin" });
  });
});

describe("destroySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina la cookie de sesión", async () => {
    await destroySession();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("feria_session");
  });
});
