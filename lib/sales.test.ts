import { describe, expect, test } from "bun:test";
import { buildSalesSeries, formatMoney } from "./sales";

describe("formatMoney", () => {
  test("convierte céntimos a euros", () => {
    expect(formatMoney(1050, "EUR", "en-US")).toBe("€10.50");
    expect(formatMoney(0, "EUR", "en-US")).toBe("€0.00");
  });
});

describe("buildSalesSeries", () => {
  const days = [
    { date: "2026-10-10", tickets: 2, amount: 4000 },
    { date: "2026-10-13", tickets: 1, amount: 2000 },
  ];
  test("rellena huecos y acumula hasta hoy", () => {
    const s = buildSalesSeries(days, "2026-10-14", null);
    expect(s.map((p) => p.date)).toEqual([
      "2026-10-10",
      "2026-10-11",
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
    ]);
    expect(s.map((p) => p.cumTickets)).toEqual([2, 2, 2, 3, 3]);
    expect(s[4].cumAmount).toBe(6000);
  });
  test("la ventana recorta pero conserva el acumulado real", () => {
    const s = buildSalesSeries(days, "2026-10-14", 2);
    expect(s).toHaveLength(2);
    expect(s[0].cumTickets).toBe(3);
  });
  test("sin ventas no hay serie", () => {
    expect(buildSalesSeries([], "2026-10-14", 7)).toEqual([]);
  });
});
