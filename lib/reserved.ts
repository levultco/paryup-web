// Áreas y mesas de reservado, y solicitudes/inscripciones de un evento.

export type PaymentMode =
  "NONE" | "FIXED_DEPOSIT" | "PERCENT_DEPOSIT" | "FULL_PAYMENT";
export const PAYMENT_MODES: PaymentMode[] = [
  "NONE",
  "FIXED_DEPOSIT",
  "PERCENT_DEPOSIT",
  "FULL_PAYMENT",
];

export type ReservedTable = {
  id: string;
  name: string;
  color: string;
  capacity: number;
  tableCount: number;
  minSpendAmount: number;
  bottlesIncluded: number;
  arrivalDeadlineTime: string;
  requiresApproval: boolean;
  paymentMode: PaymentMode;
  fixedDepositAmount: number | null;
  depositPercent: number | null;
  isActive: boolean;
  paymentSummary?: {
    totalPayNowAmount?: number;
    remainingAmount?: number;
    platformFeeAmount?: number;
  };
};

export type ReservedArea = {
  id: string;
  name: string;
  description: string;
  locationName: string;
  imageUrl: string;
  isActive: boolean;
  tableTypes: ReservedTable[];
};

export type RequestStatus =
  | "PENDING"
  | "APPROVED_PENDING_PAYMENT"
  | "APPROVED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "PAYMENT_FAILED";

export type AccessRequest = {
  id: string;
  kind: "LIST" | "RESERVED" | "VIP_TABLE" | "RRPP_ACCESS";
  status: RequestStatus;
  partySize: number | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  createdAt: string;
  requester: { id: string; name: string; image: string | null };
  reservedTableType: {
    name: string;
    capacity: number;
    area?: { name: string } | null;
  } | null;
  minSpendAmount: number | null;
  totalPayNowAmount: number | null;
  remainingAmount: number | null;
};

export type ListEntry = {
  id: string;
  status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";
  partySize: number;
  accessCode: string;
  joinedAt: string;
  usedAt: string | null;
  user: { id: string; name: string; image: string | null };
  ticket: { id: string; name: string };
};

/** Misma validación que el backend (`normalizeReservedTableTypeInput`). */
export type TableForm = {
  name: string;
  color: string;
  capacity: string;
  tableCount: string;
  minSpendAmount: string;
  bottlesIncluded: string;
  arrivalDeadlineTime: string;
  requiresApproval: boolean;
  paymentMode: PaymentMode;
  fixedDepositAmount: string;
  depositPercent: string;
  isActive: boolean;
};

export type TableErrors = Partial<Record<keyof TableForm, string>>;

export function validateTable(f: TableForm): TableErrors {
  const errors: TableErrors = {};
  const int = (v: string) => /^\d+$/.test(v.trim());
  const min = Number(f.minSpendAmount || 0);
  if (!f.name.trim()) errors.name = "name";
  if (!int(f.capacity) || Number(f.capacity) < 1) errors.capacity = "capacity";
  if (!int(f.tableCount) || Number(f.tableCount) < 1)
    errors.tableCount = "tableCount";
  if (f.minSpendAmount && !(min >= 0)) errors.minSpendAmount = "minSpend";
  if (f.bottlesIncluded && !int(f.bottlesIncluded))
    errors.bottlesIncluded = "bottles";
  if (
    f.arrivalDeadlineTime &&
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(f.arrivalDeadlineTime)
  )
    errors.arrivalDeadlineTime = "time";
  if (f.paymentMode !== "NONE" && !(min > 0))
    errors.minSpendAmount = "minSpendRequired";
  if (f.paymentMode === "FIXED_DEPOSIT") {
    const fixed = Number(f.fixedDepositAmount);
    if (!(fixed > 0)) errors.fixedDepositAmount = "fixed";
    else if (fixed > min) errors.fixedDepositAmount = "fixedMax";
  }
  if (f.paymentMode === "PERCENT_DEPOSIT") {
    const pct = Number(f.depositPercent);
    if (!(pct >= 1 && pct <= 100)) errors.depositPercent = "percent";
  }
  return errors;
}

export function tablePayload(f: TableForm, id?: string) {
  return {
    ...(id ? { id } : {}),
    name: f.name.trim(),
    color: f.color || "#111111",
    capacity: Number(f.capacity),
    tableCount: Number(f.tableCount),
    minSpendAmount: Number(f.minSpendAmount || 0),
    bottlesIncluded: Number(f.bottlesIncluded || 0),
    arrivalDeadlineTime: f.arrivalDeadlineTime || null,
    requiresApproval: f.requiresApproval,
    paymentMode: f.paymentMode,
    fixedDepositAmount:
      f.paymentMode === "FIXED_DEPOSIT" ? Number(f.fixedDepositAmount) : null,
    depositPercent:
      f.paymentMode === "PERCENT_DEPOSIT" ? Number(f.depositPercent) : null,
    isActive: f.isActive,
  };
}

export const emptyTable = (): TableForm => ({
  name: "",
  color: "#7c3aed",
  capacity: "4",
  tableCount: "1",
  minSpendAmount: "0",
  bottlesIncluded: "0",
  arrivalDeadlineTime: "",
  requiresApproval: true,
  paymentMode: "NONE",
  fixedDepositAmount: "",
  depositPercent: "",
  isActive: true,
});

export const tableToForm = (t: ReservedTable): TableForm => ({
  name: t.name,
  color: t.color || "#7c3aed",
  capacity: String(t.capacity),
  tableCount: String(t.tableCount),
  minSpendAmount: String(t.minSpendAmount ?? 0),
  bottlesIncluded: String(t.bottlesIncluded ?? 0),
  arrivalDeadlineTime: t.arrivalDeadlineTime ?? "",
  requiresApproval: t.requiresApproval !== false,
  paymentMode: t.paymentMode ?? "NONE",
  fixedDepositAmount:
    t.fixedDepositAmount != null ? String(t.fixedDepositAmount) : "",
  depositPercent: t.depositPercent != null ? String(t.depositPercent) : "",
  isActive: t.isActive,
});

export function reservedErrorKey(status: number, data: unknown): string {
  const code = (data as { code?: unknown } | null)?.code;
  if (code === "RESERVED_IN_USE") return "orgs.rs.err.inUse";
  if (status === 403) return "orgs.cat.err.forbidden";
  if (status === 404) return "orgs.cat.err.notFound";
  if (status === 400) return "orgs.cat.err.invalid";
  return "orgs.cat.err.generic";
}

/** Quita el email de las respuestas de inscritos y solicitudes: la web no lo necesita. */
export function stripEmails<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripEmails) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "email" && key !== "contactEmail")
        .map(([key, v]) => [key, stripEmails(v)]),
    ) as T;
  }
  return value;
}
