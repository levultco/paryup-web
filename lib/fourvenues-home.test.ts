import { describe, expect, test } from "bun:test";
import { en } from "@/lib/i18n/en";
import { es } from "@/lib/i18n/es";
import {
  activityKey,
  channelEmptyKey,
  syncState,
  type FourvenuesHome,
} from "./fourvenues-home";

const channel = (over: Partial<FourvenuesHome["channel"]> = {}): FourvenuesHome["channel"] => ({
  source: "PARYUP_CHANNEL",
  enabled: { tickets: false, lists: false, bookings: false },
  totals: null,
  hasActivity: false,
  ...over,
});

describe("Inicio de organización Fourvenues (web)", () => {
  test("sin operaciones hay estado vacío; con datos reales, no", () => {
    expect(channelEmptyKey(channel())).toBe("orgs.fvHome.emptyDisabled");
    expect(
      channelEmptyKey(channel({ enabled: { tickets: true, lists: false, bookings: false } })),
    ).toBe("orgs.fvHome.emptyEnabled");
    expect(
      channelEmptyKey(channel({ totals: { tickets: 1, lists: 0, bookings: 0 }, hasActivity: true })),
    ).toBeNull();
  });

  test("el estado vacío aclara que no son cifras globales del local", () => {
    expect(es["orgs.fvHome.emptyDisabled"]).toContain("no las cifras globales");
    expect(en["orgs.fvHome.emptyDisabled"]).toContain("not the venue's overall figures");
  });

  test("actividad: vinculación, evento sincronizado y no disponible", () => {
    expect(activityKey({ id: "1", type: "LINK_STATUS", at: "", label: "ACTIVE" }).key).toBe(
      "orgs.fvHome.act.ACTIVE",
    );
    expect(activityKey({ id: "1", type: "LINK_STATUS", at: "", label: "???" }).key).toBe(
      "orgs.fvHome.act.linkChanged",
    );
    expect(activityKey({ id: "2", type: "EVENT_SYNCED", at: "", label: "Noche" })).toEqual({
      key: "orgs.fvHome.act.eventSynced",
      params: { name: "Noche" },
    });
  });

  test("sincronización: pendiente, correcta, con avisos y fallida", () => {
    const now = Date.parse("2027-01-10T12:00:00Z");
    expect(syncState(null, null, now).key).toBe("orgs.fvHome.syncPending");
    expect(syncState("2027-01-10T11:55:00Z", "OK", now)).toEqual({ key: "orgs.fvHome.sync.min", params: { n: 5 } });
    expect(syncState("2027-01-10T09:00:00Z", "PARTIAL", now)).toEqual({ key: "orgs.fvHome.syncPartial.hours", params: { n: 3 } });
    expect(syncState("2027-01-05T12:00:00Z", "FORBIDDEN", now)).toEqual({ key: "orgs.fvHome.syncFailed.days", params: { n: 5 } });
    expect(syncState("2027-01-10T12:00:00Z", "OK", now).key).toBe("orgs.fvHome.sync.now");
  });

  test("todas las claves que genera existen en es y en", () => {
    const keys = new Set<string>();
    for (const s of ["OK", "PARTIAL", "FAILED"]) {
      for (const mins of [0, 5, 300, 5000]) {
        keys.add(syncState("2027-01-10T12:00:00Z", s, Date.parse("2027-01-10T12:00:00Z") + mins * 60_000).key);
      }
    }
    for (const label of ["PENDING_REVIEW", "REJECTED", "CANCELLED", "ACTIVE", "SUSPENDED", "REVOKED", "DISCONNECTED", "x"]) {
      keys.add(activityKey({ id: "", type: "LINK_STATUS", at: "", label }).key);
    }
    for (const type of ["EVENT_SYNCED", "EVENT_UNAVAILABLE"] as const) {
      keys.add(activityKey({ id: "", type, at: "", label: "x" }).key);
    }
    keys.add("orgs.fvHome.syncPending");
    for (const key of keys) {
      expect(key in es).toBe(true);
      expect(key in en).toBe(true);
    }
  });
});
