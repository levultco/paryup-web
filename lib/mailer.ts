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
