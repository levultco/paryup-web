import { describe, expect, test } from "bun:test";
import {
  groupTickets,
  isQrUsable,
  qrValue,
  temporalStatus,
  type MyTicket,
} from "./tickets";

const make = (
  id: string,
  date: string,
  end: string | null,
  extra = {},
): MyTicket => ({
  id,
  quantity: 1,
  event: { id: `e-${id}`, name: id, date, endDate: end },
  ...extra,
});

// 27-oct-2026 20:00 en Madrid (UTC+1)
const now = new Date("2026-10-27T19:00:00Z");

describe("entradas", () => {
  test("agrupa en esta noche, próximas y anteriores", () => {
    const tickets = [
      make("hoy", "2026-10-27T21:00:00Z", "2026-10-28T04:00:00Z"),
      make("manana", "2026-10-28T21:00:00Z", "2026-10-29T04:00:00Z"),
      make("ayer", "2026-10-26T21:00:00Z", "2026-10-27T04:00:00Z"),
      make("usada", "2026-10-30T21:00:00Z", null, { status: "USED" }),
    ];
    const groups = groupTickets(tickets, now);
    expect(groups.tonight.map((t) => t.id)).toEqual(["hoy"]);
    expect(groups.upcoming.map((t) => t.id)).toEqual(["manana"]);
    expect(groups.past.map((t) => t.id)).toEqual(["usada", "ayer"]);
  });

  test("una entrada de madrugada cuenta para la noche anterior", () => {
    // 28-oct 02:00 Madrid -> noche del 27 = esta noche
    const t = make("madrugada", "2026-10-28T01:00:00Z", "2026-10-28T06:00:00Z");
    expect(groupTickets([t], now).tonight).toHaveLength(1);
  });

  test("estado temporal", () => {
    const live = make("a", "2026-10-27T18:00:00Z", "2026-10-28T04:00:00Z");
    expect(temporalStatus(live, now)).toBe("ACTIVE");
    expect(temporalStatus(make("b", "2026-10-28T18:00:00Z", null), now)).toBe(
      "NOT_STARTED",
    );
    expect(temporalStatus(make("c", "2026-10-20T18:00:00Z", null), now)).toBe(
      "ENDED",
    );
  });

  test("el QR solo es válido con el evento en curso y la entrada activa", () => {
    const live = make("a", "2026-10-27T18:00:00Z", "2026-10-28T04:00:00Z", {
      qrToken: "tok",
    });
    expect(isQrUsable(live, now)).toBe(true);
    expect(qrValue(live, now)).toBe("tok");
    expect(qrValue({ ...live, status: "USED" }, now)).toBeNull();
    expect(
      qrValue({ ...live, qrToken: undefined, isAdmissionTicket: true }, now),
    ).toBeNull();
    expect(qrValue({ ...live, qrToken: undefined }, now)).toBe("pup:tix:a");
  });
});
