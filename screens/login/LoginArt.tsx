import { getUpcomingEvents } from "@/lib/events";

export async function LoginArt() {
  const events = await getUpcomingEvents().catch(() => null);
  const covers = (events ?? []).filter((e) => e.coverImage).slice(0, 12);
  if (covers.length < 2) return null;

  const half = Math.ceil(covers.length / 2);
  const columns = [covers.slice(0, half), covers.slice(half)];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex justify-center gap-5 px-8"
    >
      {columns.map((col, c) => (
        <div key={c} className="w-1/2 overflow-hidden">
          <div
            className="login-col flex flex-col gap-5"
            style={{
              animation: `${c ? "login-scroll-down" : "login-scroll-up"} ${50 + c * 10}s linear infinite`,
            }}
          >
            {[...col, ...col].map((event, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${event.id}-${i}`}
                src={event.coverImage!}
                alt=""
                className="aspect-[4/5] w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
