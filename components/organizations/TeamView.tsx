"use client";

import {
  ChevronRightIcon,
  CloseIcon,
  LetterOpenedIcon,
  MagnifierIcon,
  PlainIcon,
} from "@/components/icons/solar";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Group } from "@/components/organizations/promoters-ui";
import { ListSkeleton } from "@/components/organizations/skeletons";
import {
  Card,
  dangerButton,
  PageHeader,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { orgFetch, teamErrorKey } from "@/lib/org-api";
import { intlLocale } from "@/lib/i18n";
import {
  ORG_PERMISSIONS,
  canManageRole,
  rolesAssignableBy,
  type OrgInvite,
  type OrgMember,
  type OrgRole,
} from "@/lib/organizations";
import { Select } from "@/components/organizations/select";
import { Flash } from "@/components/organizations/flash";

type FoundUser = {
  id: string;
  name: string;
  nickname: string | null;
  image: string | null;
};

function Person({
  user,
  children,
}: {
  user: { name: string; nickname: string | null; image: string | null };
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-full w-full object-cover" />
        ) : (
          user.name.trim().charAt(0).toUpperCase() || "P"
        )}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-white">
          {user.name}
        </span>
        {user.nickname ? (
          <span className="truncate text-xs text-white/45">
            @{user.nickname}
          </span>
        ) : null}
      </span>
      {children}
    </div>
  );
}

export function TeamView() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { slug, org, role, can } = useOrg();
  const canInvite = can(ORG_PERMISSIONS.staffInvite);
  const canRemove = can(ORG_PERMISSIONS.staffManage);
  const canChangeRole = can(ORG_PERMISSIONS.rolesManage);
  const assignable = rolesAssignableBy(role);

  const [members, setMembers] = useState<OrgMember[] | null>(null);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoundUser[] | null>(null);
  const [picked, setPicked] = useState<FoundUser | null>(null);
  const [inviteRole, setInviteRole] = useState<OrgRole>(
    assignable[assignable.length - 1] ?? "SECURITY",
  );
  const searchSeq = useRef(0);

  const load = useCallback(async () => {
    const [m, i] = await Promise.all([
      orgFetch<{ members: OrgMember[] }>(slug, "members"),
      canInvite
        ? orgFetch<{ invites: OrgInvite[] }>(slug, "invites")
        : Promise.resolve(null),
    ]);
    if (!m.ok || !m.data) return setLoadError(true);
    setMembers(m.data.members);
    if (i?.ok && i.data) setInvites(i.data.invites);
  }, [slug, canInvite]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Búsqueda con debounce; `searchSeq` descarta respuestas antiguas.
  useEffect(() => {
    if (!canInvite || picked || query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(null);
      return;
    }
    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/users/search?query=${encodeURIComponent(query.trim())}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (seq === searchSeq.current) setResults(res?.users ?? []);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, picked, canInvite]);

  const memberIds = new Set((members ?? []).map((m) => m.id));
  const pendingIds = new Set(
    invites.map((i) => i.targetUser?.id).filter(Boolean),
  );
  const shown = (results ?? []).filter(
    (u) => !memberIds.has(u.id) && u.id !== user?.id,
  );

  const fail = (status: number, data: unknown) =>
    setMessage({ tone: "error", text: t(teamErrorKey(status, data)) });

  const sendInvite = async () => {
    if (!picked || busy) return;
    setBusy("invite");
    setMessage(null);
    const res = await orgFetch(slug, "invites", {
      method: "POST",
      body: { targetUserId: picked.id, roleKey: inviteRole },
    });
    setBusy(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage({
      tone: "success",
      text: t("orgs.tm.sent", { name: picked.name }),
    });
    setPicked(null);
    setQuery("");
    await load();
  };

  const revoke = async (id: string) => {
    if (busy) return;
    setBusy(id);
    const res = await orgFetch(slug, `invites/${id}/revoke`, {
      method: "POST",
      body: {},
    });
    setBusy(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage(null);
    await load();
  };

  const changeRole = async (m: OrgMember, next: OrgRole) => {
    if (busy || next === m.role) return;
    setBusy(m.id);
    const res = await orgFetch(slug, `members/${encodeURIComponent(m.id)}`, {
      method: "PATCH",
      body: { roleKey: next },
    });
    setBusy(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage({ tone: "success", text: t("orgs.tm.roleChanged") });
    await load();
  };

  const remove = async (m: OrgMember) => {
    if (busy) return;
    setBusy(m.id);
    const res = await orgFetch(slug, `members/${encodeURIComponent(m.id)}`, {
      method: "DELETE",
    });
    setBusy(null);
    setConfirmRemove(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage({
      tone: "success",
      text: t("orgs.tm.removed", { name: m.name }),
    });
    await load();
  };

  const day = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("orgs.tm.title")}
        subtitle={t("orgs.tm.subtitle", { name: org.name })}
      />
      {!canInvite && !canRemove && !canChangeRole ? (
        <p className="text-sm text-white/45">{t("orgs.tm.readOnly")}</p>
      ) : null}
      <Flash message={message} />

      <Card title={t("orgs.tm.members")}>
        {loadError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-white/55">{t("orgs.tm.errLoad")}</p>
            <button
              type="button"
              className={pillButton}
              onClick={() => {
                setLoadError(false);
                void load();
              }}
            >
              {t("orgs.common.retry")}
            </button>
          </div>
        ) : !members ? (
          <ListSkeleton rows={3} />
        ) : (
          <ul className="flex flex-col divide-y divide-white/10">
            {members.map((m) => {
              const manageable =
                m.id !== user?.id && canManageRole(role, m.role);
              const options = rolesAssignableBy(role);
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Person user={m}>
                    {m.id === user?.id ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                        {t("orgs.common.you")}
                      </span>
                    ) : null}
                  </Person>
                  <div className="flex flex-wrap items-center gap-2">
                    {manageable && canChangeRole ? (
                      <Select
                        size="sm"
                        value={m.role}
                        disabled={busy === m.id}
                        label={t("orgs.tm.role")}
                        onChange={(v) => changeRole(m, v)}
                        options={options.map((r) => ({
                          value: r,
                          label: t(`orgs.role.${r}`),
                        }))}
                      />
                    ) : (
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                        {t(`orgs.role.${m.role}`)}
                      </span>
                    )}
                    {manageable && canRemove ? (
                      confirmRemove === m.id ? (
                        <>
                          <span className="text-xs text-white/55">
                            {t("orgs.tm.removeConfirm", { name: m.name })}
                          </span>
                          <button
                            type="button"
                            className={primaryButton}
                            disabled={busy === m.id}
                            onClick={() => remove(m)}
                          >
                            {t("orgs.common.confirm")}
                          </button>
                          <button
                            type="button"
                            className={pillButton}
                            onClick={() => setConfirmRemove(null)}
                          >
                            {t("orgs.common.cancel")}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={pillButton}
                          onClick={() => setConfirmRemove(m.id)}
                        >
                          {t("orgs.tm.remove")}
                        </button>
                      )
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {canInvite ? (
        <>
          <Card title={t("orgs.tm.invite")}>
            <p className="-mt-2 mb-5 text-sm text-white/50">
              {t("orgs.tm.inviteHint")}
            </p>
            {picked ? (
              <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
                <Person user={picked} />
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    size="sm"
                    value={inviteRole}
                    label={t("orgs.tm.role")}
                    onChange={setInviteRole}
                    options={assignable.map((r) => ({
                      value: r,
                      label: t(`orgs.role.${r}`),
                    }))}
                  />
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={busy === "invite" || pendingIds.has(picked.id)}
                    onClick={sendInvite}
                  >
                    <PlainIcon aria-hidden className="h-4 w-4" />
                    {busy === "invite"
                      ? t("orgs.tm.sending")
                      : t("orgs.tm.send")}
                  </button>
                  <button
                    type="button"
                    aria-label={t("orgs.common.cancel")}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-[background-color,transform] duration-100 hover:bg-white/[0.14] hover:text-white active:scale-90"
                    onClick={() => setPicked(null)}
                  >
                    <CloseIcon aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <MagnifierIcon
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/35"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("orgs.tm.search")}
                    aria-label={t("orgs.tm.search")}
                    className="h-12 w-full rounded-2xl bg-white/[0.07] pl-11 pr-11 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-white/20"
                  />
                  {query ? (
                    <button
                      type="button"
                      aria-label={t("orgs.common.cancel")}
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.12] text-white/70 transition-transform hover:text-white active:scale-90"
                    >
                      <CloseIcon aria-hidden className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                {query.trim().length >= 2 && !results ? (
                  <div className="mt-3">
                    <ListSkeleton rows={2} />
                  </div>
                ) : results ? (
                  shown.length > 0 ? (
                    <ul className="mt-3 divide-y divide-white/[0.07] overflow-hidden rounded-2xl bg-white/[0.05]">
                      {shown.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => setPicked(u)}
                            className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06] active:bg-white/[0.09]"
                          >
                            <Person user={u} />
                            <ChevronRightIcon
                              aria-hidden
                              className="h-4 w-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-center text-sm text-white/45">
                      {t("orgs.tm.noResults")}
                    </p>
                  )
                ) : null}
              </>
            )}
          </Card>

          <Group
            title={`${t("orgs.tm.pending")}${invites.length ? ` · ${invites.length}` : ""}`}
          >
            {invites.length === 0 ? (
              <li className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] text-white/70">
                  <LetterOpenedIcon aria-hidden className="h-5 w-5" />
                </span>
                <p className="text-[15px] font-medium text-white/85">
                  {t("orgs.tm.noPending")}
                </p>
              </li>
            ) : (
              invites.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
                >
                  <Person
                    user={
                      i.targetUser ?? {
                        name: i.email ?? "—",
                        nickname: null,
                        image: null,
                      }
                    }
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-xs text-white/70">
                      {t(`orgs.role.${i.roleKey}`)}
                    </span>
                    <span className="text-xs text-white/45">
                      {t("orgs.tm.expires", {
                        date: day.format(new Date(i.expiresAt)),
                      })}
                    </span>
                    <button
                      type="button"
                      className={dangerButton}
                      disabled={busy === i.id}
                      onClick={() => revoke(i.id)}
                    >
                      {t("orgs.tm.revoke")}
                    </button>
                  </div>
                </li>
              ))
            )}
          </Group>
        </>
      ) : null}
    </div>
  );
}
