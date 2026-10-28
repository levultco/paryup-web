import { cacheLife } from "next/cache";
import { API_URL } from "@/lib/backend";

export type PublicEvent = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  endDate: string | null;
  location: string | null;
  address: string | null;
  coverImage: string | null;
  price: number | null;
  tags: string[];
  organization: {
    name: string;
    logo: string | null;
    isVerified: boolean;
  } | null;
  soldOut: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawEvent = Record<string, any>;

export function toPublicEvent(raw: RawEvent): PublicEvent {
  const tickets: RawEvent[] = Array.isArray(raw.eventTickets)
    ? raw.eventTickets
    : [];
  const actionable = tickets.filter((t) => t.availability?.isActionable);
  const soldOut =
    tickets.length > 0 &&
    tickets.every((t) => t.availability?.status === "SOLD_OUT");

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    date: raw.date,
    endDate: raw.endDate ?? null,
    location: raw.location ?? null,
    address: raw.address ?? null,
    coverImage: raw.coverImage ?? null,
    price:
      typeof raw.price === "number"
        ? raw.price
        : actionable.length > 0
          ? Math.min(...actionable.map((t) => Number(t.finalPrice ?? 0)))
          : null,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t: unknown) => typeof t === "string")
      : [],
    organization: raw.organization
      ? {
          name: raw.organization.name,
          logo: raw.organization.logo ?? null,
          isVerified: Boolean(raw.organization.isVerified),
        }
      : null,
    soldOut,
  };
}

export async function getUpcomingEvents(): Promise<PublicEvent[] | null> {
  "use cache";
  cacheLife("minutes");

  try {
    const res = await fetch(
      `${API_URL}/events/public?timeframe=upcoming&limit=50`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data.map(toPublicEvent);
  } catch {
    return null;
  }
}
