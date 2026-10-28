import { legalEn } from "@/lib/legal/en";
import { legalEs } from "@/lib/legal/es";
import type { LegalDoc, LegalId } from "@/lib/legal/types";
import type { Locale } from "@/lib/i18n";

export { LEGAL_IDS } from "@/lib/legal/types";
export type { LegalBlock, LegalDoc, LegalId } from "@/lib/legal/types";

export const getLegalDoc = (locale: Locale, id: LegalId): LegalDoc =>
  (locale === "en" ? legalEn : legalEs)[id];

/** Rutas públicas: las mismas que enlaza la app (`paryup-app/src/constants/legal.ts`). */
export const legalPath = (id: LegalId) => `/${id}`;
