import { en } from "@/lib/i18n/en";
import { es, type MessageKey } from "@/lib/i18n/es";

export type Locale = "es" | "en";
export const LOCALES: Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "paryup_lang";

export type { MessageKey };

const dictionaries: Record<Locale, Record<string, string>> = { es, en };

export function normalizeLocale(
  value: string | null | undefined,
): Locale | null {
  const text = value?.trim().toLowerCase();
  if (!text) return null;
  if (text === "es" || text.startsWith("es-")) return "es";
  if (text === "en" || text.startsWith("en-")) return "en";
  return null;
}

/** La cookie manda; sin ella se usa el idioma del navegador (inglés si es `en*`, si no español). */
export function detectLocale(
  cookie: string | null | undefined,
  browser: string | null | undefined,
): Locale {
  return normalizeLocale(cookie) ?? normalizeLocale(browser) ?? DEFAULT_LOCALE;
}

export type Params = Record<string, string | number>;

/** Texto traducido; `{nombre}` se sustituye por `params.nombre`. Si falta, cae al español. */
export function translate(
  locale: Locale,
  key: string,
  params?: Params,
): string {
  const template = dictionaries[locale][key] ?? dictionaries.es[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** BCP 47 para `Intl` (fechas, números). */
export const intlLocale = (locale: Locale) =>
  locale === "en" ? "en-GB" : "es-ES";
