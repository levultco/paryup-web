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

  test("estado de tarifa: lo decide el backend; sin venta abierta no es «agotada»", () => {
    expect(rateStatus({ state: "ON_SALE" }, "es")).toBe("A la venta");
    expect(rateStatus({ state: "SOLD_OUT" }, "en")).toBe("Sold out");
    expect(rateStatus({ state: "SOON" }, "es")).toBe("Próximamente");
    expect(rateStatus({ state: "UNAVAILABLE" }, "es")).toBe("No disponible");
  });

  test("display_date real de Alpha (instante) es el día del local, no el día UTC", () => {
    const w = externalWhen(
      "2026-11-16T22:00:00.000Z",
      "2026-11-17T04:00:00.000Z",
      { timezone: "Europe/Madrid", displayDateRaw: "2026-11-15T23:00:00.000Z" },
      "es",
      2026,
    );
    expect(w.dayKey).toBe("2026-11-16");
    expect(w.start).toBe("23:00");
    expect(w.end).toBe("05:00");
  });

  test("condiciones de lista reales: men/women son admisión y el importe no se presenta como pago", () => {
    const c = {
      validFrom: "2026-11-16T22:00:00.000Z",
      validUntil: "2026-11-17T04:00:00.000Z",
      men: true,
      women: true,
      minAge: 18,
      amount: 10,
      open: true,
    };
    const es = describeListCondition(c, { currency: "EUR", timezone: "Europe/Madrid", locale: "es" }).replace(/\s/g, " ");
    expect(es).toContain("Hombres y mujeres");
    expect(es).toContain("Desde 18 años");
    expect(es).toContain("23:00");
    expect(es).toContain("Importe indicado: 10 € (condiciones por confirmar)");
    expect(describeListCondition({ ...c, men: false, amount: 0 }, { currency: null, timezone: null, locale: "en" })).toContain("Women only");
  });
});
