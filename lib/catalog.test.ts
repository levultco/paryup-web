import { describe, expect, test } from "bun:test";
import {
  buildTemplateRules,
  catalogErrorKey,
  type RulesInput,
} from "./catalog";

const base: RulesInput = {
  type: "GENERAL",
  startType: "",
  startValue: "",
  endType: "",
  endValue: "",
  priorityAccess: false,
  includesDrink: true,
  list: {
    askFirstName: true,
    askLastName: true,
    askEmail: false,
    askPhone: false,
    allowFreeEntry: true,
  },
  vip: {
    priorityAccess: false,
    vipAreaAccess: true,
    includesDrink: false,
    premiumEntry: false,
    requiresVenueValidation: false,
    benefitsSummary: " ",
  },
};

describe("buildTemplateRules", () => {
  test("GENERAL guarda reglas de venta y opciones en general", () => {
    const rules = buildTemplateRules({
      ...base,
      startType: "DAYS_BEFORE_EVENT",
      startValue: "7",
      endType: "EVENT_START",
    });
    expect(rules).toEqual({
      general: {
        saleStartRule: { type: "DAYS_BEFORE_EVENT", value: 7 },
        saleEndRule: { type: "EVENT_START" },
        priorityAccess: false,
        includesDrink: true,
      },
    });
  });

  test("LIST solo añade list y VIP solo vip", () => {
    expect(buildTemplateRules({ ...base, type: "LIST" })).toEqual({
      list: base.list,
    });
    const vip = buildTemplateRules({ ...base, type: "VIP" }) as {
      vip: Record<string, unknown>;
      general?: unknown;
    };
    expect(vip.general).toBeUndefined();
    expect(vip.vip.benefitsSummary).toBeUndefined();
    expect(vip.vip.vipAreaAccess).toBe(true);
  });

  test("valores inválidos se normalizan a 0", () => {
    const rules = buildTemplateRules({
      ...base,
      endType: "HOURS_AFTER_EVENT",
      endValue: "abc",
    }) as { general: { saleEndRule: unknown } };
    expect(rules.general.saleEndRule).toEqual({
      type: "HOURS_AFTER_EVENT",
      value: 0,
    });
  });
});

describe("reservado", () => {
  test("guarda el área y las mesas activas, o solo la mesa elegida", () => {
    const all = buildTemplateRules({
      ...base,
      type: "RESERVED",
      reserved: { areaId: "a1", tableId: "", tableIds: ["t1", "t2"] },
    });
    expect(all).toEqual({
      reserved: {
        reservedAreaId: "a1",
        reservedTableTypeId: "",
        tableTypeIds: ["t1", "t2"],
      },
    });
    const one = buildTemplateRules({
      ...base,
      type: "RESERVED",
      reserved: { areaId: "a1", tableId: "t2", tableIds: ["t1", "t2"] },
    });
    expect(one).toEqual({
      reserved: {
        reservedAreaId: "a1",
        reservedTableTypeId: "t2",
        tableTypeIds: ["t2"],
      },
    });
  });
});

describe("catalogErrorKey", () => {
  test("plantilla usada y estados", () => {
    expect(
      catalogErrorKey(400, { message: "Template is already used by events" }),
    ).toBe("orgs.cat.err.used");
    expect(catalogErrorKey(403, null)).toBe("orgs.cat.err.forbidden");
    expect(catalogErrorKey(500, null)).toBe("orgs.cat.err.generic");
  });
});
