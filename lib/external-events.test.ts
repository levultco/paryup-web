import { describe, expect, test } from "bun:test";
import { describeListCondition, externalPrice, externalWhen, rateStatus } from "./external-events";

const info = {
  timezone: "Europe/Madrid",
  displayDateRaw: "2027-03-06",
  currency: "EUR",
  fromPrice: 15,
  hasAvailableRates: true,
};

describe("eventos Fourvenues en la web", () => {
  test("el día es display_date y las horas van en la zona del local", () => {
    const w = externalWhen(
      "2027-03-06T22:30:00.000Z",
      "2027-03-07T05:00:00.000Z",
      info,
      "es",
      2027,
    );
    expect(w.dayKey).toBe("2027-03-06");
    expect(w.start).toBe("23:30");
    expect(w.end).toBe("06:00");
    expect(w.endsNextDay).toBe(true);
  });

  test("otra zona horaria cambia las horas", () => {
    const w = externalWhen(
      "2027-03-06T22:30:00.000Z",
      null,
      { ...info, timezone: "Atlantic/Canary" },
      "es",
    );
    expect(w.start).toBe("22:30");
    expect(w.end).toBeNull();
  });

  test("sin display_date usa el día del inicio en la zona del local", () => {
    const w = externalWhen(
      "2027-03-06T23:30:00.000Z",
      null,
      { timezone: "Europe/Madrid", displayDateRaw: null },
      "en",
    );
    expect(w.dayKey).toBe("2027-03-07"); // 00:30 del domingo en Madrid
  });

  test("una zona inválida no lanza", () => {
    expect(() =>
      externalWhen("2027-03-06T22:30:00.000Z", null, { ...info, timezone: "No/Zone" }, "es"),
    ).not.toThrow();
  });

  test("precio desde / sin entradas / desconocido", () => {
    expect(externalPrice(info, "es")?.replace(/\s/g, " ")).toBe("Desde 15 €");
    expect(externalPrice({ ...info, fromPrice: null, hasAvailableRates: false }, "en")).toBe(
      "No tickets on sale",
    );
    expect(externalPrice({ ...info, fromPrice: null, hasAvailableRates: null }, "es")).toBeNull();
    expect(externalPrice(null, "es")).toBeNull();
  });

  test("estado de tarifa", () => {
    const base = { id: "t", name: "G", validFrom: null, price: 10 };
    expect(rateStatus({ ...base, onSale: true, soldOut: false }, "es")).toBe("A la venta");
    expect(rateStatus({ ...base, onSale: false, soldOut: true }, "en")).toBe("Sold out");
    expect(rateStatus({ ...base, onSale: false, soldOut: false }, "es")).toBe("No disponible");
    expect(
      rateStatus({ ...base, onSale: false, soldOut: false, validFrom: "2099-01-01T00:00:00Z" }, "es"),
    ).toBe("Próximamente");
  });

  test("condiciones de lista legibles en ambos idiomas", () => {
    const c = { men: 10, women: 0, age: 18, from: "23:00" };
    expect(describeListCondition(c, "EUR", "es").replace(/\s/g, " ")).toBe(
      "Hombres: 10 € · Mujeres: gratis · Edad mínima: 18 · Desde: 23:00",
    );
    expect(describeListCondition(c, "EUR", "en")).toContain("Women: free");
    expect(describeListCondition({ extra: "x", vacio: "" }, null, "es")).toBe("extra: x");
  });
});
