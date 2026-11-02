import nodemailer from "nodemailer";
import { EMAIL_LOGO_TILE_BASE64 } from "@/lib/emailLogo";
import { LOGO_CID, buildWaitlistEmail } from "@/lib/waitlistEmail";

export async function sendWaitlistConfirmation(name: string, email: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Waitlist: faltan variables SMTP, no se envía correo");
    return;
  }

  const port = Number(SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const { subject, html, text } = buildWaitlistEmail(name);

  await transporter.sendMail({
    from: SMTP_FROM ?? SMTP_USER,
    to: email,
    subject,
    text,
    html,
    attachments: [
      {
        filename: "paryup.png",
        content: Buffer.from(EMAIL_LOGO_TILE_BASE64, "base64"),
        contentType: "image/png",
        cid: LOGO_CID,
      },
    ],
  });
}

export type AccessRequest = {
  name: string;
  email: string;
  venue: string;
  city: string;
  system: "none" | "fourvenues" | "other";
  phone: string;
  message: string;
};

const SYSTEM_LABEL: Record<AccessRequest["system"], string> = {
  none: "Ninguno todavía",
  fourvenues: "Fourvenues",
  other: "Otro sistema",
};

const esc = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT ?? 587);
  return {
    from: SMTP_FROM ?? SMTP_USER,
    mailer: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
  };
}

/**
 * Solicitud de acceso a Backstage: avisa al equipo (con reply-to a la persona) y,
 * si sale bien, manda un acuse de recibo. Devuelve false si no se pudo avisar al equipo.
 */
export async function sendAccessRequest(
  req: AccessRequest,
  teamEmail: string,
): Promise<boolean> {
  const t = transport();
  if (!t) {
    console.error("Backstage: faltan variables SMTP, no se envía la solicitud");
    return false;
  }
  const rows: [string, string][] = [
    ["Nombre", req.name],
    ["Correo", req.email],
    ["Sala / organización", req.venue],
    ["Ciudad", req.city],
    ["Sistema actual", SYSTEM_LABEL[req.system]],
    ["Teléfono", req.phone || "—"],
    ["Mensaje", req.message || "—"],
  ];
  await t.mailer.sendMail({
    from: t.from,
    to: teamEmail,
    replyTo: req.email,
    subject: `Solicitud de demo de Backstage: ${req.venue}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="color:#666;vertical-align:top">${k}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
      )
      .join("")}</table>`,
  });
  try {
    await t.mailer.sendMail({
      from: t.from,
      to: req.email,
      subject: "Hemos recibido tu solicitud de demo de Backstage",
      text: `Hola ${req.name},\n\nHemos recibido tu solicitud de demo para ${req.venue}. Te escribiremos pronto a este correo para enseñarte Backstage.\n\nEl equipo de ParyUp`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5"><p>Hola ${esc(req.name)},</p><p>Hemos recibido tu solicitud de demo para <strong>${esc(req.venue)}</strong>. Te escribiremos pronto a este correo para enseñarte Backstage.</p><p>El equipo de ParyUp</p></div>`,
    });
  } catch (error) {
    console.error("Backstage: no se pudo enviar el acuse", error);
  }
  return true;
}
