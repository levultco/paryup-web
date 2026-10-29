"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { PageHeader } from "@/components/organizations/ui";

/** Cabecera común del catálogo: plantillas de entrada y de evento. */
export function CatalogHeader({
  active,
  action,
}: {
  active: "tickets" | "events" | "reserved";
  action?: React.ReactNode;
}) {
  const { t } = useI18n();
  const { slug } = useOrg();
  const base = `/organizations/${slug}/catalog`;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("orgs.cat.title")}
        subtitle={t("orgs.cat.subtitle")}
        aside={action}
      />
      <div
        role="tablist"
        className="flex w-fit rounded-full border border-white/15 p-1"
      >
        {(
          [
            ["tickets", base],
            ["events", `${base}/events`],
            ["reserved", `${base}/reserved`],
          ] as const
        ).map(([key, href]) => (
          <Link
            key={key}
            href={href}
            role="tab"
            aria-selected={active === key}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active === key
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            {t(
              key === "tickets"
                ? "orgs.cat.tabTickets"
                : key === "events"
                  ? "orgs.cat.tabEvents"
                  : "orgs.cat.tabReserved",
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
