import { NextResponse } from "next/server";
import { isBackstageHost, mainHostFor } from "@/lib/backstage-host";

// Salida de backstage hacia la web principal (la redirección la hace una ruta: desde el proxy Next
// quedaría relativa al mismo host). El motivo llega en la cabecera `x-backstage-exit`: login | continue | home.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  if (!isBackstageHost(host)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const reason = request.headers.get("x-backstage-exit");
  const main = `${url.protocol}//${mainHostFor(host)}`;
  const target =
    reason === "login"
      ? `${main}/login?to=backstage&next=%2F`
      : reason === "continue"
        ? `${main}/signup/continue?to=backstage&next=%2F`
        : `${main}/`;
  return NextResponse.redirect(target);
}
