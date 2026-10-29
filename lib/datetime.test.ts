import { describe, expect, test } from "bun:test";
import { utcToZonedInput, zonedToUtcISO } from "./datetime";

const TZ = "Europe/Madrid";

describe("datetime", () => {
  test("convierte hora local de Madrid a UTC en invierno y verano", () => {
    expect(zonedToUtcISO("2026-01-10T23:00", TZ)).toBe(
      "2026-01-10T22:00:00.000Z",
    );
    expect(zonedToUtcISO("2026-07-11T23:00", TZ)).toBe(
      "2026-07-11T21:00:00.000Z",
    );
  });

  test("ida y vuelta", () => {
    for (const local of [
      "2026-01-10T23:00",
      "2026-07-11T02:30",
      "2026-10-25T00:30",
    ]) {
      const iso = zonedToUtcISO(local, TZ)!;
      expect(utcToZonedInput(iso, TZ)).toBe(local);
    }
  });

  test("entrada inválida", () => {
    expect(zonedToUtcISO("", TZ)).toBeNull();
    expect(zonedToUtcISO("hoy", TZ)).toBeNull();
    expect(utcToZonedInput(null, TZ)).toBe("");
  });
});
