// Plantillas de entrada y de evento (`/api/organizations/[slug]/ticket-types` y `/event-templates`).

export type TicketType = "GENERAL" | "EARLY_BIRD" | "VIP" | "LIST" | "RESERVED";
export type TicketVisibility = "PUBLIC" | "PRIVATE" | "RRPP_ONLY";
export type SalesMode = "SIMPLE" | "RELEASES";

export const EDITABLE_TICKET_TYPES: TicketType[] = [
  "GENERAL",
  "EARLY_BIRD",
  "VIP",
  "LIST",
  "RESERVED",
];
export const RELEASE_TYPES: TicketType[] = ["GENERAL", "EARLY_BIRD", "VIP"];
export const VISIBILITIES: TicketVisibility[] = [
  "PUBLIC",
  "PRIVATE",
  "RRPP_ONLY",
];

export const SALE_START_TYPES = [
  "EVENT_CREATION",
  "DAYS_BEFORE_EVENT",
  "HOURS_BEFORE_EVENT",
  "MANUAL",
] as const;
export const SALE_END_TYPES = [
  "EVENT_START",
  "HOURS_BEFORE_EVENT",
  "HOURS_AFTER_EVENT",
  "HOURS_BEFORE_EVENT_END",
  "SOLD_OUT",
  "MANUAL",
] as const;
export type SaleStartType = (typeof SALE_START_TYPES)[number];
export type SaleEndType = (typeof SALE_END_TYPES)[number];

export type SaleRule<T extends string> = { type: T; value?: number };

export type TicketRelease = {
  id?: string;
  name: string;
  price: number;
  capacity: number;
  sortOrder: number;
  isActive?: boolean;
  saleStartRule?: SaleRule<SaleStartType> | null;
  saleEndRule?: SaleRule<SaleEndType> | null;
};

export type TicketTemplate = {
  id: string;
  name: string;
  type: TicketType | null;
  visibility: TicketVisibility | null;
  isActive: boolean;
  salesMode: SalesMode;
  description: string | null;
  price: number;
  capacity: number | null;
  currency: string;
  templateRules: Record<string, Record<string, unknown>> | null;
  releases: TicketRelease[];
};

export type EventTemplate = {
  id: string;
  templateName: string;
  eventName?: string;
  description?: string;
  imageUrl?: string;
  location: {
    locationName: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    organizationLocationId?: string;
  } | null;
  startTime?: string;
  endTime?: string;
  ticketTypeIds: string[];
};

/** Reglas de venta con valor numérico solo cuando el tipo lo necesita. */
export function buildSaleRule<T extends string>(
  type: T | "",
  value: string,
  withoutValue: readonly string[],
): SaleRule<T> | undefined {
  if (!type) return undefined;
  if (withoutValue.includes(type)) return { type };
  const n = Number(value);
  return { type, value: Number.isFinite(n) && n >= 0 ? n : 0 };
}

export const START_WITHOUT_VALUE = ["EVENT_CREATION", "MANUAL"] as const;
export const END_WITHOUT_VALUE = ["EVENT_START", "SOLD_OUT", "MANUAL"] as const;

export type RulesInput = {
  type: TicketType;
  startType: SaleStartType | "";
  startValue: string;
  endType: SaleEndType | "";
  endValue: string;
  priorityAccess: boolean;
  includesDrink: boolean;
  list: {
    askFirstName: boolean;
    askLastName: boolean;
    askEmail: boolean;
    askPhone: boolean;
    allowFreeEntry: boolean;
  };
  reserved?: { areaId: string; tableId: string; tableIds: string[] };
  vip: {
    priorityAccess: boolean;
    vipAreaAccess: boolean;
    includesDrink: boolean;
    premiumEntry: boolean;
    requiresVenueValidation: boolean;
    benefitsSummary: string;
  };
};

/** Misma estructura que guarda la app: reglas de venta en `general`, opciones por tipo aparte. */
export function buildTemplateRules(input: RulesInput) {
  const saleStartRule = buildSaleRule(
    input.startType,
    input.startValue,
    START_WITHOUT_VALUE,
  );
  const saleEndRule = buildSaleRule(
    input.endType,
    input.endValue,
    END_WITHOUT_VALUE,
  );
  const direct = input.type === "GENERAL" || input.type === "EARLY_BIRD";
  const general = {
    ...(saleStartRule ? { saleStartRule } : {}),
    ...(saleEndRule ? { saleEndRule } : {}),
    ...(direct
      ? {
          priorityAccess: input.priorityAccess,
          includesDrink: input.includesDrink,
        }
      : {}),
  };
  return {
    ...(Object.keys(general).length ? { general } : {}),
    ...(input.type === "LIST" ? { list: { ...input.list } } : {}),
    ...(input.type === "RESERVED" && input.reserved
      ? {
          reserved: {
            reservedAreaId: input.reserved.areaId,
            reservedTableTypeId: input.reserved.tableId,
            tableTypeIds: input.reserved.tableId
              ? [input.reserved.tableId]
              : input.reserved.tableIds,
          },
        }
      : {}),
    ...(input.type === "VIP"
      ? {
          vip: {
            ...input.vip,
            benefitsSummary: input.vip.benefitsSummary.trim() || undefined,
          },
        }
      : {}),
  };
}

const ERROR_KEYS: Record<string, string> = {
  "template is already used by events": "orgs.cat.err.used",
  "ticket template not found": "orgs.cat.err.notFound",
  "event template not found": "orgs.cat.err.notFound",
};

export function catalogErrorKey(status: number, data: unknown): string {
  const message = String(
    (data as { message?: unknown } | null)?.message ?? "",
  ).toLowerCase();
  if (ERROR_KEYS[message]) return ERROR_KEYS[message];
  if (status === 403) return "orgs.cat.err.forbidden";
  if (status === 404) return "orgs.cat.err.notFound";
  if (status === 400) return "orgs.cat.err.invalid";
  return "orgs.cat.err.generic";
}
