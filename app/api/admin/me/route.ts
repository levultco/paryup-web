import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

// ¿Es el usuario administrador global de ParyUp? Solo sirve para mostrar el acceso a «Administración»;
// el backend vuelve a exigir el rol en cada operación administrativa.
export async function GET() {
  const token = await sessionToken();
  if (!token) return NextResponse.json({ admin: false });
  const res = await backendFetch("/authz/bootstrap", { token }).catch(() => null);
  const data = res?.ok ? await res.json().catch(() => null) : null;
  return NextResponse.json({ admin: data?.user?.globalRole === "ADMIN" });
}
