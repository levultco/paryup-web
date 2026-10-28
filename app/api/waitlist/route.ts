import { sendWaitlistConfirmation } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (name.length < 1 || name.length > 80) {
    return Response.json({ error: "invalid_name" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Waitlist: faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    return Response.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ name, email }),
  });

  if (response.status === 409) {
    return Response.json({ ok: true });
  }

  if (response.ok) {
    try {
      await sendWaitlistConfirmation(name, email);
    } catch (error) {
      console.error("Waitlist: no se pudo enviar el correo", error);
    }
    return Response.json({ ok: true });
  }

  console.error("Waitlist: error de Supabase", response.status);
  return Response.json({ error: "save_failed" }, { status: 502 });
}
