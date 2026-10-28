import { NextResponse } from "next/server";
import { getNightEvents } from "@/lib/discovery-server";
import { isArea, parseKey, type PriceFilter } from "@/lib/discovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? "";
  const date = searchParams.get("date") ?? "";
  const price = searchParams.get("price") ?? "any";

  if (
    !isArea(area) ||
    !parseKey(date) ||
    !["any", "free", "paid"].includes(price)
  ) {
    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 },
    );
  }

  try {
    const events = await getNightEvents(area, date, price as PriceFilter);
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar" }, { status: 502 });
  }
}
