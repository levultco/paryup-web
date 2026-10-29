import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sniffImageType } from "@/lib/image-type";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

const MAX_BYTES = 12 * 1024 * 1024;
const PURPOSE = {
  logo: "ORGANIZATION_LOGO",
  banner: "ORGANIZATION_BANNER",
  cover: "EVENT_COVER",
  template: "EVENT_TEMPLATE_IMAGE",
  area: "RESERVED_AREA_IMAGE",
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

  const form = await request.formData().catch((error) => {
    console.error("[org-media] formData failed", error);
    return null;
  });
  const raw = form?.get("file");
  // Duck typing: `instanceof File` no es fiable entre el File de undici y el global de Next.
  const file =
    raw && typeof raw !== "string" && typeof raw.arrayBuffer === "function"
      ? raw
      : null;
  const kind = String(form?.get("kind") ?? "");
  const width = Number(form?.get("width"));
  const height = Number(form?.get("height"));
  if (
    !file ||
    !(kind in PURPOSE) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height)
  ) {
    console.error("[org-media] invalid request", {
      hasForm: !!form,
      hasFile: !!file,
      kind,
      width,
      height,
    });
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }
  // El tipo se saca del contenido, no del nombre: el backend valida la firma del archivo.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) {
    console.error("[org-media] unsupported image content", file.type);
    return NextResponse.json({ code: "type" }, { status: 400 });
  }
  if (bytes.length < 1 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ code: "size" }, { status: 400 });
  }

  const headers = {
    "X-Org-Context": organizationId,
    "Content-Type": "application/json",
  };
  const fail = async (res: Response | null, status = 502) => {
    const code = status === 403 ? "forbidden" : "generic";
    if (res) {
      // Queda en el log del servidor para poder diagnosticar rechazos del backend.
      console.error(
        "[org-media] backend rejected",
        res.status,
        await res
          .clone()
          .text()
          .catch(() => ""),
      );
    }
    return NextResponse.json(
      { code },
      { status: status >= 400 && status < 500 ? status : 502 },
    );
  };

  try {
    const init = await backendFetch("/media/images/upload", {
      method: "POST",
      token,
      headers,
      body: JSON.stringify({
        clientUploadId: randomUUID(),
        purpose: PURPOSE[kind as keyof typeof PURPOSE],
        // El logo y el banner pertenecen a la organización. La portada de un evento aún
        // no existe al subirla (igual que en la app), así que no lleva resourceId.
        ...(kind === "cover" || kind === "template" || kind === "area"
          ? {}
          : { resourceId: organizationId }),
        mimeType: mime,
        size: bytes.length,
        width,
        height,
      }),
    });
    if (!init.ok) return fail(init, init.status);
    const started = await init.json();

    if (started.uploadRequired) {
      const put = await fetch(started.uploadUrl, {
        method: "PUT",
        headers: started.uploadHeaders ?? { "Content-Type": mime },
        body: Buffer.from(bytes),
      });
      if (!put.ok) {
        console.error("[org-media] storage rejected", put.status);
        return fail(null, 502);
      }
    }

    const confirmed = await backendFetch(
      `/media/images/${encodeURIComponent(started.assetId ?? started.asset?.id)}/confirm`,
      { method: "POST", token, headers, body: "{}" },
    );
    if (!confirmed.ok) return fail(confirmed, confirmed.status);
    const url = (await confirmed.json())?.asset?.url;
    if (!url) return fail(null, 502);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ code: "connect" }, { status: 502 });
  }
}
