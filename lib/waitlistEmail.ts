const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const LOGO_CID = "paryup-logo";

const features = [
  {
    icon: "🎟️",
    title: "Entradas",
    text: "Compra y vende entradas desde la app.",
  },
  {
    icon: "💬",
    title: "Chat social",
    text: "Grupos y mensajes directos con tu gente.",
  },
  {
    icon: "🤝",
    title: "Matches",
    text: "Las personas con las que coincides en cada evento.",
  },
  {
    icon: "👤",
    title: "Perfil",
    text: "Tus fiestas, seguidores y seguidos en un solo sitio.",
  },
  {
    icon: "📸",
    title: "Recap del día",
    text: "Revive cada evento con fotos y momentos.",
  },
  { icon: "🗺️", title: "Mapa", text: "Previsualiza los eventos antes de ir." },
];

const brandBar = ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe", "#0358f7"];

export function buildWaitlistEmail(name: string) {
  const safeName = escapeHtml(name);
  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  const subject = "Estás en la lista de espera de ParyUp";
  const preheader = "Te avisaremos en cuanto abramos. Guárdate este correo.";

  const featureRows = features
    .map(
      (feature) => `
            <tr>
              <td width="44" valign="top" style="padding:10px 0;font-size:22px;line-height:28px;">${feature.icon}</td>
              <td valign="top" style="padding:10px 0;font-family:${font};">
                <div class="t-h" style="font-size:15px;font-weight:600;color:#0b0b0f;line-height:20px;">${feature.title}</div>
                <div class="t-p" style="font-size:14px;color:#6b6b78;line-height:20px;">${feature.text}</div>
              </td>
            </tr>`,
    )
    .join("");

  const bar = brandBar
    .map(
      (color) =>
        `<td height="4" bgcolor="${color}" style="font-size:0;line-height:0;">&nbsp;</td>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" bgcolor="#f4f4f7" style="background-color:#f4f4f7;">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${subject}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .bg-page { background-color: #050507 !important; background-image: none !important; }
      .bg-card { background-color: #0e0e13 !important; background-image: none !important; }
      .bd { border-color: #23232c !important; }
      .bg-line { background-color: #23232c !important; }
      .t-h { color: #ffffff !important; }
      .t-p { color: #b4b4c0 !important; }
      .t-m { color: #7c7c89 !important; }
    }
    /* Gmail (app y web) evalúa las reglas oscuras y además invierte los colores por su cuenta.
       Para él devolvemos el diseño claro: Gmail lo oscurece solo y el logo (cuadrado oscuro) se ve. */
    u + .body .bg-page { background-color: #f4f4f7 !important; }
    u + .body .bg-card { background-color: #ffffff !important; }
    u + .body .bd { border-color: #e6e6ec !important; }
    u + .body .bg-line { background-color: #e6e6ec !important; }
    u + .body .t-h { color: #0b0b0f !important; }
    u + .body .t-p { color: #4a4a57 !important; }
    u + .body .t-m { color: #8a8a96 !important; }
  </style>
</head>
<body class="body bg-page" bgcolor="#f4f4f7" style="margin:0;padding:0;background-color:#f4f4f7;background-image:linear-gradient(#f4f4f7,#f4f4f7);">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f4f7;font-size:1px;line-height:1px;">
    ${preheader}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;
  </div>
  <table role="presentation" class="bg-page" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f7" style="background-color:#f4f4f7;background-image:linear-gradient(#f4f4f7,#f4f4f7);">
    <tr>
      <td align="center" class="bg-page" bgcolor="#f4f4f7" style="padding:32px 16px;background-color:#f4f4f7;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td class="bg-card bd" bgcolor="#ffffff" style="background-color:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);border-radius:24px;border:1px solid #e6e6ec;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" class="bg-card">
                <tr>${bar}</tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" class="bg-card">
                <tr>
                  <td align="center" style="padding:40px 32px 8px;">
                    <img src="cid:${LOGO_CID}" width="72" height="72" alt="ParyUp" style="display:block;margin:0 auto;width:72px;height:72px;border:0;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 32px 0;font-family:${font};">
                    <h1 class="t-h" style="margin:0;font-size:28px;line-height:34px;font-weight:700;color:#0b0b0f;">Estás dentro, ${safeName}</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="t-p" style="padding:14px 40px 0;font-family:${font};font-size:16px;line-height:24px;color:#4a4a57;">
                    Ya estás en la lista de espera de ParyUp. En cuanto abramos, te avisamos en este mismo correo para que seas de los primeros en entrar.
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td class="bg-line" height="1" bgcolor="#e6e6ec" style="font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px 0;font-family:${font};">
                    <div class="t-m" style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#8a8a96;font-weight:600;">Lo que te espera</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 40px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${featureRows}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="t-p" style="padding:32px 40px 40px;font-family:${font};font-size:15px;line-height:22px;color:#4a4a57;">
                    Gracias por confiar en nosotros.<br />
                    <span class="t-h" style="color:#0b0b0f;font-weight:600;">El equipo de ParyUp</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="t-m" style="padding:20px 24px 0;font-family:${font};font-size:12px;line-height:18px;color:#8a8a96;">
              Recibes este correo porque te apuntaste a la lista de espera de ParyUp.<br />
              Solo usaremos tu nombre y tu correo para avisarte del lanzamiento.<br />
              © 2026 ParyUp
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Estás dentro, ${name}

Ya estás en la lista de espera de ParyUp. En cuanto abramos, te avisamos en este mismo correo para que seas de los primeros en entrar.

Lo que te espera:
${features.map((feature) => `- ${feature.title}: ${feature.text}`).join("\n")}

Gracias por confiar en nosotros.
El equipo de ParyUp

Recibes este correo porque te apuntaste a la lista de espera de ParyUp. Solo usaremos tu nombre y tu correo para avisarte del lanzamiento.`;

  return { subject, html, text };
}
