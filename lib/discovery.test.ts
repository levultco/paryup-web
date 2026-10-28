import { describe, expect, test } from "bun:test";
import {
  addDays,
  addMonths,
  daysBetween,
  daysInMonth,
  discoveryQuery,
  matchesPrice,
  matchesQuery,
  nightKey,
  normalizeCounts,
  pickInOrder,
  parseDiscoveryParams,
  parseKey,
  weekdayIndex,
} from "./discovery";

describe("fechas", () => {
  test("addDays cruza mes y año", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-03-01", -1)).toBe("2027-02-28");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  test("addDays no se rompe con el cambio de hora", () => {
    // Europa pasa a horario de invierno el 25-oct-2026 y a verano el 29-mar-2026
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
  });

  test("parseKey rechaza fechas imposibles", () => {
    expect(parseKey("2026-02-30")).toBeNull();
    expect(parseKey("2026-13-01")).toBeNull();
    expect(parseKey("hoy")).toBeNull();
    expect(parseKey("2026-10-27")).toEqual({ y: 2026, m: 10, d: 27 });
  });

  test("weekdayIndex: lunes = 0", () => {
    expect(weekdayIndex("2026-10-26")).toBe(0);
    expect(weekdayIndex("2026-10-31")).toBe(5);
    expect(weekdayIndex("2026-11-01")).toBe(6);
  });

  test("meses", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(daysInMonth("2028-02")).toBe(29);
    expect(daysInMonth("2026-10")).toBe(31);
  });
});

describe("nightKey (hoy según la app)", () => {
  test("de día es la fecha local de Madrid", () => {
    // 27-oct-2026 15:00 UTC = 16:00 en Madrid (horario de invierno, UTC+1)
    expect(nightKey(new Date("2026-10-27T15:00:00Z"))).toBe("2026-10-27");
  });

  test("la madrugada todavía es la noche anterior", () => {
    // 28-oct 01:30 Madrid -> aún cuenta como el 27
    expect(nightKey(new Date("2026-10-28T00:30:00Z"))).toBe("2026-10-27");
    // 28-oct 09:59 Madrid -> sigue siendo el 27
    expect(nightKey(new Date("2026-10-28T08:59:00Z"))).toBe("2026-10-27");
    // 28-oct 10:00 Madrid -> ya es el 28
    expect(nightKey(new Date("2026-10-28T09:00:00Z"))).toBe("2026-10-28");
  });

  test("usa la zona de Madrid aunque el UTC sea otro día", () => {
    // 27-oct 23:30 UTC = 28-oct 00:30 Madrid -> noche del 27
    expect(nightKey(new Date("2026-10-27T23:30:00Z"))).toBe("2026-10-27");
  });

  test("cruce de año", () => {
    expect(nightKey(new Date("2027-01-01T03:00:00Z"))).toBe("2026-12-31");
  });
});

describe("URL", () => {
  const today = "2026-10-27";

  test("valores por defecto", () => {
    expect(parseDiscoveryParams({}, today)).toEqual({
      area: "barcelona",
      date: today,
      price: "any",
    });
  });

  test("lee ciudad, fecha y precio", () => {
    expect(
      parseDiscoveryParams(
        { ciudad: "Madrid", fecha: "2026-11-02", precio: "gratis" },
        today,
      ),
    ).toEqual({ area: "madrid", date: "2026-11-02", price: "free" });
  });

  test("descarta lo inválido y las fechas pasadas", () => {
    expect(
      parseDiscoveryParams(
        { ciudad: "narnia", fecha: "2026-02-31", precio: "caro" },
        today,
      ),
    ).toEqual({ area: "barcelona", date: today, price: "any" });
    expect(parseDiscoveryParams({ fecha: "2026-10-01" }, today).date).toBe(
      today,
    );
  });

  test("querystring canónica omite los valores por defecto", () => {
    expect(
      discoveryQuery({ area: "barcelona", date: today, price: "any" }, today),
    ).toBe("");
    expect(
      discoveryQuery(
        { area: "ibiza", date: "2026-11-02", price: "paid" },
        today,
      ),
    ).toBe("?ciudad=ibiza&fecha=2026-11-02&precio=pago");
  });
});

describe("datos del backend", () => {
  test("normalizeCounts acepta objeto y número", () => {
    expect(
      normalizeCounts({
        "2026-10-27": { count: 1, eventIds: ["a"] },
        "2026-10-28": 3,
        "2026-10-29": { eventIds: ["b", "c"] },
      }),
    ).toEqual({
      "2026-10-27": { count: 1, ids: ["a"] },
      "2026-10-28": { count: 3, ids: [] },
      "2026-10-29": { count: 2, ids: ["b", "c"] },
    });
  });

  test("pickInOrder respeta el orden del backend y salta los que faltan", () => {
    const pool = [{ id: "c" }, { id: "a" }, { id: "x" }];
    expect(pickInOrder(["a", "b", "c"], pool)).toEqual([
      { id: "a" },
      { id: "c" },
    ]);
    expect(pickInOrder([], pool)).toEqual([]);
  });
});

describe("búsqueda", () => {
  const event = {
    name: "Money Mondays",
    location: "Gravity Hall",
    organization: { name: "Downtown" },
    price: 0,
  };

  test("busca por nombre, sala u organizador sin distinguir mayúsculas", () => {
    expect(matchesQuery(event, "money")).toBe(true);
    expect(matchesQuery(event, "GRAVITY")).toBe(true);
    expect(matchesQuery(event, "downtown")).toBe(true);
    expect(matchesQuery(event, "otra cosa")).toBe(false);
    expect(matchesQuery(event, "   ")).toBe(true);
  });

  test("filtro de precio", () => {
    expect(matchesPrice(event, "free")).toBe(true);
    expect(matchesPrice(event, "paid")).toBe(false);
    expect(matchesPrice({ ...event, price: 12 }, "paid")).toBe(true);
    expect(matchesPrice({ ...event, price: null }, "free")).toBe(false);
    expect(matchesPrice({ ...event, price: null }, "any")).toBe(true);
  });

  test("q se lee y se escribe en la URL", () => {
    const today = "2026-10-27";
    expect(parseDiscoveryParams({ q: "  vibe " }, today).q).toBe("vibe");
    expect(parseDiscoveryParams({ q: "   " }, today).q).toBeUndefined();
    expect(
      discoveryQuery(
        { area: "barcelona", date: today, price: "any", q: "vibe" },
        today,
      ),
    ).toBe("?q=vibe");
  });
});
