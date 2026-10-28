export type LegalBlock =
  | { p: string }
  | { ul: string[] }
  /** Datos de identificación del titular (solo se muestran los que estén rellenados) */
  | { company: true };

export type LegalSection = { h: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalId =
  "terms" | "privacy" | "legal" | "cookies" | "community-guidelines";

export const LEGAL_IDS: LegalId[] = [
  "terms",
  "privacy",
  "legal",
  "cookies",
  "community-guidelines",
];
