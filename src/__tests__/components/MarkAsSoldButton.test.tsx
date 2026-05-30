import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ refresh: mockRefresh })),
}));

import { MarkAsSoldButton } from "@/components/admin/MarkAsSoldButton";

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn();
});

describe("MarkAsSoldButton", () => {
  it('muestra "Sin stock" si stock <= 0', () => {
    render(<MarkAsSoldButton productId="prod-1" stock={0} />);
    expect(screen.getByText("Sin stock")).toBeDefined();
  });

  it("muestra el botón con texto Vender 1 si hay stock", () => {
    render(<MarkAsSoldButton productId="prod-1" stock={3} />);
    expect(screen.getByText("Vender 1")).toBeDefined();
  });

  it("muestra ¿Seguro? tras el primer click", async () => {
    const user = userEvent.setup();
    render(<MarkAsSoldButton productId="prod-1" stock={2} />);

    await user.click(screen.getByText("Vender 1"));
    expect(screen.getByText("¿Seguro?")).toBeDefined();
  });

  it("llama al API en el segundo click", async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    globalThis.fetch = mockFetch;

    render(<MarkAsSoldButton productId="prod-456" stock={5} />);

    await user.click(screen.getByText("Vender 1"));
    await user.click(screen.getByText("¿Seguro?"));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/admin/productos/prod-456/vender",
      { method: "POST" }
    );
  });

  it("refresca la página tras vender exitosamente", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    render(<MarkAsSoldButton productId="prod-1" stock={1} />);
    await user.click(screen.getByText("Vender 1"));
    await user.click(screen.getByText("¿Seguro?"));

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("muestra ✓ Vendido cuando se completó", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    render(<MarkAsSoldButton productId="prod-1" stock={1} />);
    await user.click(screen.getByText("Vender 1"));
    await user.click(screen.getByText("¿Seguro?"));

    expect(await screen.findByText("✓ Vendido")).toBeDefined();
  });
});
