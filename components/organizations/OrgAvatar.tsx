import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import type { OrgSummary } from "@/lib/organizations";

export function OrgAvatar({
  org,
  size = 56,
}: {
  org: Pick<OrgSummary, "name" | "logo">;
  size?: number;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10"
    >
      {org.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={org.logo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span
          style={{ fontSize: size * 0.4 }}
          className="font-display font-semibold text-white"
        >
          {org.name.trim().charAt(0).toUpperCase() || "P"}
        </span>
      )}
    </span>
  );
}

export function OrgName({
  org,
}: {
  org: Pick<OrgSummary, "name" | "isVerified">;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="truncate">{org.name}</span>
      {org.isVerified ? (
        <VerifiedBadge type="verified" className="h-5 w-5 shrink-0" />
      ) : null}
    </span>
  );
}
