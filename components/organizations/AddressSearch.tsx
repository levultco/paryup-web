"use client";

import { useEffect, useRef, useState } from "react";

export type PickedPlace = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  mapboxPlaceId: string;
};

type Feature = {
  id: string;
  text?: string;
  place_name?: string;
  center?: [number, number];
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Buscador de direcciones (Mapbox): devuelve el lugar con sus coordenadas. */
export function AddressSearch({
  className,
  disabled,
  placeholder,
  onPick,
}: {
  className: string;
  disabled?: boolean;
  placeholder?: string;
  onPick: (place: PickedPlace) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Feature[]>([]);
  const [failed, setFailed] = useState<string | null>(null);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const q = query.trim();
    if (!TOKEN || q.length < 3) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          access_token: TOKEN,
          autocomplete: "true",
          language: "es",
          limit: "6",
          types: "poi,address,place,neighborhood,locality",
        });
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { features?: Feature[] };
        setFailed(null);
        setResults((data.features ?? []).filter((f) => f.center));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setFailed(err instanceof Error ? err.message : "error");
        setResults([]);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const pick = (f: Feature) => {
    const [longitude, latitude] = f.center!;
    skip.current = true;
    setQuery(f.place_name ?? f.text ?? "");
    setResults([]);
    onPick({
      name: (f.text ?? f.place_name ?? "").slice(0, 120),
      address: (f.place_name ?? f.text ?? "").slice(0, 300),
      latitude,
      longitude,
      mapboxPlaceId: f.id.slice(0, 200),
    });
  };

  return (
    <div className="relative">
      <input
        className={className}
        value={query}
        maxLength={300}
        disabled={disabled || !TOKEN}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
      />
      {!TOKEN || failed ? (
        <p className="mt-1 text-xs text-white/40">
          {!TOKEN
            ? "Buscador de direcciones no configurado."
            : `No se pudo buscar la dirección (${failed}).`}
        </p>
      ) : null}
      {results.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
          {results.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => pick(f)}
                className="block w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10"
              >
                {f.place_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
