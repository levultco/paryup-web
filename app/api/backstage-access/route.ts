import { COMPANY } from "@/lib/legal/company";
import { sendAccessRequest, type AccessRequest } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SYSTEMS = ["none", "fourvenues", "other"] as const;

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  // Campo trampa: un humano no lo ve ni lo rellena.
  if (typeof body.website === "string" && body.website.length > 0) {
    return Response.json({ ok: true });
  }

  const data: AccessRequest = {
    name: text(body.name, 80),
    email: text(body.email, 254).toLowerCase(),
    venue: text(body.venue, 100),
    city: text(body.city, 60),
    system: SYSTEMS.includes(body.system as AccessRequest["system"])
      ? (body.system as AccessRequest["system"])
      : "none",
    phone: text(body.phone, 30),
    message: text(body.message, 1000),
  };

  const invalid: string[] = [];
  if (!data.name) invalid.push("name");
  if (!EMAIL_RE.test(data.email)) invalid.push("email");
  if (!data.venue) invalid.push("venue");
  if (!data.city) invalid.push("city");
  if (!SYSTEMS.includes(body.system as AccessRequest["system"]))
    invalid.push("system");
  if (invalid.length > 0) {
    return Response.json(
      { error: "invalid", fields: invalid },
      { status: 400 },
    );
  }

  try {
    const sent = await sendAccessRequest(data, COMPANY.email);
    if (!sent)
      return Response.json({ error: "server_misconfigured" }, { status: 500 });
  } catch (error) {
    console.error("Backstage: error al enviar la solicitud", error);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
