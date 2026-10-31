// App Links de Android. ANDROID_CERT_SHA256: huella(s) SHA-256 del certificado de firma,
// separadas por comas (la de Play App Signing y, si se usa, la de subida).
const PACKAGE_NAME = "com.deiividd.paryup";

export function GET() {
  const fingerprints = (process.env.ANDROID_CERT_SHA256 ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  if (!fingerprints.length) return new Response("Not found", { status: 404 });
  return Response.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
