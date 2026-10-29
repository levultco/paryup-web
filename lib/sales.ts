// Ventas, órdenes y asistentes de un evento (`/api/organizations/[slug]/events/[id]/sales|orders|attendees`).

export type SalesTicket = {
  id: string;
  name: string;
  type: string | null;
  price: number;
  capacity: number | null;
  sold: number;
  checkedIn: number;
  cancelled: number;
  refunded: number;
  reserved: number;
  listed: number;
  remaining: number | null;
  /** Céntimos cobrados con esta entrada. */
  revenue: number;
};

export type SalesSummary = {
  eventCapacity: number | null;
  totals: {
    ticketsSold: number;
    checkedIn: number;
    paidOrders: number;
    refundedOrders: number;
    pendingOrders: number;
    failedOrders: number;
    reservedPaidOrders: number;
    /** Importes en céntimos, SIEMPRE separados por moneda. */
    amounts: {
      currency: string;
      /** Lo que pagó el comprador (entradas + comisión de ParyUp). */
      billedAmount: number;
      /** Entradas, antes de reembolsos. Sin comisión de ParyUp. */
      ticketRevenue: number;
      /** Pagos online de reservados, aparte de las entradas. */
      reservedRevenue: number;
      /** Comisión de ParyUp (la paga el comprador encima del precio). */
      platformFeeAmount: number;
      /** Reembolsos acumulados; no se resta como "neto". */
      refundedAmount: number;
    }[];
  };
  tickets: SalesTicket[];
};

export type OrderStatus =
  "PAID" | "PENDING" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";

export type SalesOrder = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  refundAmount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  user: { id: string; name: string; image: string | null };
  lines: {
    ticketNameSnapshot: string;
    releaseNameSnapshot: string | null;
    quantity: number;
  }[];
};

export type Attendee = {
  id: string;
  status: "ACTIVE" | "USED" | "CANCELLED" | "REFUNDED";
  issuedAt: string;
  usedAt: string | null;
  codeLastFour: string | null;
  holder: { id: string; name: string; image: string | null };
  ticketName: string;
  releaseName: string | null;
};

/** Importes en céntimos -> texto con moneda. */
export function formatMoney(cents: number, currency = "EUR", locale = "es-ES") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / 100,
  );
}

export type SalesDay = { date: string; tickets: number; amount: number };
export type SeriesPoint = SalesDay & { cumTickets: number; cumAmount: number };

const DAY_MS = 86_400_000;
const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
const toDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * Serie diaria acumulada sin huecos desde la primera venta hasta `today` (YYYY-MM-DD).
 * `window` recorta a los últimos N días manteniendo el acumulado real; null = todo.
 */
export function buildSalesSeries(
  days: SalesDay[],
  today: string,
  window: number | null,
): SeriesPoint[] {
  if (days.length === 0) return [];
  const byDate = new Map(days.map((d) => [d.date, d]));
  const start = toMs(days[0].date);
  const end = Math.max(toMs(today), toMs(days[days.length - 1].date));
  const all: SeriesPoint[] = [];
  let cumTickets = 0;
  let cumAmount = 0;
  for (let ms = start; ms <= end; ms += DAY_MS) {
    const date = toDate(ms);
    const d = byDate.get(date);
    cumTickets += d?.tickets ?? 0;
    cumAmount += d?.amount ?? 0;
    all.push({
      date,
      tickets: d?.tickets ?? 0,
      amount: d?.amount ?? 0,
      cumTickets,
      cumAmount,
    });
  }
  return window ? all.slice(-window) : all;
}
