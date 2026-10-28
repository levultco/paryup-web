import { NextResponse } from "next/server";
import { getMonthCounts } from "@/lib/discovery-server";
import { isArea, type PriceFilter } from "@/lib/discovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? "";
  const month = searchParams.get("month") ?? "";
  const price = searchParams.get("price") ?? "any";

  if (
    !isArea(area) ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    !["any", "free", "paid"].includes(price)
  ) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  try {
    const counts = await getMonthCounts(month, area, price as PriceFilter);
    // El cliente solo necesita el número por día (los ids pesan mucho más).
    return NextResponse.json({
      counts: Object.fromEntries(
        Object.entries(counts).map(([key, value]) => [key, value.count]),
      ),
    });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar" }, { status: 502 });
  }
}
