"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { APPLE_EASE } from "@/components/organizations/promoters-ui";
import { PageHeader } from "@/components/organizations/ui";

const KEYS = ["tickets", "events", "reserved"] as const;

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
  const base = `/${slug}/catalog`;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("orgs.cat.title")}
        subtitle={t("orgs.cat.subtitle")}
        aside={action}
      />
      <div
        role="tablist"
        className="relative inline-grid w-fit grid-cols-3 rounded-full bg-white/[0.08] p-[3px]"
      >
        <span
          aria-hidden
          className="absolute bottom-[3px] left-[3px] top-[3px] w-[calc((100%-6px)/3)] rounded-full bg-white/[0.18] shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-300 motion-reduce:transition-none"
          style={{
            transform: `translateX(${KEYS.indexOf(active) * 100}%)`,
            transitionTimingFunction: APPLE_EASE,
          }}
        />
        {KEYS.map((key) => (
          <Link
            key={key}
            href={key === "tickets" ? base : `${base}/${key}`}
            role="tab"
            aria-selected={active === key}
            className={`relative z-10 flex h-8 items-center justify-center px-5 text-[13px] font-medium transition-colors ${
              active === key
                ? "text-white"
                : "text-white/50 hover:text-white/80"
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
