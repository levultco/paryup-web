import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";
import { getAvatarAccent } from "@/lib/avatar-accent-server";

/** Perfil propio: datos de `/users/me` y fiestas asistidas de `/users/me/attended-events`. */
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [me, attended] = await Promise.all([
      backendFetch("/users/me", { token }),
      backendFetch("/users/me/attended-events?limit=50", { token }),
    ]);
    if (me.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!me.ok) {
      return NextResponse.json({ error: "backend" }, { status: 502 });
    }
    const user = (await me.json()).user ?? null;
    // Las fiestas asistidas son un extra: si fallan, el perfil se muestra igual.
    const events = attended.ok ? ((await attended.json()).events ?? []) : [];
    // Sin banner propio, el perfil usa el color dominante del avatar (como la app).
    const hasBanner =
      typeof user?.banner === "string" && user.banner.trim() !== "";
    const accent = hasBanner ? null : await getAvatarAccent(user?.image);
    return NextResponse.json({ user, events, accent });
  } catch {
    return NextResponse.json({ error: "backend" }, { status: 502 });
  }
}
