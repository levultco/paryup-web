import { DISCOVERY_TZ } from "@/lib/discovery";

const timeFormat = new Intl.DateTimeFormat("es-ES", {
  timeZone: DISCOVERY_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: DISCOVERY_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Hora local de Madrid, igual en servidor y navegador (sin desajustes de hidratación). */
export function timeLabel(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : timeFormat.format(date);
}

export function localDayKey(iso: string) {
  return dayFormat.format(new Date(iso));
}

export function priceLabel(
  price: number | null,
  soldOut: boolean,
  t: (key: string, params?: Record<string, string | number>) => string,
  locale: "es" | "en" = "es",
) {
  if (soldOut) return t("price.soldOut");
  if (price === null) return null;
  if (price <= 0) return t("price.freeLabel");
  const fixed = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return t("price.from", {
    price: locale === "es" ? fixed.replace(".", ",") : fixed,
  });
}
