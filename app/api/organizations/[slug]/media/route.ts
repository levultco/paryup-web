import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

const MAX_BYTES = 12 * 1024 * 1024;
const MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const PURPOSE = {
  logo: "ORGANIZATION_LOGO",
  banner: "ORGANIZATION_BANNER",
} as const;

/**
 * Sube logo o banner con el mismo sistema que la app (R2 con URL firmada):
 * initiate -> PUT al almacenamiento -> confirm. Hecho en servidor para no
 * exponer el token ni depender de CORS del bucket.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const resolved = await resolveMembership(token, (await params).slug);
  if (resolved.status !== 200) {
    return NextResponse.json({ error: "failed" }, { status: resolved.status });
  }
  const { organizationId } = resolved.membership;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = String(form?.get("kind") ?? "");
  const width = Number(form?.get("width"));
  const height = Number(form?.get("height"));
  if (
    !(file instanceof File) ||
    !(kind in PURPOSE) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height)
  ) {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }
  if (!MIME.has(file.type)) {
    return NextResponse.json({ code: "type" }, { status: 400 });
  }
  if (file.size < 1 || file.size > MAX_BYTES) {
    return NextResponse.json({ code: "size" }, { status: 400 });
  }

  const headers = {
    "X-Org-Context": organizationId,
    "Content-Type": "application/json",
  };
  const fail = (status: number) =>
    NextResponse.json(
      { code: status === 403 ? "forbidden" : "generic" },
      { status: status >= 400 && status < 500 ? status : 502 },
    );

  try {
    const init = await backendFetch("/media/images/upload", {
      method: "POST",
      token,
      headers,
      body: JSON.stringify({
        clientUploadId: randomUUID(),
        purpose: PURPOSE[kind as keyof typeof PURPOSE],
        resourceId: organizationId,
        mimeType: file.type,
        size: file.size,
        width,
        height,
      }),
    });
    if (!init.ok) return fail(init.status);
    const started = await init.json();

    if (started.uploadRequired) {
      const put = await fetch(started.uploadUrl, {
        method: "PUT",
        headers: started.uploadHeaders ?? { "Content-Type": file.type },
        body: Buffer.from(await file.arrayBuffer()),
      });
      if (!put.ok) return fail(502);
    }

    const confirmed = await backendFetch(
      `/media/images/${encodeURIComponent(started.assetId ?? started.asset?.id)}/confirm`,
      { method: "POST", token, headers, body: "{}" },
    );
    if (!confirmed.ok) return fail(confirmed.status);
    const url = (await confirmed.json())?.asset?.url;
    if (!url) return fail(502);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ code: "connect" }, { status: 502 });
  }
}
