/** Número de personas apuntadas, leído de la tabla `waitlist` de Supabase. */
export async function getWaitlistCount(): Promise<number | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/waitlist?select=id`, {
      method: "HEAD",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
      // Si Supabase no responde, la página carga igualmente (sin contador).
      signal: AbortSignal.timeout(3000),
    });
    // Content-Range: 0-0/968  (o */968 si está vacía)
    const total = response.headers.get("content-range")?.split("/")[1];
    const count = total ? Number(total) : NaN;
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}
