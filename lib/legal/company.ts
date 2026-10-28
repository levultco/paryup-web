// Datos del titular de ParyUp que aparecen en los textos legales.
// Solo se muestran los campos rellenados. Datos tomados del aviso legal
// publicado en levult.com (titular de ParyUp). Falta `registry`: los datos del
// Registro Mercantil no están publicados allí.

export const COMPANY = {
  brand: "ParyUp",
  email: "paryup@paryup.com",
  website: "https://paryup.com",
  legalName: "Levult S.L." as string | null,
  taxId: "B26825497" as string | null,
  address:
    "C. Camps Blancs, 27, 1.º 2.ª, 08830 Sant Boi de Llobregat, Barcelona, España" as
      string | null,
  registry: null as string | null,
};

/** Fecha de la última revisión de los textos (YYYY-MM-DD) */
export const LEGAL_UPDATED = "2026-10-27";
