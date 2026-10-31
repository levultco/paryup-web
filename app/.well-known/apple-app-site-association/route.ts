// Universal Links de iOS. Debe servirse sin redirecciones y como JSON.
// APPLE_TEAM_ID: identificador del equipo de Apple Developer (10 caracteres).
const BUNDLE_ID = "com.deiividd.paryup";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID;
  if (!teamId) return new Response("Not found", { status: 404 });
  return Response.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${teamId}.${BUNDLE_ID}`],
            components: [{ "/": "/events/*" }, { "/": "/r/*" }],
          },
        ],
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
