import { NextResponse } from "next/server";
import { isBackstageHost, mainHostFor, safeNextPath } from "@/lib/backstage-host";

// backstage no tiene login propio: `/login` allí llega a esta ruta (reescrita desde el proxy),
// que manda al login único de la web principal recordando a qué ruta del panel volver.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  if (!isBackstageHost(host)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const login = new URL(`${url.protocol}//${mainHostFor(host)}/login`);
  login.searchParams.set("to", "backstage");
  login.searchParams.set("next", safeNextPath(url.searchParams.get("next")));
  return NextResponse.redirect(login);
}
