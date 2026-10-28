import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";
import { ORG_SLUG_REGEX, normalizeOrgSlug } from "@/lib/organizations";

export async function GET(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const slug = normalizeOrgSlug(
    new URL(request.url).searchParams.get("slug") ?? "",
  );
  if (!ORG_SLUG_REGEX.test(slug)) {
    return NextResponse.json({ valid: false, available: false });
  }
  try {
    const res = await backendFetch(
      `/organizations/slug-available?slug=${encodeURIComponent(slug)}`,
      { token },
    );
    if (!res.ok) throw new Error("slug");
    const data = await res.json();
    return NextResponse.json({
      valid: data?.valid === true,
      available: data?.available === true,
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
